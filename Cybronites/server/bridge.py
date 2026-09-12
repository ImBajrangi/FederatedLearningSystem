import sys
import os

# Ensure repository root is on sys.path for direct script execution
_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from typing import List, Dict, Any, Optional
import json
import logging
import asyncio
import time
import sqlite3
import hashlib
import urllib.request
from Cybronites.server.auth import router as auth_router
from Cybronites.utils.structured_logging import setup_structured_logging
import Cybronites.server.training_engine as engine
from Cybronites.server.distributed_coordinator import DistributedCoordinator, params_to_b64

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
            "server_ip": "127.0.0.1" 
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
                        code_str = f.read()
                        self.state["model_architecture"] = code_str
                        code_hash = hashlib.sha256(code_str.encode("utf-8")).hexdigest()
                        self.state["active_training_code"] = {
                            "source": "global",
                            "name": "Global Model Specification",
                            "filename": os.path.basename(model_path),
                            "code": code_str,
                            "code_hash": f"0x{code_hash[:16]}",
                            "status": self.state.get("status", "IDLE"),
                            "dataset": "MNIST (28x28) / Federated Partition",
                        }
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
        """Fetches real FL node data from guardian.db nodes table."""
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
            cur.execute(
                """SELECT id, name, ip_address, trust_score, last_seen
                   FROM nodes ORDER BY last_seen DESC"""
            )
            rows = []
            for row in cur.fetchall():
                r = dict(row)
                rows.append({
                    "id": r.get("id", "")[:12],
                    "name": r.get("name", "Unknown"),
                    "ip_address": r.get("ip_address", "—"),
                    "trust_score": r.get("trust_score", 0),
                    "last_seen": r.get("last_seen", "—"),
                    "status": "ACTIVE" if r.get("trust_score", 0) >= 100 else "DEGRADED",
                    "encryption": "AES-256-GCM",
                })
            self.state["shards"] = rows
            conn.close()
            logger.info(f"Loaded {len(rows)} FL nodes from {db_path}")
        except Exception as e:
            logger.error(f"DB Node Load Error: {e}")

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
        except Exception as e:
            logger.error(f"WS Serialization/Send Error: {e}")
            self.disconnect(websocket)

    def broadcast_sync(self, message_type: str, payload: Any):
        """Thread-safe synchronous broadcast for use from Flower threads."""
        if self.loop and self.loop.is_running():
            try:
                asyncio.run_coroutine_threadsafe(
                    self.broadcast(message_type, payload), 
                    self.loop
                )
            except Exception as e:
                logger.warning(f"Thread-safe broadcast failed: {e}")
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
    allow_credentials=False,
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
    
    # Initialize Distributed Coordinator with Realtime Blockchain
    dist_coord = DistributedCoordinator.get_instance()
    dist_coord.set_broadcast(bridge.broadcast_sync)
    
    # Initialize initial blockchain state in bridge
    bridge.state["chain"] = dist_coord.blockchain.to_serialized_chain()
    bridge.state["total_blocks"] = len(dist_coord.blockchain.chain)
    bridge.state["last_hash"] = dist_coord.blockchain.get_latest_block().hash[:16]
    
    # Event listeners on real-time blockchain
    def on_block_mined(payload):
        bridge.broadcast_sync("BLOCK_MINED", payload)
        bridge.broadcast_sync("STAT_UPDATE", {
            "chain": dist_coord.blockchain.to_serialized_chain(),
            "total_blocks": len(dist_coord.blockchain.chain),
            "last_hash": dist_coord.blockchain.get_latest_block().hash[:16]
        })
    dist_coord.blockchain.subscribe("block_mined", on_block_mined)
    
    logger.info("Distributed Coordinator & Realtime Blockchain initialized and linked to bridge.")
    
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
    """Triggers a new federated training session using in-process threads and distributed coordinator."""
    import threading
    import flwr as fl
    
    # 1. Also activate the distributed coordinator session for all connected remote/local edge nodes
    try:
        coord = DistributedCoordinator.get_instance()
        coord.start_session(num_rounds=5, min_clients=1)
    except Exception as e:
        logger.warning(f"Could not trigger DistributedCoordinator on federated/start: {e}")
    
    FLOWER_PORT = 8080
    _flower_ready = threading.Event()
    
    def _run_server():
        """Background thread for Flower gRPC server."""
        import signal
        from Cybronites.server.strategy import SecureFedAvg
        from blockchain.ledger import Blockchain
        from blockchain.reputation import ReputationManager
        
        original_signal = signal.signal
        signal.signal = lambda *a, **kw: None  # Neutralize in non-main thread
        
        ledger = Blockchain(difficulty=1)
        reputation = ReputationManager()
        strategy = SecureFedAvg(
            blockchain=ledger,
            reputation=reputation,
            min_fit_clients=2,
            min_available_clients=2,
            aggregation_method="median",
        )
        _flower_ready.set()
        try:
            fl.server.start_server(
                server_address=f"0.0.0.0:{FLOWER_PORT}",
                config=fl.server.ServerConfig(num_rounds=5),
                strategy=strategy,
                grpc_max_message_length=512 * 1024 * 1024,
            )
        except Exception as e:
            logger.error(f"Flower Server error: {e}")
        finally:
            signal.signal = original_signal
    
    def _run_client(cid, num_clients=2):
        """Background thread for a simulation client."""
        _flower_ready.wait(timeout=60)
        import time as _t; _t.sleep(5)
        try:
            from Cybronites.client.model import MNISTNet, train as _train, test as _test
            from Cybronites.client.dataset import load_data
            from security.privacy import apply_dp_to_updates, DPSpec
            import torch
            import urllib.request
            
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            try:
                with urllib.request.urlopen("https://api.ipify.org", timeout=2) as r:
                    ip = r.read().decode("utf-8")
            except Exception:
                ip = "127.0.0.1"
            
            train_loader, test_loader = load_data(client_id=cid, num_clients=num_clients)
            
            class _Client(fl.client.NumPyClient):
                def __init__(self):
                    self.model = MNISTNet().to(device)
                    self.dp_spec = DPSpec(l2_norm_clip=1.0, noise_multiplier=0.01)
                def get_parameters(self, config):
                    return [v.cpu().numpy() for v in self.model.state_dict().values()]
                def set_parameters(self, parameters):
                    pairs = zip(self.model.state_dict().keys(), parameters)
                    self.model.load_state_dict({k: torch.tensor(v) for k, v in pairs}, strict=True)
                def fit(self, parameters, config):
                    initial = [torch.tensor(p).to(device) for p in parameters]
                    self.set_parameters(parameters)
                    opt = torch.optim.SGD(self.model.parameters(), lr=0.01, momentum=0.9)
                    loss, acc = _train(self.model, train_loader, opt, epochs=1, device=device)
                    new_params = [v.cpu() for v in self.model.state_dict().values()]
                    updates = {n: new_params[i] - initial[i].cpu() for i, (n, _) in enumerate(self.model.state_dict().items())}
                    dp = apply_dp_to_updates(updates, self.dp_spec)
                    final = [(initial[i].cpu() + dp[n]).numpy() for i, (n, _) in enumerate(self.model.state_dict().items())]
                    return final, len(train_loader.dataset), {"accuracy": float(acc), "loss": float(loss), "ip": ip}
                def evaluate(self, parameters, config):
                    self.set_parameters(parameters)
                    loss, acc = _test(self.model, test_loader, device=device)
                    return float(loss), len(test_loader.dataset), {"accuracy": float(acc), "ip": ip}
            
            fl.client.start_numpy_client(
                server_address=f"127.0.0.1:{FLOWER_PORT}",
                client=_Client(),
                grpc_max_message_length=512 * 1024 * 1024,
            )
        except Exception as e:
            logger.error(f"Client {cid} error: {e}")
    
    # Launch server + clients as threads (same process = shared bridge)
    threading.Thread(target=_run_server, daemon=True).start()
    for cid in range(2):
        threading.Thread(target=_run_client, args=(cid, 2), daemon=True).start()
        import time as _t; _t.sleep(1)
    
    await bridge.broadcast("LOG", "SYSTEM: Federated Training session launched.")
    return {"success": True, "message": "Federated Training launched."}

