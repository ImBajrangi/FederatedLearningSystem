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
            "status": "IDLE",
            "last_hash": "N/A",
            "accuracy_history": [],
            "loss_history": [],
            "chain": []
        }
        self.log_buffer: List[str] = []

    async def connect(self, websocket: WebSocket):
        try:
            await websocket.accept()
            self.active_connections.append(websocket)
            
            if self.loop is None:
                try:
                    self.loop = asyncio.get_running_loop()
                except RuntimeError:
                    pass
                
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
            # We use jsonable_encoder implicitly but we'll try to catch serialization errors here
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
            # Direct update of local state
            self.state.update(payload)
            
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

def start_bridge(port: int = 7860):
    import uvicorn
    logger.info(f"Launching Guardian Bridge on port {port}...")
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
