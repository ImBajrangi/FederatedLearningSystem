import subprocess
import time
import os
import signal
import sys

# AI GUARDIAN | LOCAL ORCHESTRATION COORDINATOR
# This script launches the entire Federated Learning stack:
# 1. Bridge & Server (Port 7860/8080)
# 2. Federated Clients (x2)

processes = []

def signal_handler(sig, frame):
    print("\nAI GUARDIAN | SHUTTING DOWN STACK...")
    for p in processes:
        p.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def main():
    print("AI GUARDIAN | INITIALIZING LOCAL STACK...")
    
    # Ensure Cybronites is in PYTHONPATH for absolute imports
    env = os.environ.copy()
    cwd = os.getcwd()
    env["PYTHONPATH"] = f"{cwd}/Cybronites:{env.get('PYTHONPATH', '')}"
    env["PORT"] = "7869" # Port 7869 for local dev stability

    # Use the local virtual environment Python
    python_path = os.path.join(cwd, "Cybronites/venv_mac/bin/python3")
    if not os.path.exists(python_path):
        python_path = sys.executable # Fallback

    # 1. Launch Server & Bridge
    print("AI GUARDIAN | STARTING ORCHESTRATOR & BRIDGE (Port 7869)...")
    log_file = open("backend.log", "w")
    server_proc = subprocess.Popen(
        [python_path, "-m", "server.server"],
        env=env,
        cwd=os.path.join(cwd, "Cybronites"),
        stdout=log_file,
        stderr=log_file
    )
    processes.append(server_proc)

    # 2. Wait for Server to initialize
    time.sleep(5)

    # 3. Launch Clients
    num_clients = 2
    for i in range(num_clients):
        print(f"AI GUARDIAN | JOINING CLIENT {i}...")
        client_proc = subprocess.Popen(
            [python_path, "-m", "client.client", str(i), str(num_clients)],
            env=env,
            cwd=os.path.join(cwd, "Cybronites"),
            stdout=log_file,
            stderr=log_file
        )
        processes.append(client_proc)
        time.sleep(1)

    print("AI GUARDIAN | ALL NODES ACTIVE. MONITORING AT http://127.0.0.1:7869")
    print("AI GUARDIAN | PRESS CTRL+C TO TERMINATE")

    # Keep alive
    while True:
        time.sleep(1)

if __name__ == "__main__":
    main()