@app.post("/api/v1/laboratory/validate")
async def validate_code(data: Dict[str, str]):
    code = data.get("code", "")
    try:
        if not code.strip():
            return {"success": False, "error": "Empty source code submitted."}
            
        # 1. Syntactic analysis
        import ast
        ast.parse(code)
        
        # 2. Compilation check (Catching PyTorch import context errors)
        compile(code, '<laboratory>', 'exec')
        
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
    code = data.get("code", "")
    hyperparams = data.get("hyperparams", {})
    
    if not code:
        return {"success": False, "error": "No code provided."}
    
    # Dynamically update the active training code state and notify dashboard
    code_hash = hashlib.sha256(code.encode("utf-8")).hexdigest()
    active_obj = {
        "source": "laboratory",
        "name": "Laboratory Dynamic Training Script",
        "filename": "laboratory_train.py",
        "code": code,
        "code_hash": f"0x{code_hash[:16]}",
        "status": "TRAINING",
        "dataset": "Privacy Vault / Dynamic Data Loader"
    }
    bridge.state["model_architecture"] = code
    bridge.state["active_training_code"] = active_obj
    
    bridge.broadcast_sync("CODE_SYNC", active_obj)
    bridge.broadcast_sync("STAT_UPDATE", {
        "model_architecture": code,
        "status": "TRAINING",
        "active_training_code": active_obj
    })
    
    success, msg = engine.start_training(code, hyperparams, bridge.broadcast_sync)
    return {"success": success, "message": msg}

