from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import json
import logging
import asyncio
import os
import time

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
            "status": "IDLE", # IDLE, TRAINING, AGGREGATING, MINING
            "last_hash": "N/A",
            "accuracy_history": []
        }
        self.log_buffer: List[str] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        if self.loop is None:
            self.loop = asyncio.get_running_loop()
            
        # Send initial state snapshot
        await self.send_json({
            "type": "INITIAL_SYNC",
            "payload": {
                "state": self.state,
                "logs": self.log_buffer[-10:] # Last 10 logs
            }
        }, websocket)
        logger.info(f"Dashboard connected. Total subscribers: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info("Dashboard disconnected.")

    async def send_json(self, data: dict, websocket: WebSocket):
        try:
            await websocket.send_json(data)
        except Exception:
            self.disconnect(websocket)

    def broadcast_sync(self, message_type: str, payload: Any):
        """Thread-safe synchronous broadcast for use from Flower threads."""
        if self.loop:
            asyncio.run_coroutine_threadsafe(
                self.broadcast(message_type, payload), 
                self.loop
            )

    async def broadcast(self, message_type: str, payload: Any):
        """Reactive broadcast engine."""
        # Update local state cache for new connections
        if message_type == "STAT_UPDATE":
            # Handle specialized serialization for the blockchain ledger
            if "ledger" in payload:
                # Convert list of Block objects to serializable dicts
                chain_dict = [b.to_dict() for b in payload["ledger"]]
                payload["chain"] = chain_dict
                self.state["chain"] = chain_dict
                del payload["ledger"]
            
            self.state.update(payload)
            
        elif message_type == "LOG":
            self.log_buffer.append(payload)
            if len(self.log_buffer) > 100: self.log_buffer.pop(0)

        data = {"type": message_type, "payload": payload}
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                pass

# Global Bridge Instance
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
    logger.info("Bridge Event Loop initialized.")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await bridge.connect(websocket)
    try:
        while True:
            # Keep connection alive & handle incoming pings/commands
            data = await websocket.receive_text()
            # Handle manual triggers from UI if needed
            msg = json.loads(data)
            if msg.get("type") == "PING":
                await websocket.send_json({"type": "PONG", "ts": time.time()})
    except WebSocketDisconnect:
        bridge.disconnect(websocket)
    except Exception as e:
        logger.error(f"WS Error: {e}")
        bridge.disconnect(websocket)

@app.get("/api/health")
async def health_check():
    return {"status": "ONLINE", "clients": len(bridge.active_connections)}

@app.post("/api/terminate")
async def terminate_session():
    """Safety endpoint to stop all training nodes."""
    bridge.broadcast_sync("SYSTEM_EVENT", {"action": "TERMINATE", "reason": "User Request"})
    return {"status": "TERMINATION_SENT"}

@app.get("/api/state")
async def get_state():
    return bridge.state

def start_bridge(port: int = 7860):
    import uvicorn
    logger.info(f"Launching Guardian Bridge on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="warning")
