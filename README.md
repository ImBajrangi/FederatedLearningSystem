---
title: Secure Federated Learning System
emoji: 🛡️
colorFrom: indigo
colorTo: blue
sdk: docker
pinned: false
app_port: 7860
---

# Secure Federated Learning System

Production-grade Federated Learning Laboratory and Institutional IDE with Supabase-powered authentication and real-time database tracking.

## 🚀 Deploy (Free Hosting)

### Hugging Face Spaces (Recommended)
1. Create a Space with **Docker** SDK
2. Push this repo — it auto-builds and deploys
3. Set secrets in **Settings → Repository Secrets**:
   - `SUPABASE_SECRET_KEY` (your Supabase secret key)

### Railway
```bash
railway login && railway up
```
Railway auto-detects the Dockerfile and `PORT` env var.

### Render
1. Connect repo → Select **Docker** runtime
2. Set env var `PORT` (Render assigns dynamically)

### Fly.io
```bash
fly launch --dockerfile Dockerfile
```

## 🔐 Supabase Setup
1. Go to your [Supabase SQL Editor](https://supabase.com/dashboard)
2. Run `dashboard/supabase_setup.sql` to create tables
3. Enable **Email Auth** in Authentication → Providers
4. Add your deploy URL to **Authentication → URL Configuration → Redirect URIs**

## 🏗️ Architecture
- **Backend**: FastAPI + Flower (Federated Learning Orchestrator)
- **Frontend**: React + Vite (Institutional Dashboard)
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Security**: Diffie-Hellman Key Exchange, Differential Privacy, Blockchain Ledger

## 📊 Database Tables
| Table | Purpose |
|-------|---------|
| `profiles` | Auto-created user profiles on signup |
| `training_sessions` | FL training session history per user |
| `experiment_logs` | Per-round metrics (accuracy, loss, etc.) |
| `architecture_configs` | Saved model architectures |
| `lab_experiments` | Code Laboratory history |
| `activity_log` | User activity tracking |

All tables enforce **Row Level Security (RLS)** — users can only access their own data.

---
*Maintained by the AI Guardian Team.*
