#!/bin/bash

# AI Guardian: Flexible Role-Based Startup Script
echo "AI GUARDIAN | INITIALIZING STACK AS ROLE: ${ROLE:-UNIFIED}"

# Ensure we are in the script directory
cd "$(dirname "$0")"

# Configure defaults
FL_SERVER_IP=${SERVER_IP:-"127.0.0.1"}
FLOWER_PORT=${FLOWER_PORT:-8095}
ROUNDS=${ROUNDS:-5}

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
    python3 run_local.py
fi
