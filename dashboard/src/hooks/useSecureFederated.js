import { useState, useEffect, useRef, useCallback } from 'react';

const isProd = import.meta.env.PROD;
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '7860';
const API_BASE_URL = isProd ? window.location.origin : `http://localhost:${BACKEND_PORT}`;
const WS_URL = isProd 
  ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws` 
  : `ws://localhost:${BACKEND_PORT}/ws`;

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
    const { type, payload } = message;

    switch (type) {
      case 'INITIAL_SYNC': {
        const { state, logs: initialLogs } = payload;
        setRound(state.round || 0);
        setStatus(state.status || 'IDLE');
        setAccuracyHistory(state.accuracy_history || []);
        setLogs(initialLogs.map(l => ({ msg: `> ${l}`, color: '#64748b' })));
        
        // Mock client updates based on active status
        updateClientStatus(state.status, state.clients_active);
        break;
      }

      case 'STAT_UPDATE': {
        if (payload.round !== undefined) setRound(payload.round);
        if (payload.status !== undefined) {
            setStatus(payload.status);
            setIsActive(['TRAINING', 'AGGREGATING', 'MINING'].includes(payload.status));
            updateClientStatus(payload.status, payload.clients_active);
        }
        if (payload.accuracy_history !== undefined) {
            setAccuracyHistory(payload.accuracy_history);
        }
        if (payload.total_blocks !== undefined) {
          // Trigger a re-fetch or update blockchain state if hashes were sent
          // For now, we'll increment if not sent
        }
        break;
      }

      case 'LOG': {
        const isError = payload.includes('ERROR') || payload.includes('CRITICAL');
        setLogs(prev => [...prev.slice(-99), { msg: `> ${payload}`, color: isError ? '#ef4444' : '#64748b' }]);
        break;
      }

      default:
        break;
    }
  }, []);

  const updateClientStatus = (currentStatus, numActive = 2) => {
    setClients(Array.from({ length: 8 }, (_, i) => ({
      id: `NODE-${i}`,
      org: ['Hospital', 'FinTech', 'AutoDrive', 'Retail', 'Logistics', 'HealthAI', 'EdTech', 'GovNet'][i % 8],
      status: i < numActive ? (['TRAINING', 'AGGREGATING'].includes(currentStatus) ? 'BUSY' : 'ACTIVE') : 'IDLE',
      reputation: 100
    })));
  };

  useEffect(() => {
    let isMounted = true;
    let reconnectTimeout = null;

    const connect = () => {
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }

      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log("Secure Federated Bridge Connected");
      };

      ws.current.onmessage = onMessage;

      ws.current.onclose = () => {
        setIsConnected(false);
        if (isMounted) {
            console.log("Bridge connection lost. Retrying...");
            reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      ws.current.onerror = (err) => {
        console.error("Bridge WebSocket Error:", err);
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [onMessage]);

  const runRound = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`); // Dummy hit to check health
      if (!response.ok) throw new Error('Backend Offline');
      // The rounds are managed by Flower server; dashboard just observes or triggers via run_backend.py
      return true;
    } catch (err) {
      console.error("Round Execution Error:", err);
      return false;
    }
  };

  const clearSimulation = () => {
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
