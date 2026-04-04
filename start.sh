#!/bin/bash

# AI Guardian: Global Deployment Initialization Script
echo "AI GUARDIAN | INITIALIZING STACK..."

# 1. Set Python Path for root and Cybronites modules
export PYTHONPATH=$PYTHONPATH:$(pwd):$(pwd)/Cybronites

# 2. Start the FL Server + Dashboard Bridge (FastAPI)
# Note: server.py starts the bridge on $PORT (7860 in HF)
echo "AI GUARDIAN | STARTING ORCHESTRATOR & DASHBOARD BRIDGE..."
python3 Cybronites/server/server.py &
SERVER_PID=$!

# 3. Wait for the server to be ready for clients
echo "AI GUARDIAN | WAITING FOR gRPC HANDSHAKE..."
sleep 15

# 4. Start Simulated Client 0 (Real Training Node)
echo "AI GUARDIAN | JOINING CLIENT 0 (HealthAI Hub)..."
python3 Cybronites/client/client.py 0 2 &
CLIENT0_PID=$!

# 5. Start Simulated Client 1 (Financial Grid)...
echo "AI GUARDIAN | JOINING CLIENT 1 (AssetSync)..."
python3 Cybronites/client/client.py 1 2 &
CLIENT1_PID=$!

echo "AI GUARDIAN | ALL NODES ACTIVE. ACCESSIBLE VIA PORT $PORT."

# 6. Keep the script running
wait $SERVER_PID