@app.get("/api/v1/training/active-code")
async def get_active_training_code():
    """Retrieve the exact dynamic code on which training is actively happening."""
    active = bridge.state.get("active_training_code")
    if not active:
        code = bridge.state.get("model_architecture", "")
        code_hash = hashlib.sha256(code.encode("utf-8")).hexdigest() if code else "0x0000_DEFAULT"
        active = {
            "source": "global",
            "name": "Global Federated Model",
            "filename": "model.py",
            "code": code,
            "code_hash": f"0x{code_hash[:16]}",
            "status": bridge.state.get("status", "IDLE"),
            "dataset": "MNIST (28x28) / Federated Partition"
        }
        bridge.state["active_training_code"] = active
    return {"success": True, "active_code": active}

@app.post("/api/v1/training/active-code")
async def set_active_training_code(data: Dict[str, Any]):
    """Set or inject dynamic training code into the federated convergence engine."""
    code = data.get("code", "")
    filename = data.get("filename", "model.py")
    source = data.get("source", "custom")
    name = data.get("name", "Custom Injected Training Code")
    dataset = data.get("dataset", "Dynamic Dataset Binding")
    
    if not code:
        return {"success": False, "error": "Code cannot be empty."}
        
    code_hash = hashlib.sha256(code.encode("utf-8")).hexdigest()
    active_obj = {
        "source": source,
        "name": name,
        "filename": filename,
        "code": code,
        "code_hash": f"0x{code_hash[:16]}",
        "status": "READY",
        "dataset": dataset
    }
    bridge.state["model_architecture"] = code
    bridge.state["active_training_code"] = active_obj
    
    bridge.broadcast_sync("CODE_SYNC", active_obj)
    bridge.broadcast_sync("STAT_UPDATE", {
        "model_architecture": code,
        "active_training_code": active_obj
    })
    
    return {"success": True, "active_code": active_obj}

