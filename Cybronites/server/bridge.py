from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import json
import logging
import asyncio

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Bridge")

class ConnectionManager:
    """Manages active WebSocket connections to the React Dashboard."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.loop = None # Will be set by the running app
        self.latest_stats = {
            "round": 0,
            "total_blocks": 0,
            "clients_active": 0,
            "trust_score": 100.0,
            "status": "IDLE",
            "last_hash": "N/A"
        }
        self.chain_history = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Capture the running loop if not already set
        if self.loop is None:
            self.loop = asyncio.get_running_loop()
            
        # Send initial state
        await self.send_personal_message({
            "type": "initial_state",
            "stats": self.latest_stats,
            "chain": self.chain_history
        }, websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    def broadcast_sync(self, message: dict):
        """
        Thread-safe synchronous wrapper to broadcast from other threads (e.g. Flower).
        """
        if self.loop:
            asyncio.run_coroutine_threadsafe(self.broadcast(message), self.loop)
        else:
            # Fallback if loop not yet initialized
            logger.warning("Attempted broadcast before bridge initialization.")

    async def broadcast(self, message: dict):
        # Update latest stats for persistent UI state
        if message["type"] == "global_update":
            self.latest_stats.update(message["stats"])
            if "chain" in message:
                self.chain_history = message["chain"]
        elif message["type"] == "status_update":
            self.latest_stats["status"] = message["status"]
            
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

# Global Bridge Manager
manager = ConnectionManager()
app = FastAPI(title="AI Guardian Bridge")

@app.on_event("startup")
async def startup_event():
    manager.loop = asyncio.get_running_loop()
    logger.info("Bridge Event Loop captured.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

@app.get("/status")
async def get_status():
    return manager.latest_stats

@app.post("/initiate-round")
async def initiate_round():
    return {"message": "Federated round initiated by server"}

@app.post("/aggregate")
async def aggregate():
    return {"message": "Aggregation triggered"}

# Production Static File Serving
# Place this AFTER all routes (ws, status, etc.) to ensure they take priority
frontend_path = os.path.join(os.getcwd(), "dist")
if os.path.exists(frontend_path):
    # Mount frontend dist but with an SPA fallback
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
else:
    logger.warning(f"Frontend dist directory not found at {frontend_path}")

def run_bridge():
    """Entry point for Uvicorn."""
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="error")
