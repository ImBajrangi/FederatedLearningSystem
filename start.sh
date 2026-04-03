#!/bin/bash

# AI Guardian: Hugging Face Initialization Script
echo "AI GUARDIAN | INITIALIZING STACK..."

# 1. Set Python Path for root and Cybronites modules
export PYTHONPATH=$PYTHONPATH:$(pwd):$(pwd)/Cybronites

# 2. Start the FL Server + Dashboard Bridge in the background
echo "AI GUARDIAN | STARTING ORCHESTRATOR & BRIDGE..."
python3 -m server.server &
SERVER_PID=$!

# 3. Wait for the server to be ready
sleep 15

# 4. Start Simulated Client 0
echo "AI GUARDIAN | JOINING CLIENT 0 (HealthAI / FinNet)..."
python3 -m client.client 0 2 &
CLIENT0_PID=$!

# 5. Start Simulated Client 1
echo "AI GUARDIAN | JOINING CLIENT 1 (HedgeFund / AutoDrive)..."
python3 -m client.client 1 2 &
CLIENT1_PID=$!

echo "AI GUARDIAN | ALL NODES ACTIVE. MONITORING AT PORT 7860."

# 6. Keep the script running
wait $SERVER_PID