@app.post("/api/v1/laboratory/execute")
async def execute_lab_code(data: Dict[str, Any]):
    """Execute arbitrary Python script or terminal command on the local system with direct local data access."""
    code = data.get("code", "")
    if not code:
        return {"success": False, "error": "No code provided."}
    
    import sys
    import io
    import traceback
    
    output_capture = io.StringIO()
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    
    try:
        from Cybronites.server.vault_loader import VaultLoader
        vault_instance = VaultLoader()
    except Exception:
        vault_instance = None

    namespace = {
        '__builtins__': __builtins__,
        'vault': vault_instance,
    }
    
    sys.stdout = output_capture
    sys.stderr = output_capture
    start_time = time.time()
    
    try:
        bridge.broadcast_sync("LOG", "SYSTEM: Executing script on local system with direct data access...")
        exec(code, namespace)
        exec_output = output_capture.getvalue()
        elapsed = time.time() - start_time
        
        for line in exec_output.splitlines():
            if line.strip():
                bridge.broadcast_sync("LOG", f"[stdout] {line}")
                
        return {
            "success": True,
            "output": exec_output,
            "elapsed_seconds": round(elapsed, 4)
        }
    except Exception as e:
        tb = traceback.format_exc()
        exec_output = output_capture.getvalue()
        logger.error(f"Script Execution Error: {e}\n{tb}")
        bridge.broadcast_sync("LOG", f"ERROR: {e}")
        return {
            "success": False,
            "output": exec_output,
            "error": str(e),
            "traceback": tb
        }
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr

@app.post("/api/v1/laboratory/abort")
async def abort_lab_training():
    success = engine.abort_training()
    return {"success": success}

@app.get("/api/v1/laboratory/status")
async def get_lab_status():
    return engine.get_session_status()

@app.get("/api/v1/laboratory/vault-datasets")
async def get_vault_datasets():
    try:
        from Cybronites.server.vault_loader import VaultLoader
        loader = VaultLoader()
        ds_list = loader.list()
        return {"success": True, "datasets": ds_list}
    except Exception as e:
        return {"success": False, "datasets": [], "error": str(e)}

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

@app.post("/api/v1/laboratory/purge")
async def purge_sandbox():
    """Clear sandbox cached data: exported models and pip cache."""
    try:
        import shutil
        purged = []
        
        # Clear exported models
        exports_dir = os.path.join(os.getcwd(), "exports")
        if os.path.exists(exports_dir):
            shutil.rmtree(exports_dir)
            os.makedirs(exports_dir)
            purged.append("exports")
        
        # Clear pip cache
        pip_cache = os.path.expanduser("~/.cache/pip")
        if os.path.exists(pip_cache):
            shutil.rmtree(pip_cache)
            purged.append("pip_cache")
        
        # Clear __pycache__ in workspace
        for root, dirs, files in os.walk(os.getcwd()):
            for d in dirs:
                if d == "__pycache__":
                    shutil.rmtree(os.path.join(root, d), ignore_errors=True)
            # Don't recurse into .git or node_modules
            dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', 'venv', '.venv')]
        purged.append("__pycache__")
        
        logger.info(f"Sandbox purged: {purged}")
        return {"success": True, "purged": purged}
    except Exception as e:
        logger.error(f"Purge failed: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/v1/laboratory/environment")
async def get_lab_environment():
    """Return sandbox environment info: Python version, installed packages."""
    import sys as _sys
    import subprocess
    
    try:
        # Get Python version
        python_version = f"{_sys.version_info.major}.{_sys.version_info.minor}.{_sys.version_info.micro}"
        
        # Get installed packages via pip
        result = subprocess.run(
            [_sys.executable, "-m", "pip", "list", "--format=json"],
            capture_output=True, text=True, timeout=15
        )
        
        all_packages = []
        root_packages = []
        if result.returncode == 0:
            import json as _json
            pkgs = _json.loads(result.stdout)
            all_packages = [{"name": p["name"], "version": p["version"]} for p in pkgs]
            
            # Get top-level (non-dependency) packages
            try:
                top_result = subprocess.run(
                    [_sys.executable, "-m", "pip", "list", "--not-required", "--format=json"],
                    capture_output=True, text=True, timeout=15
                )
                if top_result.returncode == 0:
                    root_pkgs = _json.loads(top_result.stdout)
                    root_packages = [{"name": p["name"], "version": p["version"]} for p in root_pkgs]
            except Exception:
                root_packages = all_packages
        
        return {
            "status": "ACTIVE",
            "python": python_version,
            "packages": root_packages,
            "root_packages": root_packages,
            "all_packages": all_packages,
            "venv_active": hasattr(_sys, 'real_prefix') or (_sys.base_prefix != _sys.prefix)
        }
    except Exception as e:
        logger.error(f"Environment fetch error: {e}")
        return {"status": "ERROR", "error": str(e), "packages": [], "all_packages": []}

