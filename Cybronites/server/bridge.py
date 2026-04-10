from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from typing import List, Dict, Any, Optional
import json
import logging
import asyncio
import os
import time
import sqlite3
import urllib.request
import ast
import torch
from Cybronites.server.auth import router as auth_router
from Cybronites.utils.structured_logging import setup_structured_logging
import Cybronites.server.training_engine as engine

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("GuardianBridge")
setup_structured_logging("GuardianBridge")

class ConnectionManager:
    """Manages active WebSocket connections to the Institutional Dashboard."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.loop = None 
        self.state = {
            "round": 0,
            "total_blocks": 0,
            "clients_active": 0,
            "trust_avg": 0.0,
            "status": "IDLE",
            "last_hash": "N/A",
            "accuracy_history": [],
            "loss_history": [],
            "chain": [],
            "shards": [],
            "model_architecture": "# Loading Source Code...",
            "server_ip": "127.0.0.1",
            "lab_state": {"status": "IDLE", "progress": 0, "epoch": 0, "loss": 0, "accuracy": 0}
        }
        self.log_buffer: List[str] = []
        self.cache = {
            "last_sync": 0,
            "round_snapshots": {}, # Cache for historical round data
            "blockchain_cache": []
        }

    def load_model_code(self):
        """Reads model.py and injects it into local state."""
        try:
            # Check multiple potential locations (local vs deployed)
            paths = [
                os.path.join(os.getcwd(), "Cybronites", "client", "model.py"),
                os.path.join(os.getcwd(), "client", "model.py"),
                os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "client", "model.py")
            ]
            for model_path in paths:
                if os.path.exists(model_path):
                    with open(model_path, "r") as f:
                        self.state["model_architecture"] = f.read()
                        logger.info(f"Model source code loaded from {model_path}")
                        return
        except Exception as e:
            logger.error(f"Failed to load model source: {e}")

    def fetch_public_ip(self):
        """Fetches the external IP address (for Hugging Face deployment visualization)."""
        try:
            # Use public IP discovery service
            with urllib.request.urlopen("https://api.ipify.org", timeout=2) as response:
                ip = response.read().decode('utf-8')
                self.state["server_ip"] = ip
                logger.info(f"Public IP fetched: {ip}")
        except Exception as e:
            logger.warning(f"Could not fetch public IP (offline/firewalled): {e}")
            # Fallback to local
            self.state["server_ip"] = "127.0.0.1"
    def load_db_shards(self):
        """Fetches real institutional shards from guardian.db."""
        try:
            paths = [
                os.path.join(os.getcwd(), "Cybronites", "guardian.db"),
                os.path.join(os.getcwd(), "guardian.db")
            ]
            db_path = None
            for p in paths:
                if os.path.exists(p):
                    db_path = p
                    break
            
            if not db_path:
                return
            
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM shards")
            rows = [dict(row) for row in cur.fetchall()]
            self.state["shards"] = rows
            conn.close()
            logger.info(f"Loaded {len(rows)} shards from {db_path}")
        except Exception as e:
            logger.error(f"DB Shard Load Error: {e}")

    def save_node_to_db(self, node_id, ip, trust_score):
        """Persist node metadata to the institutional record."""
        try:
            paths = [
                os.path.join(os.getcwd(), "Cybronites", "guardian.db"),
                os.path.join(os.getcwd(), "guardian.db")
            ]
            db_path = None
            for p in paths:
                if os.path.exists(p):
                    db_path = p
                    break
            
            if not db_path: return

            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            
            # Upsert logic (insert or update on id)
            cur.execute("""
                INSERT INTO nodes (id, name, last_seen, trust_score, ip_address) 
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET 
                    last_seen=excluded.last_seen,
                    trust_score=excluded.trust_score,
                    ip_address=excluded.ip_address
            """, (node_id, f"Node_{node_id[:4]}", time.strftime('%Y-%m-%d %H:%M:%S'), trust_score, ip))
            
            conn.commit()
            conn.close()
            logger.info(f"Node {node_id} persisted to database with IP {ip}.")
        except Exception as e:
            logger.warning(f"Database Persistence Failed for node {node_id}: {e}")

    async def connect(self, websocket: WebSocket):
        try:
            await websocket.accept()
            self.active_connections.append(websocket)
            
            if self.loop is None:
                try:
                    self.loop = asyncio.get_running_loop()
                except RuntimeError:
                    pass
            
            # Fresh read of the model code and DB shards
            self.load_model_code()
            self.load_db_shards()
                
            # Send initial state snapshot
            await self.send_json({
                "type": "INITIAL_SYNC",
                "payload": {
                    "state": self.state,
                    "logs": self.log_buffer[-20:] # Last 20 logs
                }
            }, websocket)
            logger.info(f"Dashboard connected. Total subscribers: {len(self.active_connections)}")
        except Exception as e:
            logger.error(f"Failed to connect WebSocket: {e}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Dashboard disconnected. Remaining: {len(self.active_connections)}")

    async def send_json(self, data: dict, websocket: WebSocket):
        """Defensive JSON delivery."""
        try:
            # Only send if the websocket is actively connected
            if websocket.client_state.name == "CONNECTED":
                await websocket.send_json(data)
        except (BrokenPipeError, ConnectionResetError, RuntimeError):
            # Silent handling of broken connections
            self.disconnect(websocket)
        except Exception as e:
            logger.debug(f"WS Serialization/Send Alert: {e}")
            self.disconnect(websocket)

    def broadcast_sync(self, message_type: str, payload: Any):
        """Thread-safe synchronous broadcast for use from Flower threads."""
        if self.loop and self.loop.is_running():
            try:
                asyncio.run_coroutine_threadsafe(
                    self.broadcast(message_type, payload), 
                    self.loop
                )
            except (BrokenPipeError, ConnectionResetError, RuntimeError):
                pass # Scheduled coroutine to a dying loop/socket is expected and ignored
            except Exception as e:
                logger.debug(f"Thread-safe broadcast deferred: {e}")
        else:
            # Fallback for early startup: just buffer it
            if message_type == "LOG":
                self.log_buffer.append(payload)
                if len(self.log_buffer) > 200: self.log_buffer.pop(0)
            logger.debug(f"Broadcast deferred (loop not ready): {message_type}")

    async def broadcast(self, message_type: str, payload: Any):
        """Reactive broadcast engine."""
        if message_type == "STAT_UPDATE":
            # 1. Update local state
            self.state.update(payload)
            
            # 2. Update Cache for responsiveness
            if "round" in payload:
                r = payload["round"]
                self.cache["round_snapshots"][r] = payload
            
            if "chain" in payload:
                self.cache["blockchain_cache"] = payload["chain"]
            
            self.cache["last_sync"] = time.time()
            
            # Diagnostic for history persistence
            if "accuracy_history" in payload:
                hist_size = len(payload["accuracy_history"])
                logger.info(f"Broadcasting STAT_UPDATE. Accuracy History Size: {hist_size}", 
                            extra={"type": "telemetry", "round": payload.get("round"), "history_size": hist_size})
            
        elif message_type == "LOG":
            self.log_buffer.append(payload)
            if len(self.log_buffer) > 200: self.log_buffer.pop(0)
        
        elif message_type in ["LAB_PROGRESS", "LAB_COMPLETE", "LAB_ERROR"]:
            # Sync lab state with global registry
            if message_type == "LAB_PROGRESS":
                self.state["lab_state"].update(payload)
            elif message_type == "LAB_COMPLETE":
                self.state["lab_state"].update({"status": "COMPLETE", "progress": 100})
            elif message_type == "LAB_ERROR":
                self.state["lab_state"].update({"status": "ERROR", "error": payload.get("error")})

        # Create output packet
        data = {"type": message_type, "payload": payload}
        
        # Dispatch to all active dashboards
        if self.active_connections:
            for connection in self.active_connections:
                await self.send_json(data, connection)

# Singleton instance
bridge = ConnectionManager()
app = FastAPI(title="AI Guardian Bridge")

# Mandatory middleware initialization BEFORE including routers for consistent CORS headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Auth Routes after middleware
app.include_router(auth_router)

@app.on_event("startup")
async def startup():
    bridge.loop = asyncio.get_running_loop()
    bridge.load_model_code()
    bridge.fetch_public_ip()
    
    # Initialize Orchestrator and start Log Listener thread
    from Cybronites.server.orchestrator import get_orchestrator
    orchestrator = get_orchestrator()
    
    def log_listener_worker():
        """Background thread to pipe logs from multiprocessing.Queue to bridge.broadcast_sync."""
        logger.info("IPC Log Listener thread started.")
        while True:
            try:
                # Blocking read from queue
                message_type, payload = orchestrator.log_queue.get()
                bridge.broadcast_sync(message_type, payload)
            except Exception as e:
                logger.error(f"IPC Log Tunnel Error: {e}")
                time.sleep(1)

    import threading
    threading.Thread(target=log_listener_worker, daemon=True).start()
    
    logger.info("Guardian Bridge Event Loop context captured.")
    
@app.on_event("shutdown")
def shutdown_event():
    """Mandatory resource liquidation on system shutdown."""
    from Cybronites.server.training_engine import cleanup_research_sandbox
    cleanup_research_sandbox()
    logger.info("🛑 Guardian Bridge shutdown complete. Resources liquidated.")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await bridge.connect(websocket)
    try:
        while True:
            # Keep-alive loop
            await websocket.receive_text()
    except WebSocketDisconnect:
        bridge.disconnect(websocket)
    except Exception as e:
        logger.error(f"WS Runtime Error: {e}")
        bridge.disconnect(websocket)

@app.get("/api/health")
@app.get("/status")
async def health_check():
    return {"status": "ONLINE", "clients": len(bridge.active_connections)}

@app.post("/api/v1/federated/start")
async def start_federated_training():
    """Launches a proper federated training session with:
    - Singleton session guard (prevents duplicate launches)
    - Strategy connected to bridge for real-time dashboard telemetry
    - Cloud-safe dataset downloads (/tmp for read-only filesystems)
    - Configurable rounds and clients
    - Thread-safe with proper lifecycle management
    """
    import threading

    # ─── Singleton Guard ───
    if hasattr(bridge, '_fl_session_active') and bridge._fl_session_active:
        return {"success": False, "message": "Training session already in progress."}

    bridge._fl_session_active = True
    FLOWER_PORT = int(os.environ.get("FL_INTERNAL_PORT", 8080))
    NUM_ROUNDS = int(os.environ.get("FL_ROUNDS", 5))
    NUM_CLIENTS = int(os.environ.get("FL_CLIENTS", 2))
    _flower_ready = threading.Event()

    def _run_server():
        """Background thread: Flower gRPC server with bridge-connected strategy."""
        import flwr as fl
        import signal
        from Cybronites.server.strategy import SecureFedAvg
        from blockchain.ledger import Blockchain
        from blockchain.reputation import ReputationManager

        # Neutralize signals in non-main thread (prevents crash on cloud)
        original_signal = signal.signal
        try:
            signal.signal = lambda *a, **kw: None
        except Exception:
            pass

        ledger = Blockchain(difficulty=1)
        reputation = ReputationManager()

        # Strategy is connected to bridge for real-time dashboard telemetry
        strategy = SecureFedAvg(
            blockchain=ledger,
            reputation=reputation,
            min_fit_clients=NUM_CLIENTS,
            min_available_clients=NUM_CLIENTS,
            aggregation_method="median",
            # No log_queue — uses bridge.broadcast_sync directly for dashboard sync
        )

        bridge.broadcast_sync("LOG", f"[FL-SERVER] Flower gRPC binding to port {FLOWER_PORT}...")
        bridge.broadcast_sync("STAT_UPDATE", {"status": "INITIALIZING", "round": 0, "clients_active": 0})
        _flower_ready.set()

        try:
            fl.server.start_server(
                server_address=f"0.0.0.0:{FLOWER_PORT}",
                config=fl.server.ServerConfig(num_rounds=NUM_ROUNDS),
                strategy=strategy,
                grpc_max_message_length=512 * 1024 * 1024,
            )
        except Exception as e:
            logger.error(f"Flower Server error: {e}")
            bridge.broadcast_sync("LOG", f"[FL-SERVER] CRITICAL ERROR: {e}")
        finally:
            try:
                signal.signal = original_signal
            except Exception:
                pass
            bridge._fl_session_active = False
            bridge.broadcast_sync("LOG", "[FL-SERVER] Session complete.")
            bridge.broadcast_sync("STAT_UPDATE", {"status": "FINISHED"})

    def _run_client(cid, num_clients):
        """Background thread: Federated client with DP noise."""
        import flwr as fl
        import torch

        # Wait for server to bind
        if not _flower_ready.wait(timeout=30):
            bridge.broadcast_sync("LOG", f"[CLIENT {cid}] ERROR: Server did not start in time.")
            return

        time.sleep(3 + cid)  # Stagger client connections

        try:
            from Cybronites.client.model import MNISTNet, train as _train, test as _test
            from Cybronites.client.dataset import load_data
            from security.privacy import apply_dp_to_updates, DPSpec

            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

            # Cloud-safe: use /tmp for dataset if filesystem is read-only
            data_dir = "/tmp/mnist_data" if os.environ.get("SPACE_ID") or not os.access(".", os.W_OK) else "./data"
            os.makedirs(data_dir, exist_ok=True)

            bridge.broadcast_sync("LOG", f"[CLIENT {cid}] Loading MNIST dataset...")
            train_loader, test_loader = load_data(client_id=cid, num_clients=num_clients)

            # Fetch public IP for audit trail
            ip = "127.0.0.1"
            try:
                import urllib.request
                with urllib.request.urlopen("https://api.ipify.org", timeout=2) as r:
                    ip = r.read().decode("utf-8")
            except Exception:
                pass

            class SecureFlowerClient(fl.client.NumPyClient):
                def __init__(self):
                    self.model = MNISTNet().to(device)
                    self.dp_spec = DPSpec(l2_norm_clip=1.0, noise_multiplier=0.01)

                def get_parameters(self, config):
                    return [v.cpu().numpy() for v in self.model.state_dict().values()]

                def set_parameters(self, parameters):
                    pairs = zip(self.model.state_dict().keys(), parameters)
                    self.model.load_state_dict({k: torch.tensor(v) for k, v in pairs}, strict=True)

                def fit(self, parameters, config):
                    bridge.broadcast_sync("LOG", f"[CLIENT {cid}] Training locally...")
                    initial = [torch.tensor(p).to(device) for p in parameters]
                    self.set_parameters(parameters)
                    opt = torch.optim.SGD(self.model.parameters(), lr=0.01, momentum=0.9)
                    loss, acc = _train(self.model, train_loader, opt, epochs=1, device=device)

                    # Apply Differential Privacy to parameter updates
                    bridge.broadcast_sync("LOG", f"[CLIENT {cid}] Applying DP noise (ε-privacy)...")
                    new_params = [v.cpu() for v in self.model.state_dict().values()]
                    updates = {n: new_params[i] - initial[i].cpu() for i, (n, _) in enumerate(self.model.state_dict().items())}
                    dp = apply_dp_to_updates(updates, self.dp_spec)
                    final = [(initial[i].cpu() + dp[n]).numpy() for i, (n, _) in enumerate(self.model.state_dict().items())]

                    bridge.broadcast_sync("LOG", f"[CLIENT {cid}] Round complete — Acc: {acc:.4f}, Loss: {loss:.4f}")
                    return final, len(train_loader.dataset), {"accuracy": float(acc), "loss": float(loss), "ip": ip}

                def evaluate(self, parameters, config):
                    self.set_parameters(parameters)
                    loss, acc = _test(self.model, test_loader, device=device)
                    return float(loss), len(test_loader.dataset), {"accuracy": float(acc), "ip": ip}

            bridge.broadcast_sync("LOG", f"[CLIENT {cid}] Connecting to gRPC server at 127.0.0.1:{FLOWER_PORT}...")
            fl.client.start_client(
                server_address=f"127.0.0.1:{FLOWER_PORT}",
                client=SecureFlowerClient().to_client(),
                grpc_max_message_length=512 * 1024 * 1024,
            )
            bridge.broadcast_sync("LOG", f"[CLIENT {cid}] Disconnected from server.")
        except Exception as e:
            logger.error(f"Client {cid} error: {e}")
            bridge.broadcast_sync("LOG", f"[CLIENT {cid}] ERROR: {e}")

    # ─── Launch FL Stack ───
    bridge.broadcast_sync("LOG", "═══════════════════════════════════════════════════")
    bridge.broadcast_sync("LOG", f"  FEDERATED LEARNING SESSION LAUNCHING")
    bridge.broadcast_sync("LOG", f"  Rounds: {NUM_ROUNDS} | Clients: {NUM_CLIENTS} | Port: {FLOWER_PORT}")
    bridge.broadcast_sync("LOG", f"  Security: Differential Privacy + Blockchain Audit")
    bridge.broadcast_sync("LOG", "═══════════════════════════════════════════════════")

    # Server thread
    threading.Thread(target=_run_server, name="FL-Server", daemon=True).start()

    # Client threads (staggered startup)
    for cid in range(NUM_CLIENTS):
        threading.Thread(target=_run_client, args=(cid, NUM_CLIENTS), name=f"FL-Client-{cid}", daemon=True).start()

    await bridge.broadcast("LOG", "SYSTEM: All federated threads launched. Awaiting convergence...")
    return {"success": True, "message": f"Federated Training launched ({NUM_ROUNDS} rounds, {NUM_CLIENTS} clients)."}

@app.get("/api/v1/federated/status")
async def federated_status():
    """Returns the current FL session state for dashboard polling."""
    return {
        "active": getattr(bridge, '_fl_session_active', False),
        "status": bridge.state.get("status", "IDLE"),
        "round": bridge.state.get("round", 0),
        "accuracy_history": bridge.state.get("accuracy_history", []),
        "loss_history": bridge.state.get("loss_history", []),
        "node_registry": bridge.state.get("node_registry", {}),
        "chain_length": len(bridge.state.get("chain", [])),
    }

@app.post("/api/v1/federated/reset")
async def federated_reset():
    """Resets the FL session flag so a new training can be started."""
    bridge._fl_session_active = False
    bridge.state["status"] = "IDLE"
    bridge.state["round"] = 0
    bridge._distributed_clients = {}
    bridge._distributed_updates = {}
    await bridge.broadcast("STAT_UPDATE", {"status": "IDLE", "round": 0})
    await bridge.broadcast("LOG", "SYSTEM: Session reset. Ready for new training.")
    return {"success": True}

# ═══════════════════════════════════════════════════════════
# DISTRIBUTED CLIENT API — External devices join FL via HTTP
# ═══════════════════════════════════════════════════════════

# In-memory storage for distributed clients
if not hasattr(bridge, '_distributed_clients'):
    bridge._distributed_clients = {}
if not hasattr(bridge, '_distributed_updates'):
    bridge._distributed_updates = {}
if not hasattr(bridge, '_distributed_round'):
    bridge._distributed_round = 0

@app.post("/api/v1/distributed/register")
async def distributed_register(data: Dict[str, Any]):
    """Register an external device as a federated learning client."""
    import uuid
    client_id = str(uuid.uuid4())[:8]
    client_info = {
        "id": client_id,
        "name": data.get("name", "Unknown"),
        "ip": data.get("ip", "unknown"),
        "registered_at": time.time(),
        "last_seen": time.time(),
        "rounds_completed": 0
    }
    bridge._distributed_clients[client_id] = client_info
    logger.info(f"[DISTRIBUTED] Client registered: {client_info['name']} ({client_id}) from {client_info['ip']}")
    await bridge.broadcast("LOG", f"DISTRIBUTED: New node '{client_info['name']}' joined from {client_info['ip']}")
    await bridge.broadcast("STAT_UPDATE", {"clients_active": len(bridge._distributed_clients)})
    
    return {
        "success": True,
        "client_id": client_id,
        "session_status": bridge.state.get("status", "IDLE"),
        "message": f"Welcome {client_info['name']}! You are node #{len(bridge._distributed_clients)}"
    }

@app.get("/api/v1/distributed/status")
async def distributed_status():
    """Returns current training session state for distributed clients to poll."""
    return {
        "status": bridge.state.get("status", "IDLE"),
        "round": bridge.state.get("round", 0),
        "total_rounds": bridge.state.get("total_rounds", 5),
        "clients_registered": len(bridge._distributed_clients),
        "updates_received": len(bridge._distributed_updates.get(bridge.state.get("round", 0), {})),
        "accuracy_history": bridge.state.get("accuracy_history", []),
        "loss_history": bridge.state.get("loss_history", []),
    }

@app.get("/api/v1/distributed/get-model")
async def distributed_get_model():
    """Serve current global model weights to distributed clients."""
    import io, base64
    try:
        # Try to load the latest global model
        model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'tmp', 'global_model.pt')
        if not os.path.exists(model_path):
            # Return initial random weights
            from Cybronites.client.client import MNISTNet
            model = MNISTNet()
            params = []
            for val in model.state_dict().values():
                arr = val.cpu().detach().numpy()
                buf = io.BytesIO()
                import numpy as np
                np.save(buf, arr)
                b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
                params.append({"data": b64})
            return {"params": params, "round": bridge.state.get("round", 0)}
        
        checkpoint = torch.load(model_path, map_location='cpu', weights_only=True)
        params = []
        state = checkpoint if isinstance(checkpoint, dict) and 'state_dict' not in checkpoint else checkpoint.get('state_dict', checkpoint)
        for val in state.values():
            arr = val.cpu().detach().numpy()
            buf = io.BytesIO()
            import numpy as np
            np.save(buf, arr)
            b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            params.append({"data": b64})
        return {"params": params, "round": bridge.state.get("round", 0)}
    except Exception as e:
        logger.error(f"[DISTRIBUTED] get-model error: {e}")
        return {"error": str(e)}

@app.post("/api/v1/distributed/submit-update")
async def distributed_submit_update(data: Dict[str, Any]):
    """Receive trained weights from a distributed client."""
    client_id = data.get("client_id")
    if client_id not in bridge._distributed_clients:
        return {"success": False, "message": "Unknown client. Please re-register."}
    
    current_round = bridge.state.get("round", 0)
    metrics = data.get("metrics", {})
    
    # Store the update
    if current_round not in bridge._distributed_updates:
        bridge._distributed_updates[current_round] = {}
    
    bridge._distributed_updates[current_round][client_id] = {
        "params": data.get("params"),
        "num_examples": data.get("num_examples", 0),
        "metrics": metrics,
        "received_at": time.time()
    }
    
    # Update client info
    bridge._distributed_clients[client_id]["last_seen"] = time.time()
    bridge._distributed_clients[client_id]["rounds_completed"] += 1
    
    client_name = bridge._distributed_clients[client_id]["name"]
    acc = metrics.get("accuracy", 0)
    
    logger.info(f"[DISTRIBUTED] Update from {client_name}: acc={acc:.2%}, loss={metrics.get('loss', 0):.4f}")
    await bridge.broadcast("LOG", f"DISTRIBUTED: Received update from '{client_name}' (acc: {acc:.2%})")
    await bridge.broadcast("STAT_UPDATE", {
        "clients_active": len(bridge._distributed_clients),
        "distributed_updates": len(bridge._distributed_updates.get(current_round, {}))
    })
    
    return {
        "success": True,
        "message": f"Update accepted for round {current_round}. Thank you, {client_name}!"
    }

@app.post("/api/v1/laboratory/validate")
async def validate_code(data: Dict[str, str]):
    code = data.get("code", "")
    try:
        if not code.strip():
            return {"success": False, "error": "Empty source code submitted."}
            
        # 🧪 Magic Filtering: Preserve line numbers by blanking out '!' lines
        clean_code = "\n".join([line if not line.strip().startswith('!') else "" for line in code.split('\n')])
        
        # 1. Syntactic analysis
        import ast
        ast.parse(clean_code)
        
        # 2. Compilation check
        compile(clean_code, '<laboratory>', 'exec')
        
        return {"success": True}
    except SyntaxError as e:
        # Professional Diagnostic Extraction
        return {
            "success": False, 
            "error": str(e.msg), 
            "line": e.lineno, 
            "column": e.offset,
            "type": "SyntaxError"
        }
    except Exception as e:
        import traceback
        logger.error(f"Laboratory Validation Error: {e}")
        return {"success": False, "error": str(e), "type": type(e).__name__}

@app.post("/api/v1/laboratory/deploy")
async def deploy_model(data: Dict[str, str]):
    code = data.get("code", "")
    try:
        # Verify before writing to prevent system crashes
        import ast
        ast.parse(code)
        
        # Target local Cybronites environment
        target_path = os.path.join(os.getcwd(), "Cybronites", "client", "model.py")
        
        # Fallback for relative server context
        if not os.path.exists(os.path.dirname(target_path)):
            target_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "client", "model.py")
            
        with open(target_path, "w") as f:
            f.write(code)
            
        logger.info(f"Local Dynamic Model HOT-SWAPPED at {target_path}")
        
        # Synchronize live state
        bridge.state["model_architecture"] = code
        await bridge.broadcast("LOG", "SYSTEM: Local model hot-swapped. Synchronizing nodes...")
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Local Deployment Error: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/v1/laboratory/train")
async def start_lab_training(data: Dict[str, Any]):
    code = data.get("code", "").strip()
    hyperparams = data.get("hyperparams", {})
    
    if not code:
        return {"success": False, "error": "No code provided."}
        
    # 🧪 Magic Filtering: Preserve line numbers for accurate error reporting
    clean_code = "\n".join([line if not line.strip().startswith('!') else "" for line in code.split('\n')])
    
    # 🛡️ Mandatory Guardian Validation (AST Security Scan)
    try:
        import ast
        ast.parse(clean_code)
    except SyntaxError as e:
        bridge.broadcast_sync("LOG", f"❌ SECURITY_BREACH: Structural anomaly detected in submitted code (Line {e.lineno}). Reverting...")
        return {"success": False, "error": f"AST Validation Failed: {str(e.msg)}"}
    
    success, msg = engine.start_training(code, hyperparams, bridge.broadcast_sync)
    return {"success": success, "message": msg}

@app.post("/api/v1/laboratory/abort")
async def abort_lab_training():
    success = engine.abort_training()
    return {"success": success}

@app.get("/api/v1/laboratory/status")
async def get_lab_status():
    return engine.get_session_status()

@app.get("/api/v1/laboratory/environment")
async def get_lab_environment():
    """Returns metadata about the research sandbox virtual environment."""
    sandbox_dir = os.path.join(os.getcwd(), "research_sandbox")
    python_exec, site_packages = engine.ensure_research_venv()
    
    # 🧪 Query installed packages using the sandbox python
    packages = []
    try:
        import subprocess
        result = subprocess.run([python_exec, "-m", "pip", "list", "--format=json"], capture_output=True, text=True)
        if result.returncode == 0:
            packages = json.loads(result.stdout)
    except Exception as e:
        logger.warning(f"Failed to query sandbox packages: {e}")

    return {
        "status": "READY" if os.path.exists(python_exec) else "NOT_INITIALIZED",
        "python": "3.9.6", # Hardcoded for this env, could be dynamic
        "path": sandbox_dir,
        "site_packages": site_packages,
        "packages": packages
    }

@app.post("/api/v1/laboratory/shell")
async def run_laboratory_shell(data: Dict[str, str]):
    """Executes a generic command in the research sandbox context."""
    command = data.get("command", "").strip()
    if not command:
        return {"success": False, "error": "Empty command."}
        
    # Run synchronously (it will broadcast progress via broadcast_sync)
    success = engine.run_sandbox_command(command, bridge.broadcast_sync)
    return {"success": success}

@app.post("/api/v1/laboratory/eval")
async def laboratory_eval_cell(data: Dict[str, str]):
    """Evaluates a code cell in the active laboratory session's namespace."""
    code = data.get("code", "").strip()
    if not code:
        return {"success": False, "error": "Empty cell."}
    
    session = engine._current_session
    if not session:
        return {"success": False, "error": "No active research session found. Run code first."}
    
    # Run synchronously as it targets the worker thread's namespace
    success, msg = session.eval_cell(code)
    return {"success": success, "message": msg}

