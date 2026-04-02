import flwr as fl
import sys
import os
import threading
import asyncio
import uvicorn

# Add parent directory to sys.path to allow relative imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from server.strategy import SecureFedAvg
from server.bridge import app, manager

def run_bridge():
    """Starts the FastAPI WebSocket bridge."""
    print("AI GUARDIAN | STARTING DASHBOARD BRIDGE...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="error")

def main():
    """
    Main function to start the Flower Federated Learning Server.
    Uses a background thread for the Dashboard Bridge.
    """
    # 1. Start Dashboard Bridge in a separate thread
    bridge_thread = threading.Thread(target=run_bridge, daemon=True)
    bridge_thread.start()

    # 2. Wait a moment for bridge to initialize
    print("AI GUARDIAN | INITIALIZING SECURE FEDERATED ORCHESTRATOR...")

    # 3. Define custom strategy
    strategy = SecureFedAvg(
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=2,
        min_evaluate_clients=2,
        min_available_clients=2,
    )

    # 4. Start Flower server
    fl.server.start_server(
        server_address="0.0.0.0:8080",
        config=fl.server.ServerConfig(num_rounds=20),
        strategy=strategy,
    )
    
    # 5. Keep the bridge alive after FL training is done
    print("AI GUARDIAN | FL ROUNDS COMPLETE. RETAINING DASHBOARD BRIDGE...")
    bridge_thread.join()

if __name__ == "__main__":
    # Ensure a main event loop exists for bridge communication
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    # Broadcast initial waiting status
    from server.bridge import manager
    manager.latest_stats["status"] = "WAITING"
    
    main()