@app.post("/api/v1/laboratory/inspect")
async def inspect_lab_code(data: Dict[str, str]):
    """Analyze code for imports and hyperparameters."""
    code = data.get("code", "")
    try:
        import ast
        tree = ast.parse(code)
        
        imports = set()
        params = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.add(alias.name.split('.')[0])
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.add(node.module.split('.')[0])
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and isinstance(node.value, (ast.Constant, ast.Num)):
                        name = target.id.lower()
                        if any(kw in name for kw in ['epoch', 'lr', 'learning_rate', 'batch', 'dropout', 'momentum']):
                            val = node.value.value if isinstance(node.value, ast.Constant) else node.value.n
                            params.append({"name": target.id, "value": val, "lineno": node.lineno})
        
        return {
            "success": True,
            "dependencies": sorted(imports),
            "parameters": params
        }
    except Exception as e:
        return {"success": False, "error": str(e), "dependencies": [], "parameters": []}

# ── Distributed Federated Learning REST Endpoints ──
# These endpoints allow remote clients on ANY network to participate
# in federated training through the existing HuggingFace Space URL.
# No gRPC port, no ngrok, no same-WiFi requirement.

@app.post("/api/v1/distributed/start")
async def start_distributed_session(data: Dict[str, Any] = {}):
    """Start a new distributed FL session. Called from the dashboard."""
    coord = DistributedCoordinator.get_instance()
    num_rounds = data.get("num_rounds", 5)
    min_clients = data.get("min_clients", 1)
    
    result = coord.start_session(num_rounds=num_rounds, min_clients=min_clients)
    return {"success": True, **result}

@app.post("/api/v1/distributed/stop")
async def stop_distributed_session():
    """Force-stop the current distributed session."""
    coord = DistributedCoordinator.get_instance()
    coord.stop_session()
    return {"success": True, "message": "Session stopped."}

@app.post("/api/v1/distributed/register")
async def register_distributed_client(data: Dict[str, Any] = {}):
    """Register a remote client node with transparent training code. Returns a unique client ID."""
    coord = DistributedCoordinator.get_instance()
    name = data.get("name", "Unknown-Node")
    ip = data.get("ip", "0.0.0.0")
    code = data.get("code", "")
    filename = data.get("filename", "model.py")
    
    client_id = coord.register_client(name, ip, code=code, filename=filename)
    return {
        "success": True, 
        "client_id": client_id,
        "session_status": coord.status,
        "current_round": coord.round,
        "filename": filename,
    }

@app.post("/api/v1/distributed/submit-code")
async def submit_node_training_code(data: Dict[str, Any] = {}):
    """Allows a connected node to upload/update its training source code for full transparency."""
    coord = DistributedCoordinator.get_instance()
    client_id = data.get("client_id")
    code = data.get("code", "")
    filename = data.get("filename", "model.py")
    
    if not client_id or not code:
        return {"success": False, "error": "client_id and code are required"}
    
    updated = coord.update_client_code(client_id, code, filename)
    return {"success": updated, "filename": filename}

@app.get("/api/v1/distributed/node-code/{client_id}")
async def get_node_training_code(client_id: str):
    """Retrieve full source code and cryptographic SHA-256 fingerprint for a connected node."""
    coord = DistributedCoordinator.get_instance()
    client_info = coord.registered_clients.get(client_id)
    if not client_info:
        return {"success": False, "error": f"Node {client_id} not found"}
    
    return {
        "success": True,
        "client_id": client_id,
        "name": client_info.get("name"),
        "filename": client_info.get("filename", "model.py"),
        "code": client_info.get("code", ""),
        "code_hash": client_info.get("code_hash", ""),
    }

@app.get("/api/v1/distributed/get-model")
async def get_distributed_model():
    """Download the current global model parameters."""
    coord = DistributedCoordinator.get_instance()
    
    if coord.status == "IDLE":
        return {"error": "No active session. Wait for session to start."}
    
    return coord.get_global_params()

