import { useState, useEffect, useCallback } from 'react';

export interface Client {
  id: string;
  org: string;
  isMalicious: boolean;
  reputation: number;
  status: 'ACTIVE' | 'BLOCKED';
  validCount: number;
}

export interface Transaction {
  peer: string;
  status: 'GREEN' | 'RED';
  action: 'REWARD' | 'PENALTY';
}

export interface Block {
  index: number;
  hash: string;
  transactions: Transaction[];
}

export interface SimulationConfig {
  clients: number;
  rounds: number;
  maliciousRatio: number;
  repInitial: number;
  repThreshold: number;
  repReward: number;
  repPenalty: number;
}

const DEFAULT_CONFIG: SimulationConfig = {
  clients: 8,
  rounds: 6,
  maliciousRatio: 0.25,
  repInitial: 100,
  repThreshold: 30,
  repReward: 10,
  repPenalty: 25
};

export function useSimulation() {
  const [round, setRound] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [blockchain, setBlockchain] = useState<Block[]>([
    { index: 0, hash: '0x0000_GENESIS', transactions: [] }
  ]);
  const [clients, setClients] = useState<Client[]>([]);
  const [accuracyHistory, setAccuracyHistory] = useState<number[]>([0.12]);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [logs, setLogs] = useState<{msg: string, color: string}[]>([]);

  const addLog = useCallback((msg: string, color: string = 'gray') => {
    setLogs(prev => [...prev.slice(-99), { msg: `> ${msg}`, color }]);
  }, []);

  const initClients = useCallback(() => {
    const types = ['Hospital', 'FinTech', 'AutoDrive', 'Retail', 'Logistics', 'HealthAI', 'EdTech', 'GovNet'];
    const numMal = Math.floor(DEFAULT_CONFIG.clients * DEFAULT_CONFIG.maliciousRatio);
    const newClients: Client[] = Array.from({ length: DEFAULT_CONFIG.clients }, (_, i) => ({
      id: `P-${i.toString().padStart(2, '0')}`,
      org: types[i % types.length],
      isMalicious: i < numMal,
      reputation: DEFAULT_CONFIG.repInitial,
      status: 'ACTIVE',
      validCount: 0
    }));
    setClients(newClients);
    addLog('[INIT] Blockchain-based Secure Federated Learning Engine v2.0', '#13ec49');
    addLog('[AUTH] Credential rotation system active.', '#94a3b8');
  }, [addLog]);

  useEffect(() => {
    const saved = localStorage.getItem('bcfl_state_react');
    if (saved) {
      const parsed = JSON.parse(saved);
      setRound(parsed.round);
      setBlockchain(parsed.blockchain);
      setClients(parsed.clients);
      setAccuracyHistory(parsed.accuracyHistory);
      setRejectedCount(parsed.rejectedCount);
    } else {
      initClients();
    }
  }, [initClients]);

  useEffect(() => {
    if (clients.length > 0) {
      localStorage.setItem('bcfl_state_react', JSON.stringify({
        round, blockchain, clients, accuracyHistory, rejectedCount
      }));
    }
  }, [round, blockchain, clients, accuracyHistory, rejectedCount]);

  const runRound = useCallback(async () => {
    setRound(prev => {
      const nextRound = prev + 1;
      addLog(`[ROUND ${nextRound}] Broadcast Phase triggered...`, '#13ec49');
      
      let acceptedThisRound = 0;
      const txs: Transaction[] = [];

      setClients(currentClients => {
        return currentClients.map(c => {
          if (c.status === 'BLOCKED') return c;
          
          let newRep = c.reputation;
          let newStatus: 'ACTIVE' | 'BLOCKED' = c.status;
          let newValidCount = c.validCount;

          if (c.isMalicious) {
            newRep = Math.max(0, c.reputation - DEFAULT_CONFIG.repPenalty);
            setRejectedCount(rc => rc + 1);
            addLog(`  [-] Rejected ${c.id} (${c.org}): Anomaly detected by Smart Contract.`, '#ef4444');
            txs.push({ peer: c.id, status: 'RED', action: 'PENALTY' });
          } else {
            newRep = Math.min(200, c.reputation + DEFAULT_CONFIG.repReward);
            newValidCount++;
            acceptedThisRound++;
            addLog(`  [+] Validated ${c.id}: L2-Norm within baseline. Accepting shares.`, '#13ec49');
            txs.push({ peer: c.id, status: 'GREEN', action: 'REWARD' });
          }

          if (newRep < DEFAULT_CONFIG.repThreshold) {
            newStatus = 'BLOCKED' as const;
            addLog(`  [!] NODE ${c.id} BLACKLISTED. Cumulative trust failure.`, '#ef4444');
          }

          return { ...c, reputation: newRep, status: newStatus, validCount: newValidCount };
        });
      });

      // Update Blockchain
      const hash = '0x' + Math.random().toString(16).substr(2, 12).toUpperCase();
      setBlockchain(prevChain => [...prevChain, { index: nextRound, hash, transactions: txs }]);

      // Update Accuracy
      setAccuracyHistory(prevAccHistory => {
        const prevAcc = prevAccHistory[prevAccHistory.length - 1];
        const boost = acceptedThisRound > 2 ? (0.05 + Math.random() * 0.1) : -0.05;
        return [...prevAccHistory, Math.min(0.985, Math.max(0.1, prevAcc + boost))];
      });

      return nextRound;
    });
  }, [addLog]);

  const startExecution = useCallback(async () => {
    if (isActive) return;
    setIsActive(true);
    
    // We can't use a simple loop because of state updates, 
    // so we'll use a recursive timeout or a useEffect trigger.
  }, [isActive]);

  const clearSimulation = useCallback(() => {
    localStorage.removeItem('bcfl_state_react');
    window.location.reload();
  }, []);

  return {
    round,
    isActive,
    blockchain,
    clients,
    accuracyHistory,
    rejectedCount,
    logs,
    runRound,
    startExecution,
    clearSimulation,
    setIsActive
  };
}
