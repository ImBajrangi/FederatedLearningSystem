import { useState, useEffect, useRef, useCallback } from 'react';

const isProd = import.meta.env.PROD;
const API_BASE_URL = isProd ? window.location.origin : '/api';
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = isProd ? `${protocol}//${window.location.host}/ws` : `${protocol}//${window.location.host}/ws`;

export function useSecureFederated() {
  const [round, setRound] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [blockchain, setBlockchain] = useState([
    { index: 0, hash: '0x0000_GENESIS', transactions: [] }
  ]);
  const [clients, setClients] = useState([]);
  const [accuracyHistory, setAccuracyHistory] = useState([]);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('IDLE');
  const [nodeRegistry, setNodeRegistry] = useState({});

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
          const currentStatus = message.stats.status;

          setClients(Array.from({ length: 8 }, (_, i) => ({
            id: `P-${i.toString().padStart(2, '0')}`,
            org: ['Hospital', 'FinTech', 'AutoDrive', 'Retail', 'Logistics', 'HealthAI', 'EdTech', 'GovNet'][i % 8],
            status: i < numActive ? (['TRAINING', 'EVALUATING', 'AGGREGATING'].includes(currentStatus) ? 'BUSY' : 'ACTIVE') : 'IDLE',
            reputation: 100
          })));

          // Synchronize actual accuracy from the AI Guardian Bridge
          if (message.stats.accuracy !== undefined) {
             setAccuracyHistory(prev => {
                const newAcc = parseFloat(message.stats.accuracy.toFixed(4));
                const currentRound = message.stats.round;
                
                // If it's a new round, append it. 
                // If the round already exists, update the last point (for intra-round refinements).
                if (currentRound > prev.length) {
                   return [...prev, newAcc];
                } else if (currentRound === prev.length && prev.length > 0) {
                   const updated = [...prev];
                   updated[updated.length - 1] = newAcc;
                   return updated;
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

      case 'log': {
        const dataStr = typeof message.data === 'object' 
            ? `Client ${message.data.client_id} [${message.data.status}]: Hash ${message.data.hash}`
            : message.data;

        if (typeof message.data === 'object' && message.data.client_id) {
           setNodeRegistry(prev => ({
              ...prev,
              [message.data.client_id]: {
                 status: message.data.status,
                 hash: message.data.hash,
                 timestamp: message.data.timestamp
              }
           }));
        }

        const isError = typeof message.data === 'object' 
            ? message.data.status === 'REJECTED' 
            : String(message.data).includes('Rejected');
            
        setLogs(prev => [...prev.slice(-99), { msg: `> ${dataStr}`, color: isError ? '#ef4444' : '#64748b' }]);
        break;
      }

      default:
        break;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let reconnectTimeout = null;

    const connect = () => {
      if (ws.current) {
        ws.current.onclose = null; // Clean previous listener if exists
        ws.current.close();
      }

      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log("Federated WebSocket Connected");
      };

      ws.current.onmessage = onMessage;

      ws.current.onclose = () => {
        setIsConnected(false);
        if (isMounted) {
            console.log("Federated WebSocket Disconnected. Retrying in 3s...");
            reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      ws.current.onerror = (err) => {
        console.error("WebSocket Error:", err);
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect cycle
        ws.current.close();
      }
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
    status,
    nodeRegistry
  };
}
