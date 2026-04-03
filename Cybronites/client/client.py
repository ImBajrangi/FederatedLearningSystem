import flwr as fl
import torch
import numpy as np
import sys
import os

# Add absolute project root (secure_federated_learning/Cybronites) to sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from client.model import MNISTNet, train, test
    from client.dataset import load_data
    from server.bridge import manager
except ImportError:
    try:
        from model import MNISTNet, train, test
        from dataset import load_data
        from bridge import manager
    except ImportError:
        # Final fallback for complex sub-package resolutions
        from model import MNISTNet, train, test
        from dataset import load_data
        from bridge import manager

# Use CPU or GPU (CUDA/MPS)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class FlowerClient(fl.client.NumPyClient):
    """
    Flower Client implementation for MNIST training.
    """
    def __init__(self, client_id, train_loader, test_loader):
        self.client_id = client_id
        self.model = MNISTNet().to(device)
        self.train_loader = train_loader
        self.test_loader = test_loader

    def get_parameters(self, config):
        """
        Returns model parameters as a list of NumPy ndarrays.
        """
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters):
        """
        Sets model parameters from a list of NumPy ndarrays.
        """
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        """
        Local training on the client side.
        """
        self.set_parameters(parameters)
        optimizer = torch.optim.SGD(self.model.parameters(), lr=0.01, momentum=0.9)
        
        print(f"Client {self.client_id} | Round starting training...")
        train(self.model, self.train_loader, optimizer, epochs=1, device=device)
        
        return self.get_parameters(config={}), len(self.train_loader.dataset), {}

    def evaluate(self, parameters, config):
        """
        Local evaluation on the client side.
        """
        self.set_parameters(parameters)
        loss, accuracy = test(self.model, self.test_loader, device=device)
        
        print(f"Client {self.client_id} | Round evaluation -> Accuracy: {accuracy:.4f}")
        return float(loss), len(self.test_loader.dataset), {"accuracy": float(accuracy)}

def main():
    """
    Main function to start the Flower client.
    """
    client_id = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    num_clients = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    
    print(f"AI GUARDIAN | STARTING CLIENT {client_id}...")
    
    # Load partitioned data
    train_loader, test_loader = load_data(client_id=client_id, num_clients=num_clients)
    
    # Start Flower client
    flower_port = int(os.environ.get("FLOWER_PORT", 8095))
    fl.client.start_numpy_client(
        server_address=f"127.0.0.1:{flower_port}",
        client=FlowerClient(client_id, train_loader, test_loader),
    )

if __name__ == "__main__":
    main()
