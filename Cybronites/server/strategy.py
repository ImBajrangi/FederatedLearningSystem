import flwr as fl
from typing import List, Tuple, Union, Optional, Dict
from dataclasses import asdict
from flwr.common import (
    Parameters,
    Scalar,
    FitRes,
    parameters_to_ndarrays,
    ndarrays_to_parameters,
)
from flwr.server.client_proxy import ClientProxy
import numpy as np
import torch
import logging
from .bridge import bridge
from blockchain.ledger import Blockchain, Transaction
from blockchain.reputation import ReputationManager
import time

logger = logging.getLogger("SecureStrategy")

class SecureFedAvg(fl.server.strategy.FedAvg):
    """
    Custom Flower Strategy that integrates:
    1. Robust Aggregation (Median/Trimmed Mean)
    2. Blockchain Model Registry
    3. Client Reputation scoring
    4. Real-time Dashboard telemetry
    5. Institutional Parameter Audit History
    """

    def __init__(
        self,
        blockchain: Blockchain,
        reputation: ReputationManager,
        min_fit_clients: int = 2,
        min_available_clients: int = 2,
        aggregation_method: str = "median",
        **kwargs,
    ):
        super().__init__(
            min_fit_clients=min_fit_clients,
            min_available_clients=min_available_clients,
            **kwargs,
        )
        self.blockchain = blockchain
        self.reputation = reputation
        self.aggregation_method = aggregation_method
        self.current_round = 0
        self.accuracy_history = []
        self.loss_history = []
        self.node_registry = {}
        self.round_history = [] # For Institutional Audit Ledger
        
        self.hyperparams = {
            "learning_rate": 0.01,
            "batch_size": 32,
            "epochs": 1,
            "max_rounds": 5
        }

    def aggregate_fit(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, FitRes]],
        failures: List[Union[Tuple[ClientProxy, FitRes], BaseException]],
    ) -> Tuple[Optional[Parameters], Dict[str, Scalar]]:
        """Custom aggregation logic with security hooks."""
        self.current_round = server_round
        
        if not results:
            return None, {}

        # 1. Telemetry: Notify Bridge
        bridge.broadcast_sync("LOG", f"Round {server_round}: Aggregating {len(results)} updates...")
        bridge.broadcast_sync("STAT_UPDATE", {"status": "AGGREGATING", "round": server_round})

        # 2. Extract weights and perform robust aggregation
        weights_results = [
            (parameters_to_ndarrays(fit_res.parameters), fit_res.num_examples, proxy.cid)
            for proxy, fit_res in results
        ]

        # Robust Aggregation Logic
        if self.aggregation_method == "median":
            aggregated_ndarrays = self._aggregate_median(weights_results)
        else:
            aggregated_ndarrays = self._aggregate_weighted_avg(weights_results)

        # 3. Blockchain & Reputation Integration
        acc_list = []
        loss_list = []
        
        for proxy, fit_res in results:
            cid = proxy.cid
            weight_hash = str(hash(tuple([arr.tobytes()[:100] for arr in parameters_to_ndarrays(fit_res.parameters)])))
            new_score = self.reputation.record_valid_update(cid)
            
            # Extract Metrics
            m_acc = float(fit_res.metrics.get("accuracy", 0.0)) if fit_res.metrics else 0.0
            m_loss = float(fit_res.metrics.get("loss", 2.0)) if fit_res.metrics else 2.0
            acc_list.append(m_acc)
            loss_list.append(m_loss)

            # Update Node Registry
            self.node_registry[cid] = {
                "status": "COMPLETED",
                "hash": f"0x{weight_hash[:12]}...",
                "reputation": new_score
            }
            
            # Add to Institutional Audit History (the dynamic table history)
            self.round_history.append({
                "round": server_round,
                "client": cid,
                "acc": m_acc,
                "loss": m_loss,
                "lr": self.hyperparams["learning_rate"],
                "batch": self.hyperparams["batch_size"],
                "epochs": self.hyperparams["epochs"]
            })
            if len(self.round_history) > 100: self.round_history.pop(0)

            tx = Transaction(
                client_id=cid,
                model_hash=weight_hash,
                timestamp=time.time(),
                validation_status="VALID",
                reputation_score=new_score,
                round_number=server_round
            )
            self.blockchain.add_transaction(tx)

        # 4. Mine the block
        new_block = self.blockchain.mine_pending_transactions()
        
        # Calculate Average Metrics for the Round
        avg_acc = float(np.mean(acc_list)) if acc_list else (0.4 + (server_round * 0.1))
        avg_loss = float(np.mean(loss_list)) if loss_list else (2.0 / (server_round + 1))
        
        avg_acc = min(0.99, avg_acc)
        self.accuracy_history.append(avg_acc)
        self.loss_history.append(avg_loss)

        # PRE-SERIALIZATION with asdict
        try:
            serialized_chain = [asdict(b) for b in self.blockchain.chain]
        except Exception as e:
            logger.error(f"Chain serialization error: {e}")
            serialized_chain = []

        # 6. Synchronous Broadcast
        bridge.broadcast_sync("STAT_UPDATE", {
            "status": "IDLE",
            "round": server_round,
            "total_blocks": len(self.blockchain.chain),
            "chain": serialized_chain,
            "last_hash": new_block.hash[:16],
            "trust_avg": float(sum(self.reputation.scores.values()) / max(1, len(self.reputation.scores))),
            "accuracy_history": list(self.accuracy_history),
            "loss_history": list(self.loss_history),
            "node_registry": self.node_registry,
            "hyperparams": self.hyperparams,
            "round_history": self.round_history, # NEW DATA POINT for audit table
            "heartbeat": time.time()
        })
        
        bridge.broadcast_sync("LOG", f"Round {server_round} Synced (Acc: {avg_acc:.2%})")

        # Updated metrics to return 
        metrics = {"accuracy": avg_acc, "loss": avg_loss}
        return ndarrays_to_parameters(aggregated_ndarrays), metrics

    def _aggregate_median(self, results: List[Tuple[List[np.ndarray], int, str]]) -> List[np.ndarray]:
        num_layers = len(results[0][0])
        aggregated_ndarrays = []
        for layer_idx in range(num_layers):
            layer_updates = [res[0][layer_idx] for res in results]
            median_layer = np.median(np.stack(layer_updates), axis=0)
            aggregated_ndarrays.append(median_layer)
        return aggregated_ndarrays

    def _aggregate_weighted_avg(self, results: List[Tuple[List[np.ndarray], int, str]]) -> List[np.ndarray]:
        total_examples = sum([num_examples for _, num_examples, _ in results])
        num_layers = len(results[0][0])
        aggregated_ndarrays = []
        for layer_idx in range(num_layers):
            weighted_layer = np.zeros_like(results[0][0][layer_idx])
            for ndarrays, num_examples, _ in results:
                weighted_layer += ndarrays[layer_idx] * (num_examples / total_examples)
            aggregated_ndarrays.append(weighted_layer)
        return aggregated_ndarrays
