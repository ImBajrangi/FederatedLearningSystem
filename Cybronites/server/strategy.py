import flwr as fl
import numpy as np
from typing import List, Tuple, Union, Optional, Dict
from flwr.common import (
    Metrics, 
    Parameters, 
    Scalar, 
    parameters_to_ndarrays, 
    ndarrays_to_parameters,
    FitRes,
)
from flwr.server.client_proxy import ClientProxy
from utils.security import hash_model_weights
from utils.anomaly_detection import detect_anomaly
import asyncio
import time

# Bridge Import
try:
    from server.bridge import manager
except ImportError:
    try:
        from bridge import manager
    except ImportError:
        import sys
        import os
        sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
        from bridge import manager

class SecureFedAvg(fl.server.strategy.FedAvg):
    """
    Custom Flower Strategy that extends FedAvg with:
    1. SHA-256 weight hashing for each client.
    2. Statistical anomaly detection to filter malicious updates.
    3. Real-time status broadcasting to the AI Guardian Bridge.
    """
    def configure_fit(
        self, server_round: int, parameters: Parameters, client_manager: fl.server.client_manager.ClientManager
    ) -> List[Tuple[ClientProxy, fl.common.FitIns]]:
        """Broadcast 'TRAINING' status when the round starts."""
        manager.broadcast_sync({"type": "status_update", "status": "TRAINING"})
        return super().configure_fit(server_round, parameters, client_manager)

    def configure_evaluate(
        self, server_round: int, parameters: Parameters, client_manager: fl.server.client_manager.ClientManager
    ) -> List[Tuple[ClientProxy, fl.common.EvaluateIns]]:
        """Broadcast 'EVALUATING' status when evaluation starts."""
        manager.broadcast_sync({"type": "status_update", "status": "EVALUATING"})
        return super().configure_evaluate(server_round, parameters, client_manager)

    def aggregate_fit(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, FitRes]],
        failures: List[Union[Tuple[ClientProxy, FitRes], BaseException]],
    ) -> Tuple[Optional[Parameters], Dict[str, Scalar]]:
        if not results:
            return None, {}

        # 1. Extract weights and log SHA-256 hashes
        client_updates = []
        for client, res in results:
            weights = parameters_to_ndarrays(res.parameters)
            current_hash = hash_model_weights(weights)
            
            # Broadcast Log to Dashboard
            log_entry = {
                "client_id": client.cid,
                "status": "ACCEPTED",
                "timestamp": time.time(),
                "hash": current_hash[:16] + "..."
            }
            manager.broadcast_sync({"type": "log", "data": log_entry})
            
            print(f"Round {server_round} | Client {client.cid} | Weight Hash: {current_hash[:16]}...")
            client_updates.append(weights)

        # 2. Detect Anomalies (Malicious Clients)
        rejected_indices = detect_anomaly(client_updates, threshold=2.5)
        
        if rejected_indices:
            print(f"Round {server_round} | SECURITY ALERT: Rejected {len(rejected_indices)} malicious updates.")
            manager.broadcast_sync({"type": "status_update", "status": "SECURITY_ALERT"})
            filtered_results = [res for i, res in enumerate(results) if i not in rejected_indices]
            if not filtered_results:
                return None, {}
        else:
            filtered_results = results

        # 3. Aggregation Status
        manager.broadcast_sync({
            "type": "status_update", 
            "status": "AGGREGATING"
        })

        return super().aggregate_fit(server_round, filtered_results, failures)

    def aggregate_evaluate(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, fl.common.EvaluateRes]],
        failures: List[Union[Tuple[ClientProxy, fl.common.EvaluateRes], BaseException]],
    ) -> Tuple[Optional[float], Dict[str, Scalar]]:
        if not results:
            return None, {}
        
        accuracies = [r.metrics["accuracy"] * r.num_examples for _, r in results]
        examples = [r.num_examples for _, r in results]
        total_examples = sum(examples)
        aggregated_accuracy = sum(accuracies) / total_examples
        
        # Mapping to Dashboard Stats
        manager.broadcast_sync({
            "type": "global_update",
            "stats": {
                "round": server_round,
                "accuracy": float(aggregated_accuracy),
                "trust_score": float(aggregated_accuracy * 100), # Use accuracy as trust proxy
                "clients_active": len(results),
                "total_blocks": server_round, # Blocks = Rounds in this context
                "status": "WAITING"
            },
            "chain": [] 
        })
            
        print(f"Round {server_round} | GLOBAL ACCURACY: {aggregated_accuracy:.4f}")
        return super().aggregate_evaluate(server_round, results, failures)
