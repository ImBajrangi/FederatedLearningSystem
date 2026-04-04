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

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("GuardianBridge")

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
            "model_architecture": "# Loading Source Code..." 
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
        if not self.loop:
            try: self.loop = asyncio.get_event_loop()
            except Exception: pass
        
        if self.loop:
            asyncio.run_coroutine_threadsafe(
                self.broadcast(message_type, payload), 
                self.loop
            )

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
                logger.info(f"Broadcasting STAT_UPDATE. Accuracy History Size: {hist_size}")
            
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    bridge.loop = asyncio.get_running_loop()
    bridge.load_model_code()
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
async def health_check():
    return {"status": "ONLINE", "clients": len(bridge.active_connections)}

@app.post("/v1/laboratory/validate")
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

@app.post("/v1/laboratory/deploy")
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

# ── Static Dashboard Serving (for Deployment) ──
# Look for 'static' (Hugging Face) or 'dist' (Local build)
static_dirs = [os.path.join(os.getcwd(), "static"), os.path.join(os.getcwd(), "dist")]
for s_dir in static_dirs:
    if os.path.exists(s_dir):
        app.mount("/assets", StaticFiles(directory=os.path.join(s_dir, "assets")), name="assets")
        
        @app.get("/{full_path:path}")
        async def serve_dashboard(full_path: str):
            # Try to serve index.html from whichever static dir we found
            return FileResponse(os.path.join(s_dir, "index.html"))
        logger.info(f"Serving dashboard from {s_dir}")
        break

def start_bridge(port: int = 7860):
    import uvicorn
    logger.info(f"Launching Guardian Bridge on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="warning")
