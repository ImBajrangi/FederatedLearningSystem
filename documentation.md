# AI Guardian: Technical Documentation & User Manual

## 🛡️ Introduction
**AI Guardian** (Cybronites) is a production-grade Federated Learning (FL) Laboratory and Institutional IDE. It enables decentralized machine learning where data never leaves its source, protected by a multilayered security stack including **Blockchain auditing**, **Differential Privacy**, and **Reputation Management**.

---

## 🏗️ System Architecture

### 1. The Institutional Dashboard (Frontend)
Built with **React 18**, **Vite**, and **Tailwind CSS**, the dashboard provides a premium academic interface.
*   **Workflow:** Researchers design models in the **Architecture Builder**, test logic in the **Code Laboratory**, and orchestrate training via the **Cluster Manager**.
*   **Real-time sync:** Uses WebSockets for zero-latency telemetry streaming (Loss/Accuracy/Blockchain blocks).

### 2. The Guardian Bridge (Backend)
A **FastAPI** central hub that coordinates all operations.
*   **State Management:** Tracks global training status and distributes configurations to nodes.
*   **Static Serving:** Built to handle SPA routing, serving the React frontend directly in production.
*   **Cloud Orchestration:** Detects environments like HuggingFace or Railway to adapt filesystem operations.

### 3. Federated Learning Layer
Powered by **Flower (flwr)** with a custom **SecureFedAvg** strategy.
*   **Decentralized Nodes:** Clients perform local training on private datasets (MNIST/Institutional shards).
*   **Robust Aggregation:** Supports Median and Trimmed Mean aggregation to resist poisoning attacks.
*   **Validation Contract:** Every update is checked against statistical thresholds before being accepted.

### 4. Security & Audit Stack
*   **Blockchain Ledger:** Every round and specific client update is hashed and stored in an immutable chain.
*   **Differential Privacy (DP):** Local updates are clipped and "noised" (ε-privacy) to prevent data reconstruction attacks.
*   **Supabase (DB/Auth):** Handles institutional identity and persistent research logging with Row Level Security (RLS).

---

## 🚀 Deployment Guide

### Cloud Deployment (HuggingFace / Railway / Render)
The system is optimized for free-tier cloud environments.
1.  **Repository:** Push the code to your chosen provider.
2.  **Environment Variables:**
    *   `SUPABASE_URL`: Your project URL.
    *   `SUPABASE_ANON_KEY`: Your project public key.
    *   `PORT`: (Auto-assigned by most platforms, default 7860).
3.  **Database Migration:** Copy the contents of `dashboard/supabase_setup.sql` into your Supabase SQL Editor and run it.

### Local Development
```bash
# Clone the repository
git clone <repo-url>
cd secure_federated_learning

# Run the unified orchestrator
python3 run_local.py
```
*   **Local Mode:** Launches the Bridge + 2 Simulated Clients.
*   **Access:** Dashboard will be available at `http://localhost:7880`.

---

## 📊 Database Schema
The system uses **Supabase** for persistence.
| Table | Description |
|---|---|
| `profiles` | Stores usernames, roles, and institutional affiliations. |
| `training_sessions` | High-level record of every FL session initiated. |
| `experiment_logs` | Deep metrics for every round (Accuracy, Loss, Blockchain Hash). |
| `architecture_configs`| Saved neural network designs from the builder. |
| `activity_log` | Audit trail of user logins, view changes, and training triggers. |

---

## 🛠️ API Reference

### Federated Training
*   `POST /api/v1/federated/start`: Initiates a new training session.
*   `GET /api/v1/federated/status`: Returns the current round and metrics.
*   `POST /api/v1/federated/reset`: Clears the session for a new run.

### Code Laboratory
*   `POST /api/v1/laboratory/validate`: Checks code for syntax/security errors.
*   `POST /api/v1/laboratory/train`: Executes the current script in the research sandbox.
*   `GET /api/v1/laboratory/download/pt`: Downloads the global model weights.

---

## 🛡️ Security Best Practices
1.  **RLS Policies:** Ensure "Row Level Security" is enabled on all Supabase tables so researchers cannot view each other's private experiments.
2.  **Secret Management:** Never commit `.env` files. Use HuggingFace Secrets or Railway Variables.
3.  **Node Reputation:** Regularly monitor the **Node Registry** in the Privacy Vault to identify nodes with dropping trust scores.

---
*Document Version: 2.1.0*
*Last Updated: April 10, 2026*
