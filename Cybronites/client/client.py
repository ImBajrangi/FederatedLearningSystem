import flwr as fl
import torch
import numpy as np
import sys
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GuardianClient")

# Ensure project root is in path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from Cybronites.client.model import MNISTNet, train, test
    from Cybronites.client.dataset import load_data
    from security.privacy import apply_dp_to_updates, DPSpec
except ImportError:
    # Local fallback
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from model import MNISTNet, train, test
    from dataset import load_data
    from security.privacy import apply_dp_to_updates, DPSpec

# Use CPU or GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class FlowerClient(fl.client.NumPyClient):
    """
    Secure Flower Client with Differential Privacy (DP) integration.
    """
    def __init__(self, client_id, train_loader, test_loader):
        self.client_id = client_id
        self.model = MNISTNet().to(device)
        self.train_loader = train_loader
        self.test_loader = test_loader
        self.dp_spec = DPSpec(l2_norm_clip=1.0, noise_multiplier=0.01)

    def get_parameters(self, config):
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters):
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        """
        Local training with DP noise injection.
        """
        # Save initial parameters to compute the update (delta)
        initial_params = [torch.tensor(p).to(device) for p in parameters]
        self.set_parameters(parameters)
        
        optimizer = torch.optim.SGD(self.model.parameters(), lr=0.01, momentum=0.9)
        logger.info(f"Client {self.client_id} | Training locally...")
        last_loss, last_acc = train(self.model, self.train_loader, optimizer, epochs=1, device=device)
        
        # Compute Parameter Update (Delta)
        new_params = [val.cpu() for _, val in self.model.state_dict().items()]
        updates_dict = {}
        for i, (name, param) in enumerate(self.model.state_dict().items()):
             updates_dict[name] = new_params[i] - initial_params[i].cpu()

        # Apply Differential Privacy
        logger.info(f"Client {self.client_id} | Applying DP Noise (ε-privacy)...")
        dp_updates = apply_dp_to_updates(updates_dict, self.dp_spec)
        
        # Reconstruct final parameters: initial + dp_delta
        final_params = []
        for i, (name, _) in enumerate(self.model.state_dict().items()):
            param_with_noise = initial_params[i].cpu() + dp_updates[name]
            final_params.append(param_with_noise.numpy())

        return final_params, len(self.train_loader.dataset), {"accuracy": float(last_acc), "loss": float(last_loss)}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        loss, accuracy = test(self.model, self.test_loader, device=device)
        logger.info(f"Client {self.client_id} | Accuracy: {accuracy:.4f}")
        return float(loss), len(self.test_loader.dataset), {"accuracy": float(accuracy)}

def main():
    client_id = sys.argv[1] if len(sys.argv) > 1 else "0"
    num_clients = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    
    logger.info(f"Starting Guardian Client {client_id}...")
    train_loader, test_loader = load_data(client_id=int(client_id), num_clients=num_clients)
    
    flower_port = int(os.environ.get("FLOWER_PORT", 8080))
    fl.client.start_numpy_client(
        server_address=f"127.0.0.1:{flower_port}",
        client=FlowerClient(client_id, train_loader, test_loader),
    )

if __name__ == "__main__":
    main()
