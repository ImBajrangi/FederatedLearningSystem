Option 1: Direct Execution

.venv/bin/python join.py --file Cybronites/client/model.py --name "Hospital-Alpha"

Option 2: Activate Environment First

source .venv/bin/activate
python join.py --file Cybronites/client/model.py --name "Hospital-Alpha"

The virtual environment .venv is configured and verified.

You can now run your node participant command:

.venv/bin/python join.py --file Cybronites/client/model.py --name "Hospital-Alpha"
Or activate the environment in your shell:

source .venv/bin/activate
python join.py --file Cybronites/client/model.py --name "Hospital-Alpha"

You can download the active global model parameters directly via HTTP:

# Get the global model parameter dictionary
curl -X GET "https://mdark4025-cybronites.hf.space/api/v1/distributed/get-model" -o global_model.json