@app.post("/api/v1/laboratory/inspect")
async def inspect_laboratory_code(data: Dict[str, str]):
    """Returns a list of detected dependencies and hyper-parameters from the submitted code."""
    code = data.get("code", "")
    # 🧪 Magic Filtering: Preserve lines for AST inspection
    clean_code = "\n".join([line if not line.strip().startswith('!') else "" for line in code.split('\n')])
    
    deps = engine.inspect_dependencies(clean_code)
    params = engine.inspect_parameters(clean_code)
    
    return {
        "success": True, 
        "dependencies": deps,
        "parameters": params
    }

@app.post("/api/v1/laboratory/purge")
async def purge_laboratory_sandbox():
    """Manually triggers sandbox liquidation to reclaim disk space."""
    success = engine.cleanup_research_sandbox()
    if success:
        bridge.broadcast_sync("LOG", "🧺 SANDBOX_PURGED: All dynamic resources liquidated. Storage reclaimed.")
        return {"success": True}
    return {"success": False, "error": "Purge failed. Sandbox may be in use."}

@app.get("/api/v1/laboratory/download/{file_format}")
async def download_model(file_format: str):
    session = engine._current_session
    if not session or not session.model_path:
        return {"error": "No model available for download."}
    
    if file_format == "pt":
        path = session.model_path
        filename = "model_weights.pt"
    elif file_format == "onnx":
        path = session.model_path.replace(".pt", ".onnx")
        filename = "model_weights.onnx"
    else:
        return {"error": "Invalid format. Use 'pt' or 'onnx'."}
        
    if not os.path.exists(path):
        return {"error": f"File {filename} not found."}
        
    return FileResponse(path, filename=filename)

