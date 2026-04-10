# 🛡️ AI Guardian | Secure Federated Learning Laboratory
## Professional Technical Documentation v1.5

Welcome to the **AI Guardian Professional Dashboard**, a state-of-the-art Federated Learning environment designed for quantitative researchers and institutional data scientists.

---

## 1. System Architecture
The platform is built on a **Decentralized Hub-and-Spoke** architecture, leveraging the [Flower (flwr)](https://flower.ai) framework for secure model aggregation.

### 🧩 Core Components
1. **The Orchestrator (`orchestrator.py`)**: The central engine that manages both the Flower Server and the lifecycle of local `GuardianClient` processes.
2. **The Guardian Bridge (`bridge.py`)**: A FastAPI-powered middleware that bridges the gap between binary training processes and the React-based Dashboard via WebSockets.
3. **The Research Engine (`training_engine.py`)**: A stateful sandbox environment that handles model compilation, dependency scanning, and REPL evaluation.
4. **The Client Node (`client.py`)**: The decentralized training actor that performs isolated learning with built-in **Differential Privacy (DP)**.

---

## 2. The Research Laboratory (IDE)
The Laboratory is a high-fidelity research environment that supports two primary execution modalities:

### 🤖 Model Mode (Main Editor)
- Used for defining complex neural architectures using `torch.nn.Module`.
- **Auto-Detection**: The engine identifies your model class, instantiates it on the backend, and automatically prepares the Federated Learning protocol.
- **Weights Export**: Automatically generates `.pt` and `.onnx` files upon successful convergence.

### 🧪 Script Mode & Research Shell (REPL)
- **Interactive Terminal**: Located at the bottom of the console. Supports multi-line code cells and Jupyter-style expression evaluation.
- **Persistence**: Unlike standard scripts, variables and libraries imported in the shell persist across your entire research session.
- **Magic Commands**: Supports Google Colab-style `!pip` and `!ls` commands for direct environment manipulation.

---

## 3. "Nuclear Safety" & System Resilience
The platform is hardened with **Institutional Safety Protocols** to ensure zero-downtime during research sessions.

- **Pipe Hardening**: The system is resilient to `BrokenPipeError` and `ConnectionResetError`. If an investigator closes their dashboard mid-session, the backend training continues uninterrupted.
- **Malformation Shield**: The Bridge parses all code in a "Dry Run" sandbox before submission to catch syntax errors without crashing the server.
- **Cache Persistence**: Uses a 15-second TTL cache for environment scans to prevent UI lag during massive dependency lookups.

---

## 4. Privacy & Compliance
- **Differential Privacy (DP)**: All client updates are obscured using ε-privacy noise before aggregation, ensuring that individual data points cannot be reconstructed from global model updates.
- **VENV Isolation**: Every research session runs in a distinct `research_sandbox` virtual environment, isolating user experiments from the system-level Python distribution.

---

## 5. Quickstart Reference

### Starting the Stack
```bash
# Start the unified backend
python3 run_local.py

# Launch the Dashboard
cd dashboard
npm run dev
```

### Administrative Controls
- **Purge Sandbox**: Use the `Refresh_Health` button to scan for outdated libraries or manually liquidate the sandbox to reclaim disk space.
- **Abort Training**: Sends a secure interrupt signal to all federated nodes to halt execution and retain current state.

---
*© 2026 Cybronites Institutional Research. Optimized for High-Security Research Environments.*