@app.post("/api/v1/distributed/submit-update")
async def submit_distributed_update(data: Dict[str, Any] = {}):
    """Submit trained model parameters from a client node."""
    coord = DistributedCoordinator.get_instance()
    
    client_id = data.get("client_id")
    params_b64 = data.get("params", [])
    num_examples = data.get("num_examples", 100)
    metrics = data.get("metrics", {})
    
    if not client_id:
        return {"success": False, "message": "client_id is required"}
    if not params_b64:
        return {"success": False, "message": "params are required"}
    
    return coord.submit_update(client_id, params_b64, num_examples, metrics)

@app.get("/api/v1/distributed/status")
async def get_distributed_status():
    """Get current distributed session status. Used by clients for polling."""
    coord = DistributedCoordinator.get_instance()
    return coord.get_status()

@app.get("/api/v1/distributed/connection-info")
async def get_distributed_connection_info():
    """Get instant connection instructions for remote participants."""
    server_ip = bridge.state.get("server_ip", "127.0.0.1")
    return {
        "server_url": server_ip,
        "command_local": "python join.py",
        "command_curl": f"curl -sSL http://{server_ip}:{BRIDGE_PORT}/join.py | python3",
        "command_remote": f"python join.py --server http://{server_ip}:{BRIDGE_PORT} --name 'My-Device'",
    }

@app.get("/join.py")
@app.get("/join")
@app.get("/connect")
async def serve_join_script():
    """Serves the standalone 1-command client join script."""
    candidates = [
        "/app/join.py",
        os.path.join(os.getcwd(), "join.py"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "join.py"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "join.py"),
    ]
    for path in candidates:
        if os.path.exists(path):
            return FileResponse(path, media_type="text/plain; charset=utf-8", filename="join.py")
    
    # Try reading from current workspace if available
    try:
        with open("join.py", "r", encoding="utf-8") as f:
            from starlette.responses import PlainTextResponse
            return PlainTextResponse(f.read(), media_type="text/plain; charset=utf-8")
    except Exception:
        pass

    return {"error": "join.py script not found on host."}

# ── Real-Time Blockchain API Endpoints ──

@app.get("/api/v1/blockchain/chain")
async def get_blockchain_chain():
    """Returns high-level blockchain overview, validity, and full block list."""
    coord = DistributedCoordinator.get_instance()
    bc = coord.blockchain
    stats = bc.get_stats()
    return {
        "success": True,
        "stats": stats,
        "chain": bc.to_serialized_chain()
    }

@app.get("/api/v1/blockchain/blocks")
async def get_blockchain_blocks(limit: int = 50, offset: int = 0):
    """Returns paginated blocks from the distributed ledger."""
    coord = DistributedCoordinator.get_instance()
    bc = coord.blockchain
    all_blocks = bc.to_serialized_chain()
    paginated = all_blocks[offset : offset + limit]
    return {
        "success": True,
        "total": len(all_blocks),
        "limit": limit,
        "offset": offset,
        "blocks": paginated
    }

@app.get("/api/v1/blockchain/block/{index_or_hash}")
async def get_blockchain_block(index_or_hash: str):
    """Returns detailed block information with transaction data and Merkle verification."""
    coord = DistributedCoordinator.get_instance()
    bc = coord.blockchain
    block = bc.get_block(index_or_hash)
    if not block:
        return {"success": False, "error": f"Block '{index_or_hash}' not found"}
    return {"success": True, "block": block}

@app.get("/api/v1/blockchain/mempool")
async def get_blockchain_mempool():
    """Returns active unmined pending transactions awaiting consensus."""
    coord = DistributedCoordinator.get_instance()
    bc = coord.blockchain
    return {
        "success": True,
        "count": len(bc.pending_transactions),
        "mempool": bc.get_mempool()
    }

@app.get("/api/v1/blockchain/validate")
async def validate_blockchain():
    """Executes live deep cryptographic verification of hash continuity and Merkle roots."""
    coord = DistributedCoordinator.get_instance()
    bc = coord.blockchain
    is_valid, msg = bc.validate_chain_detailed()
    return {
        "success": True,
        "is_valid": is_valid,
        "message": msg,
        "chain_length": len(bc.chain),
        "latest_hash": bc.get_latest_block().hash
    }

