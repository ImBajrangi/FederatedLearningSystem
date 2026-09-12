import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset, Dataset
from torchvision import datasets, transforms
import os
import re
import threading
import time
import logging
import sys
import numpy as np
import hashlib

logger = logging.getLogger("TrainingEngine")


_DISPLAY_PATTERNS = [
    (r'plt\.show\s*\(.*?\)',           'pass  # [sanitized: plt.show]'),
    (r'plt\.savefig\s*\(.*?\)',        'pass  # [sanitized: plt.savefig]'),
    (r'\.show\s*\(\s*\)',              'pass  # [sanitized: .show()]'),
    (r'cv2\.imshow\s*\(.*?\)',         'pass  # [sanitized: cv2.imshow]'),
    (r'cv2\.waitKey\s*\(.*?\)',        'pass  # [sanitized: cv2.waitKey]'),
    (r'cv2\.destroyAllWindows\s*\(.*?\)', 'pass  # [sanitized: cv2.destroyAllWindows]'),
    (r'display\s*\(.*?\)',             'pass  # [sanitized: display()]'),
    (r'\.mainloop\s*\(\s*\)',          'pass  # [sanitized: .mainloop()]'),
    (r'input\s*\(.*?\)',               '"user_input"  # [sanitized: input()]'),
]

_HEADLESS_PREAMBLE = """
import os as _os
_os.environ['MPLBACKEND'] = 'Agg'
import matplotlib
matplotlib.use('Agg')
"""


def sanitize_code(code: str) -> str:
    sanitized = code
    for pattern, replacement in _DISPLAY_PATTERNS:
        sanitized = re.sub(pattern, replacement, sanitized)
    if 'matplotlib' in sanitized or 'plt' in sanitized:
        sanitized = _HEADLESS_PREAMBLE + sanitized
    return sanitized


def extract_error_line(tb_text: str) -> int:
    match = re.search(r'File "<laboratory>", line (\d+)', tb_text)
    if match:
        return int(match.group(1))
    return None


