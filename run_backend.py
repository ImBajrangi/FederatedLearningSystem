import subprocess
import time
import sys
import os
import argparse

def get_python_executable():
    """Detect the best python executable to use (prefers venv_mac)."""
    venv_path = os.path.abspath("Cybronites/venv_mac/bin/python3")
    if os.path.exists(venv_path):
        return venv_path
    return sys.executable

def run_backend(num_clients=2, rounds=5):
    """
    Orchestrates the full Federated Learning Backend.
    1. Launches Server (FastAPI Bridge + Flower Server)
    2. Launches N Clients
    """
    print("\n" + "="*60)
    print("  🛡️  AI GUARDIAN: UNIFIED FEDERATED BACKEND LAUNCHER")
    print("="*60 + "\n")

    python_exe = get_python_executable()
    print(f"[SYSTEM] Using Python: {python_exe}")
    
    processes = []

    try:
        # 1. Start Server
        print(f"[SYSTEM] Launching Orchestrator (Bridge + Flower)...")
        server_env = os.environ.copy()
        server_env["PYTHONPATH"] = os.path.abspath(".")
        
        server_proc = subprocess.Popen(
            [python_exe, "Cybronites/server/server.py"],
            env=server_env
        )
        processes.append(server_proc)
        
        # Give server time to bind ports
        time.sleep(5)

        # 2. Start Clients
        for i in range(num_clients):
            print(f"[SYSTEM] Launching Secure Client {i}...")
            client_proc = subprocess.Popen(
                [python_exe, "Cybronites/client/client.py", str(i), str(num_clients)],
                env=server_env
            )
            processes.append(client_proc)
            time.sleep(1)

        print(f"\n[SUCCESS] All components active. Dashboard available at http://localhost:7861")
        print(f"[INFO] Press Ctrl+C to terminate the session.\n")

        # Keep main thread alive
        while True:
            if server_proc.poll() is not None:
                print("\n[ALERT] Server process terminated.")
                break
            time.sleep(1)

    except KeyboardInterrupt:
        print(f"\n[TERMINATING] Shutting down all processes safely...")
        for p in processes:
            p.terminate()
        print("[DONE] Cleanup complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Guardian Backend Launcher")
    parser.add_argument("--clients", type=int, default=2, help="Number of clients to spawn")
    parser.add_argument("--rounds", type=int, default=5, help="Number of training rounds")
    args = parser.parse_args()
    
    run_backend(num_clients=args.clients, rounds=args.rounds)