@app.get("/api/v1/blockchain/client/{client_id}")
async def get_client_blockchain_history(client_id: str):
    """Returns complete on-chain audit trail and reputation history for a client."""
    coord = DistributedCoordinator.get_instance()
    bc = coord.blockchain
    txs = bc.get_client_history(client_id)
    rep_score = coord.reputation.get_score(client_id)
    return {
        "success": True,
        "client_id": client_id,
        "reputation_score": rep_score,
        "transaction_count": len(txs),
        "transactions": txs
    }

@app.post("/api/v1/blockchain/mine")
async def force_mine_blockchain(data: Dict[str, Any] = {}):
    """Manually or programmatically triggers block mining on pending mempool transactions."""
    coord = DistributedCoordinator.get_instance()
    bc = coord.blockchain
    miner = data.get("miner", "API_ADMIN_TRIGGER")
    if not bc.pending_transactions:
        return {"success": False, "message": "Mempool is empty. No transactions to mine."}
    
    new_block = bc.mine_pending_transactions(miner=miner)
    serialized_chain = bc.to_serialized_chain()
    
    # Broadcast to dashboard in real-time
    await bridge.broadcast("BLOCK_MINED", {
        "block": new_block.to_dict(),
        "chain_length": len(bc.chain),
        "is_valid": bc.validate_chain()
    })
    await bridge.broadcast("STAT_UPDATE", {
        "chain": serialized_chain,
        "total_blocks": len(bc.chain),
        "last_hash": new_block.hash[:16]
    })
    
    return {
        "success": True,
        "message": f"Block #{new_block.index} mined successfully",
        "block": new_block.to_dict()
    }

# ── Secure Training Platform Proxy (for production single-port) ──
STP_PORT = int(os.environ.get("STP_API_PORT", "8100"))

@app.api_route("/api/secure/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_stp(path: str):
    """Proxy requests to the Secure Training Platform (port 8100) in production."""
    from starlette.requests import Request
    from starlette.responses import JSONResponse
    try:
        target_url = f"http://127.0.0.1:{STP_PORT}/{path}"
        req_body = None
        try:
            from fastapi import Request as FR
            # Try to read body for POST/PUT
            pass
        except Exception:
            pass
        
        # Use urllib for simplicity (no extra dependency)
        import urllib.request
        import urllib.error
        req = urllib.request.Request(target_url)
        req.add_header("Content-Type", "application/json")
        
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            return JSONResponse(data)
    except urllib.error.URLError:
        return JSONResponse({"error": "Secure Training Platform is offline"}, status_code=503)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# ── Static Dashboard Serving (for Deployment) ──
# Look for 'static' (Hugging Face) or 'dist' (Local build)
paths_to_check = [
    os.path.join(os.getcwd(), "static"),
    os.path.join(os.getcwd(), "dist"),
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static"),
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "dist")
]

for s_dir in paths_to_check:
    if os.path.exists(s_dir) and os.path.isdir(s_dir):
        assets_dir = os.path.join(s_dir, "assets")
        if os.path.exists(assets_dir):
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
        @app.get("/{full_path:path}")
        async def serve_dashboard(full_path: str):
            # Block internal API/WS from being caught by static server
            if full_path.startswith("api") or full_path.startswith("ws"):
                from fastapi import HTTPException
                raise HTTPException(status_code=404)
            # If requesting a direct static asset file that exists (like favicon.svg, icons.svg, etc.)
            target_path = os.path.join(s_dir, full_path)
            if full_path and os.path.isfile(target_path):
                return FileResponse(target_path)
            # Fallback to SPA index.html with strict cache-busting headers
            index_path = os.path.join(s_dir, "index.html")
            if os.path.exists(index_path):
                return FileResponse(
                    index_path,
                    headers={
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        "Pragma": "no-cache",
                        "Expires": "0"
                    }
                )
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Dashboard index.html not found")
        logger.info(f"Serving dashboard from {s_dir}")
        break

def start_bridge(port: int = 7860):
    import uvicorn
    logger.info(f"Launching Guardian Bridge on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="warning")