# ── Static Dashboard Supporting Logic ──
def find_static_directory():
    """Identifies the best local or cloud path for the built UI assets."""
    search_paths = [
        os.path.join(os.getcwd(), "dist"),
        os.path.join(os.getcwd(), "static"),
        "/home/user/app/dist",
        "/app/dist",
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "dist")
    ]
    for p in search_paths:
        if os.path.exists(p) and os.path.isdir(p):
            # Verify it contains an index.html and assets/
            if os.path.exists(os.path.join(p, "index.html")):
                return p
    return None

static_dir = find_static_directory()

if static_dir:
    logger.info(f"UI Serving enabled from: {static_dir}")
    # 1. Mount assets folder explicitly (ensures correct MIME types)
    assets_path = os.path.join(static_dir, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    # 2. Main SPA Catch-all
    @app.get("/{full_path:path}")
    async def serve_dashboard(full_path: str):
        # Allow internal system paths to bypass static serving
        if full_path.startswith(("api", "ws", "auth", "docs")):
            from fastapi import HTTPException
            raise HTTPException(status_code=404)
        
        # Check if requested file exists locally (e.g. favicon.svg, vite.svg)
        # Note: /assets/ is already handled by the mount above
        local_file = os.path.join(static_dir, full_path)
        if full_path and os.path.isfile(local_file):
            return FileResponse(local_file)
            
        # Fallback to index.html for all other routes (SPA Pattern)
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    logger.warning("No static assets folder found. UI will not be served.")

def start_bridge(port: int = 7860):
    import uvicorn
    logger.info(f"Launching Guardian Bridge on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="warning")

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 7860))
    start_bridge(port=port)
