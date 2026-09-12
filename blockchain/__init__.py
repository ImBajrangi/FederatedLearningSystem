"""Blockchain-based Federated Learning infrastructure.

Provides an immutable distributed ledger, smart contract validation,
consensus mechanisms, and a reputation system for secure FL.
"""
from .ledger import Block, Blockchain, Transaction, RealtimeBlockchain

try:
    from .smart_contract import ValidationContract, AggregationContract
except ImportError:
    ValidationContract = None
    AggregationContract = None

try:
    from .consensus import ProofOfAccuracy
except ImportError:
    ProofOfAccuracy = None

try:
    from .reputation import ReputationManager
except ImportError:
    ReputationManager = None

__all__ = [
    'Block', 'Blockchain', 'RealtimeBlockchain', 'Transaction',
    'ValidationContract', 'AggregationContract',
    'ProofOfAccuracy',
    'ReputationManager',
]
