import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000';
const WS_URL = 'ws://127.0.0.1:8000/ws';

export function useSecureFederated() {
  const [round, setRound] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [blockchain, setBlockchain] = useState([
    { index: 0, hash: '0x0000_GENESIS', transactions: [] }
  ]);
  const [clients, setClients] = useState([]);
  const [accuracyHistory, setAccuracyHistory] = useState([0.12]);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('IDLE');

  const ws = useRef(null);

  const onMessage = useCallback((event) => {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
      case 'initial_state':
      case 'global_update':
        if (message.stats) {
          setRound(message.stats.round);
          setStatus(message.stats.status);
          setIsActive(message.stats.status === 'RUNNING');
          
          // Map trust_score or other metrics if needed
          // For now, let's derive clients from clients_active
          const numActive = message.stats.clients_active || 0;
          setClients(Array.from({ length: 8 }, (_, i) => ({
            id: `P-${i.toString().padStart(2, '0')}`,
            org: ['Hospital', 'FinTech', 'AutoDrive', 'Retail', 'Logistics', 'HealthAI', 'EdTech', 'GovNet'][i % 8],
            status: i < numActive ? 'ACTIVE' : 'IDLE',
            reputation: 100
          })));

          // Synchronize actual accuracy from the AI Guardian Bridge
          if (message.stats.accuracy !== undefined) {
             setAccuracyHistory(prev => {
                const newAcc = message.stats.accuracy;
                // Add the new accuracy point if it's a new round!
                if (message.stats.round >= prev.length) {
                   return [...prev, parseFloat(newAcc.toFixed(4))];
                }
                return prev;
             });
          }
        }
        
        // Prevent empty 'chain: []' updates from overwriting the UI ledger history
        if (message.chain && message.chain.length > 0) {
          setBlockchain(message.chain);
        }
        break;

      case 'status_update':
        setStatus(message.status);
        setIsActive(message.status === 'RUNNING');
        break;

      case 'log':
        setLogs(prev => [...prev.slice(-99), { msg: `> ${message.data}`, color: message.data.includes('Rejected') ? '#ef4444' : '#64748b' }]);
        break;

      default:
        break;
    }
  }, []);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log("Federated WebSocket Connected");
      };

      ws.current.onmessage = onMessage;

      ws.current.onclose = () => {
        setIsConnected(false);
        console.log("Federated WebSocket Disconnected. Retrying in 3s...");
        setTimeout(connect, 3000);
      };

      ws.current.onerror = (err) => {
        console.error("WebSocket Error:", err);
        ws.current.close();
      };
    };

    connect();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [onMessage]);

  const runRound = async () => {
    try {
      const endpoint = status === 'IDLE' ? '/initiate-round' : '/aggregate';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST' });
      if (!response.ok) throw new Error('API Execution Failed');
      return true;
    } catch (err) {
      console.error("Round Execution Error:", err);
      return false;
    }
  };

  const clearSimulation = () => {
    // Optional: Add backend reset if needed
    window.location.reload();
  };

  return {
    round,
    isActive,
    blockchain,
    clients,
    accuracyHistory,
    rejectedCount,
    logs,
    runRound,
    clearSimulation,
    setIsActive,
    isConnected,
    status
  };
}
