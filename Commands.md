# 🚀 Node Client Commands & Model Synchronization

### 1. Interactive Model Selection (Prompts you to choose or enter file path)
```bash
.venv/bin/python join.py --name "Hospital-Alpha"
```

### 2. Run with Specific Model File (Syncs code directly to platform)
```bash
# Default Architecture
.venv/bin/python join.py --file Cybronites/client/model.py --name "Hospital-Alpha"

# Custom Architecture File (e.g., custom_resnet.py)
.venv/bin/python join.py --file path/to/your_model.py --name "Hospital-Beta"
```

### 3. Or Activate Virtual Environment First
```bash
source .venv/bin/activate
python join.py
```

### 4. Fetch Active Global Model from Network
```bash
curl -X GET "https://mdark4025-cybronites.hf.space/api/v1/distributed/get-model" -o global_model.json
```

---

## 🌐 Connect Node to Hugging Face Cloud Space

### Option A: Direct Python Script
```bash
python join.py --server https://mdark4025-cybronites.hf.space --name "Hospital-Alpha"
```

### Option B: Zero-Install 1-Command CLI (via curl)
```bash
python3 -c "$(curl -sSL https://mdark4025-cybronites.hf.space/join.py)" -- --server https://mdark4025-cybronites.hf.space --name "Hospital-Alpha"
```