class TrainingSession:
    """
    Executes user code locally with direct access to local datasets,
    hardware acceleration, real-time telemetry streaming, and blockchain auditing.
    """
    def __init__(self, code, hyperparams, bridge_broadcast_callback):
        self.original_code = code
        self.code = sanitize_code(code)
        
        # Dynamically extract hyperparameters directly from user code if defined
        def _extract_var(pattern, default, cast_fn=int):
            match = re.search(pattern, self.original_code)
            if match:
                try:
                    return cast_fn(match.group(1))
                except Exception:
                    pass
            return default

        code_epochs = _extract_var(r'epochs\s*=\s*(\d+)', None, int)
        code_lr = _extract_var(r'lr\s*=\s*([0-9\.e\-]+)', None, float)
        code_batch = _extract_var(r'batch_size\s*=\s*(\d+)', None, int)

        self.epochs = code_epochs if code_epochs is not None else hyperparams.get("epochs", 10)
        self.lr = code_lr if code_lr is not None else hyperparams.get("lr", 0.001)
        self.batch_size = code_batch if code_batch is not None else hyperparams.get("batch_size", 32)
        
        # Guard bounds
        self.epochs = max(1, min(100, self.epochs))
        self.batch_size = max(1, min(1024, self.batch_size))
        
        self.broadcast = bridge_broadcast_callback
        self.stop_event = threading.Event()
        self.model = None
        self.status = "IDLE"
        self.progress = 0
        self.mode = "FEDERATED"
        self.metrics = {"loss": [], "accuracy": []}
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_path = None
        self._vault_data = None

    def run(self):
        try:
            from Cybronites.server.vault_loader import VaultLoader, wipe_tracked_buffers
            vault_instance = VaultLoader()
        except Exception:
            vault_instance = None

        try:
            self.status = "TRAINING"
            self.broadcast("LOG", f"SYSTEM: 🚀 Starting execution on device: {self.device}...")

            namespace = {
                '__builtins__': __builtins__,
                'print': self._safe_print,
                'vault': vault_instance,
                'torch': torch,
                'nn': nn,
                'F': nn.functional,
                'np': np,
                'numpy': np,
                'DataLoader': DataLoader,
                'TensorDataset': TensorDataset,
            }

            old_stdout = sys.stdout
            captured = _OutputCapture(self._safe_print)
            sys.stdout = captured

            try:
                exec(self.code, namespace)
            finally:
                sys.stdout = old_stdout

            # Detect neural network model class or instance
            model_class = None
            model_instance = None
            for name, obj in namespace.items():
                if name.startswith("_"):
                    continue
                if isinstance(obj, type) and issubclass(obj, nn.Module) and obj is not nn.Module:
                    model_class = obj
                    break
                elif isinstance(obj, nn.Module):
                    model_instance = obj
                    model_class = obj.__class__
                    break

            if not model_class and not model_instance:
                self.mode = "SCRIPT"
                self.status = "COMPLETE"
                self.progress = 100
                self.broadcast("LAB_PROGRESS", {
                    "epoch": 0, "total_epochs": 0, "loss": 0,
                    "accuracy": 0, "progress": 100,
                    "status": "COMPLETE", "mode": "SCRIPT"
                })
                self.broadcast("LAB_COMPLETE", {
                    "status": "COMPLETE", "mode": "SCRIPT",
                    "metrics": self.metrics
                })
                self.broadcast("LOG", "SYSTEM: ✅ Script execution complete (direct local execution).")
                return

            self.mode = "FEDERATED"
            model_name = model_class.__name__ if model_class else "CustomModel"
            self.broadcast("LOG", f"SYSTEM: Model detected: {model_name}. Initializing local training on device: {self.device}...")

            if model_instance:
                self.model = model_instance.to(self.device)
            else:
                self.model = model_class().to(self.device)

            param_count = sum(p.numel() for p in self.model.parameters() if p.requires_grad)
            self.broadcast("LOG", f"SYSTEM: Model has {param_count:,} trainable parameters.")

            optimizer = optim.Adam(self.model.parameters(), lr=self.lr)

            train_loader, test_loader, ds_name = self._prepare_data(
                namespace, vault_instance, model_class
            )

            self.broadcast("LOG", f"SYSTEM: Local Dataset: {ds_name} (batch_size={self.batch_size})")
            self.broadcast("LOG", f"SYSTEM: Training for {self.epochs} epochs at lr={self.lr}...")

            for epoch in range(self.epochs):
                if self.stop_event.is_set():
                    self.status = "ABORTED"
                    self.broadcast("LOG", "SYSTEM: Training aborted by user.")
                    self.broadcast("LAB_PROGRESS", {"status": "ABORTED", "progress": self.progress})
                    return

                self.model.train()
                running_loss = 0.0
                correct_train = 0
                total_train = 0

                for batch_idx, batch in enumerate(train_loader):
                    if self.stop_event.is_set():
                        break
                    
                    if isinstance(batch, (list, tuple)) and len(batch) >= 2:
                        data, target = batch[0], batch[1]
                    else:
                        data, target = batch, batch

                    data, target = data.to(self.device), target.to(self.device)
                    optimizer.zero_grad()
                    output = self.model(data)

                    if target.dtype in (torch.int64, torch.int32, torch.long) and output.dim() >= 2 and output.shape[-1] > 1:
                        loss = nn.functional.cross_entropy(output, target.long().view(-1))
                    elif output.shape == target.shape:
                        loss = nn.functional.mse_loss(output, target.float())
                    elif output.dim() >= 2 and output.shape[-1] == 1:
                        loss = nn.functional.binary_cross_entropy_with_logits(output.view(-1), target.float().view(-1))
                    else:
                        loss = nn.functional.cross_entropy(output, target.long().view(-1))

                    loss.backward()
                    optimizer.step()
                    running_loss += loss.item()

                    # Dynamic calculation of training accuracy
                    if output.dim() >= 2 and output.shape[-1] > 1:
                        pred = output.argmax(dim=-1)
                        target_cls = target.argmax(dim=-1) if (target.dim() > 1 and target.shape[-1] > 1) else target.view(-1)
                        correct_train += (pred == target_cls).sum().item()
                    elif output.shape == target.shape:
                        correct_train += (output.round() == target.round()).sum().item()
                    else:
                        pred = (output.view(-1) > 0.0).long()
                        correct_train += (pred == target.view(-1).long()).sum().item()
                    total_train += len(data)

                # Validation step
                self.model.eval()
                correct_val = 0
                total_val = 0
                val_loss = 0.0
                with torch.no_grad():
                    for batch in test_loader:
                        if isinstance(batch, (list, tuple)) and len(batch) >= 2:
                            data, target = batch[0], batch[1]
                        else:
                            data, target = batch, batch

                        data, target = data.to(self.device), target.to(self.device)
                        output = self.model(data)

                        if target.dtype in (torch.int64, torch.int32, torch.long) and output.dim() >= 2 and output.shape[-1] > 1:
                            v_l = nn.functional.cross_entropy(output, target.long().view(-1))
                        elif output.shape == target.shape:
                            v_l = nn.functional.mse_loss(output, target.float())
                        elif output.dim() >= 2 and output.shape[-1] == 1:
                            v_l = nn.functional.binary_cross_entropy_with_logits(output.view(-1), target.float().view(-1))
                        else:
                            v_l = nn.functional.cross_entropy(output, target.long().view(-1))
                        
                        val_loss += getattr(v_l, 'item', lambda: 0.0)()

                        if output.dim() >= 2 and output.shape[-1] > 1:
                            pred = output.argmax(dim=-1)
                            target_cls = target.argmax(dim=-1) if (target.dim() > 1 and target.shape[-1] > 1) else target.view(-1)
                            correct_val += (pred == target_cls).sum().item()
                        elif output.shape == target.shape:
                            correct_val += (output.round() == target.round()).sum().item()
                        else:
                            pred = (output.view(-1) > 0.0).long()
                            correct_val += (pred == target.view(-1).long()).sum().item()
                        total_val += len(data)

                val_acc = (correct_val / total_val) if total_val > 0 else 0.0
                train_acc = (correct_train / total_train) if total_train > 0 else 0.0
                # Use validation accuracy if available, else train accuracy
                accuracy = val_acc if total_val > 0 else train_acc
                avg_loss = running_loss / max(len(train_loader), 1)

                self.metrics["loss"].append(float(avg_loss))
                self.metrics["accuracy"].append(float(accuracy))
                self.progress = ((epoch + 1) / self.epochs) * 100

                self.broadcast("LAB_PROGRESS", {
                    "epoch": epoch + 1,
                    "total_epochs": self.epochs,
                    "loss": float(avg_loss),
                    "accuracy": float(accuracy),
                    "train_accuracy": float(train_acc),
                    "val_accuracy": float(val_acc),
                    "progress": float(self.progress),
                    "status": "TRAINING",
                    "mode": "FEDERATED"
                })

                self.broadcast("LOG",
                    f"Epoch {epoch+1}/{self.epochs} — "
                    f"Loss: {avg_loss:.4f} | "
                    f"Train Acc: {train_acc:.2%} | "
                    f"Val Acc: {accuracy:.2%}"
                )

            # Export model files
            save_dir = os.path.join(os.getcwd(), "exports")
            os.makedirs(save_dir, exist_ok=True)

            timestamp = int(time.time())
            self.model_path = os.path.join(save_dir, f"model_{timestamp}.pt")
            torch.save(self.model.state_dict(), self.model_path)
            self.broadcast("LOG", f"SYSTEM: 💾 Model weights exported → {self.model_path}")

            # Fingerprint model weights for Blockchain Audit
            weight_bytes = open(self.model_path, "rb").read()
            model_hash = hashlib.sha256(weight_bytes).hexdigest()

            # Record model on Blockchain
            try:
                from Cybronites.server.distributed_coordinator import DistributedCoordinator
                from blockchain.ledger import Transaction
                coord = DistributedCoordinator.get_instance()
                final_acc = self.metrics["accuracy"][-1] if self.metrics["accuracy"] else 0.0
                tx = Transaction(
                    client_id="LOCAL_USER_LAB",
                    model_hash=model_hash,
                    timestamp=time.time(),
                    validation_status="VALID",
                    reputation_score=100.0,
                    round_number=coord.round or 1,
                    tx_type="MODEL_UPDATE",
                    rejection_reason="",
                )
                tx_id = coord.blockchain.add_transaction(tx)
                mined_b = coord.blockchain.mine_pending_transactions(miner="LOCAL_LAB_NODE")
                self.broadcast("LOG", f"⛓️ BLOCKCHAIN AUDIT: Model {model_name} committed to Block #{mined_b.index} (Hash: {mined_b.hash[:16]}..., Tx: {tx_id[:10]}...)")
                self.broadcast("BLOCK_MINED", {
                    "block": mined_b.to_dict(),
                    "chain_length": len(coord.blockchain.chain),
                    "is_valid": coord.blockchain.validate_chain(),
                })
            except Exception as b_err:
                logger.warning(f"Blockchain auto-record deferred: {b_err}")

            onnx_path = os.path.join(save_dir, f"model_{timestamp}.onnx")
            try:
                sample = next(iter(train_loader))
                sample_input = sample[0][:1].to(self.device) if isinstance(sample, (list, tuple)) else sample[:1].to(self.device)
                torch.onnx.export(self.model, sample_input, onnx_path)
                self.broadcast("LOG", f"SYSTEM: ⚡ ONNX export saved → {onnx_path}")
            except Exception as e:
                logger.warning(f"ONNX export skipped: {e}")
                onnx_path = None

            self.status = "COMPLETE"
            self.broadcast("LAB_COMPLETE", {
                "status": "COMPLETE",
                "mode": "FEDERATED",
                "dataset": ds_name,
                "pt_path": self.model_path,
                "onnx_path": onnx_path,
                "metrics": self.metrics,
                "final_accuracy": self.metrics["accuracy"][-1] if self.metrics["accuracy"] else 0,
                "final_loss": self.metrics["loss"][-1] if self.metrics["loss"] else 0,
                "epoch": self.epochs,
                "total_epochs": self.epochs,
            })

            final_acc = self.metrics["accuracy"][-1] if self.metrics["accuracy"] else 0
            self.broadcast("LOG",
                f"SYSTEM: ✅ Training complete! "
                f"Final Accuracy: {final_acc:.2%} | "
                f"Model SHA-256: {model_hash[:16]}..."
            )

        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            self.status = "ERROR"
            error_line = extract_error_line(tb)
            error_msg = str(e)

            logger.error(f"Training Error: {error_msg}\n{tb}")
            self.broadcast("LAB_ERROR", {
                "error": error_msg,
                "line": error_line,
                "traceback": tb
            })
            self.broadcast("LOG", f"FATAL: {error_msg}")

        finally:
            try:
                from Cybronites.server.vault_loader import wipe_tracked_buffers
                wipe_tracked_buffers()
            except Exception:
                pass
            import gc
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

    def _prepare_data(self, namespace, vault_instance, model_class):
        """Detect data source: user loaders, user datasets, vault dataset, or fallback."""
        
        # 1. Direct user-provided DataLoaders
        if "train_loader" in namespace and isinstance(namespace["train_loader"], DataLoader):
            train_loader = namespace["train_loader"]
            test_loader = namespace.get("test_loader", train_loader)
            return train_loader, test_loader, "Custom train_loader (Code)"

        # 2. Direct user-provided Datasets
        if "train_dataset" in namespace and isinstance(namespace["train_dataset"], Dataset):
            train_ds = namespace["train_dataset"]
            test_ds = namespace.get("test_dataset", train_ds)
            train_loader = DataLoader(train_ds, batch_size=self.batch_size, shuffle=True)
            test_loader = DataLoader(test_ds, batch_size=self.batch_size, shuffle=False)
            return train_loader, test_loader, "Custom train_dataset (Code)"

        # 3. User tensors or numpy arrays (X, y or data, labels)
        vault_tensors_x = None
        vault_tensors_y = None
        ds_name = "Local Vault Dataset"

        for var_name in ["data", "X", "train_x", "features", "inputs"]:
            if var_name in namespace:
                val = namespace[var_name]
                if isinstance(val, torch.Tensor):
                    vault_tensors_x = val.float()
                    ds_name = f"Local ({var_name})"
                    break
                elif isinstance(val, np.ndarray):
                    vault_tensors_x = torch.tensor(val, dtype=torch.float32)
                    ds_name = f"Local ({var_name})"
                    break

        for var_name in ["labels", "y", "train_y", "targets"]:
            if var_name in namespace:
                val = namespace[var_name]
                if isinstance(val, torch.Tensor):
                    vault_tensors_y = val.long()
                    break
                elif isinstance(val, np.ndarray):
                    vault_tensors_y = torch.tensor(val, dtype=torch.long)
                    break

        if vault_tensors_x is None and vault_instance is not None:
            # Dynamic auto-binding based on model name
            m_name = (model_class.__name__ if model_class else "").lower()
            try:
                if "mnist" in m_name or "conv" in m_name:
                    X_np, y_np, info = vault_instance.load("MNIST")
                    vault_tensors_x = torch.tensor(X_np, dtype=torch.float32)
                    vault_tensors_y = torch.tensor(y_np, dtype=torch.long)
                    ds_name = f"Privacy Vault (MNIST Partition)"
                elif "iris" in m_name:
                    X_np, y_np, info = vault_instance.load("Iris")
                    vault_tensors_x = torch.tensor(X_np, dtype=torch.float32)
                    vault_tensors_y = torch.tensor(y_np, dtype=torch.long)
                    ds_name = f"Privacy Vault (Iris Partition)"
                elif "digit" in m_name:
                    X_np, y_np, info = vault_instance.load("Digits")
                    vault_tensors_x = torch.tensor(X_np, dtype=torch.float32)
                    vault_tensors_y = torch.tensor(y_np, dtype=torch.long)
                    ds_name = f"Privacy Vault (Digits Partition)"
                elif "wine" in m_name:
                    X_np, y_np, info = vault_instance.load("Wine")
                    vault_tensors_x = torch.tensor(X_np, dtype=torch.float32)
                    vault_tensors_y = torch.tensor(y_np, dtype=torch.long)
                    ds_name = f"Privacy Vault (Wine Partition)"
            except Exception as v_err:
                logger.warning(f"Vault auto-bind fallback: {v_err}")

        if vault_tensors_x is not None and vault_tensors_y is not None:
            # Adaptive dynamic tensor reshaping for ConvNet vs Linear architectures
            if self.model is not None:
                # Check if model has 2D Conv layers
                has_conv = any(isinstance(m, (nn.Conv2d, nn.Conv1d)) for m in self.model.modules())
                if has_conv:
                    if vault_tensors_x.dim() == 2:
                        if vault_tensors_x.size(1) == 784:
                            vault_tensors_x = vault_tensors_x.view(-1, 1, 28, 28)
                        elif vault_tensors_x.size(1) == 64:
                            vault_tensors_x = vault_tensors_x.view(-1, 1, 8, 8)
                        else:
                            side = int(np.sqrt(vault_tensors_x.size(1)))
                            if side * side == vault_tensors_x.size(1):
                                vault_tensors_x = vault_tensors_x.view(-1, 1, side, side)
                    elif vault_tensors_x.dim() == 3:
                        vault_tensors_x = vault_tensors_x.unsqueeze(1)

            self.broadcast("LOG", f"SYSTEM: 🔐 Using local decrypted data tensor: {tuple(vault_tensors_x.shape)} ({len(vault_tensors_x)} samples)")
            n = len(vault_tensors_x)
            split = max(1, int(0.8 * n))
            train_ds = TensorDataset(vault_tensors_x[:split], vault_tensors_y[:split])
            test_ds = TensorDataset(vault_tensors_x[split:] if split < n else vault_tensors_x[:split],
                                     vault_tensors_y[split:] if split < n else vault_tensors_y[:split])

            batch_sz = min(self.batch_size, split)
            train_loader = DataLoader(train_ds, batch_size=max(1, batch_sz), shuffle=True)
            test_loader = DataLoader(test_ds, batch_size=min(1000, max(1, n - split)), shuffle=False)
            return train_loader, test_loader, ds_name

        # 4. Fallback to MNIST
        self.broadcast("LOG", f"SYSTEM: Loading local MNIST dataset (batch_size={self.batch_size})...")
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize((0.1307,), (0.3081,))
        ])
        try:
            train_dataset = datasets.MNIST('./data', train=True, download=True, transform=transform)
            train_loader = DataLoader(train_dataset, batch_size=self.batch_size, shuffle=True)

            test_dataset = datasets.MNIST('./data', train=False, transform=transform)
            test_loader = DataLoader(test_dataset, batch_size=1000, shuffle=False)
            return train_loader, test_loader, "MNIST (Local Shard)"
        except Exception:
            # Pure local synthetic tensor dataset
            np.random.seed(42)
            X = torch.randn(500, 1, 28, 28, dtype=torch.float32)
            y = torch.randint(0, 10, (500,), dtype=torch.long)
            train_ds = TensorDataset(X[:400], y[:400])
            test_ds = TensorDataset(X[400:], y[400:])
            return DataLoader(train_ds, batch_size=self.batch_size, shuffle=True), DataLoader(test_ds, batch_size=100), "MNIST (Synthetic Fallback)"

    def _safe_print(self, *args, **kwargs):
        msg = ' '.join(str(a) for a in args)
        self.broadcast("LOG", f"[stdout] {msg}")

    def abort(self):
        self.stop_event.set()


class _OutputCapture:
    def __init__(self, callback):
        self._callback = callback
    def write(self, text):
        text = text.strip()
        if text:
            self._callback(text)
    def flush(self):
        pass


_current_session = None

def start_training(code, hyperparams, broadcast_callback):
    global _current_session
    if _current_session and _current_session.status == "TRAINING":
        return False, "A training session is already in progress."

    _current_session = TrainingSession(code, hyperparams, broadcast_callback)
    thread = threading.Thread(target=_current_session.run, daemon=True)
    thread.start()
    return True, "Training started on local system."

def abort_training():
    global _current_session
    if _current_session:
        _current_session.abort()
        return True
    return False

def get_session_status():
    if _current_session:
        return {
            "status": _current_session.status,
            "progress": _current_session.progress,
            "mode": _current_session.mode,
            "metrics": _current_session.metrics
        }
    return {"status": "IDLE"}
