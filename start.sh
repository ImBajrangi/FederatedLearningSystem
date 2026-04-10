#!/bin/bash

# AI Guardian: Universal Cloud-Compatible Startup Script
# Compatible with: HuggingFace Spaces, Railway, Render, Fly.io, Docker
echo "AI GUARDIAN | INITIALIZING STACK AS ROLE: ${ROLE:-UNIFIED}"
echo "AI GUARDIAN | PLATFORM: ${SPACE_ID:+HuggingFace}${RAILWAY_ENVIRONMENT:+Railway}${RENDER:+Render}${FLY_APP_NAME:+Fly.io}${SPACE_ID:-${RAILWAY_ENVIRONMENT:-${RENDER:-${FLY_APP_NAME:-Docker/Local}}}}"

# Ensure we are in the script directory
cd "$(dirname "$0")"

# ─── Universal Port Detection ───
# Each platform injects PORT differently:
#   HuggingFace: PORT=7860 (fixed)
#   Railway:     PORT=dynamic (must respect)
#   Render:      PORT=dynamic
#   Fly.io:      PORT=8080 (default)
#   Local:       PORT=7880 (our default)
export PORT=${PORT:-7860}

# Configure defaults
FL_SERVER_IP=${SERVER_IP:-"127.0.0.1"}
FLOWER_PORT=${FLOWER_PORT:-8095}
ROUNDS=${ROUNDS:-5}

# ─── Memory-Safe PyTorch Config ───
# Free tiers have limited RAM (512MB-2GB). Constrain CPU threads.
export OMP_NUM_THREADS=${OMP_NUM_THREADS:-2}
export MKL_NUM_THREADS=${MKL_NUM_THREADS:-2}
export TORCH_NUM_THREADS=${TORCH_NUM_THREADS:-2}
export PYTHONUNBUFFERED=1

# ─── Writable Temp Directories ───
# Cloud platforms often have read-only filesystems except /tmp
export TMPDIR=${TMPDIR:-/tmp}
export MPLCONFIGDIR=${TMPDIR}/matplotlib
mkdir -p "$MPLCONFIGDIR" 2>/dev/null || true

if [ "$ROLE" == "SERVER" ]; then
    echo "  [MODE] Starting Orchestrator (Bridge + FL Server)..."
    python3 -m Cybronites.server.server --flower_port "$FLOWER_PORT" --rounds "$ROUNDS"

elif [ "$ROLE" == "CLIENT" ]; then
    echo "  [MODE] Starting Federated Client (ID: $CLIENT_ID)..."
    # Wait for server to be available if in a network
    if [ "$SERVER_IP" != "127.0.0.1" ]; then
        echo "  [WAIT] Pinging Server $SERVER_IP..."
        until curl -s "http://$SERVER_IP:${PORT:-7860}/api/health" > /dev/null; do
          echo "  [...] Waiting for server connectivity..."
          sleep 5
        done
    fi
    python3 -m Cybronites.client.client "$CLIENT_ID" "${NUM_CLIENTS:-2}" "$FL_SERVER_IP"

else
    echo "  [MODE] Starting Unified Local Orchestrator..."
    echo "  [PORT] Binding to port $PORT"
    python3 run_local.py
fi
