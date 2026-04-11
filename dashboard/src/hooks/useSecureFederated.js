import { useState, useEffect, useRef, useCallback } from 'react';

const isProd = import.meta.env.PROD;
export const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '7880';
export const BACKEND_IP = import.meta.env.VITE_BACKEND_IP || '127.0.0.1';

// Production: connect to HuggingFace Space backend
const HF_BACKEND = import.meta.env.VITE_HF_BACKEND_URL || 'https://mdark4025-cybronites.hf.space';
export const API_BASE_URL = isProd ? HF_BACKEND : `http://${BACKEND_IP}:${BACKEND_PORT}`;

// WebSocket: derive from HF backend URL in production
const hfWsUrl = HF_BACKEND.replace('https://', 'wss://').replace('http://', 'ws://');
export const WS_URL = isProd
  ? `${hfWsUrl}/ws`
  : `ws://${BACKEND_IP}:${BACKEND_PORT}/ws`;

export function useSecureFederated() {
  const [round, setRound] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [clientsActive, setClientsActive] = useState(0);
  const [blockchain, setBlockchain] = useState([
    { index: 0, hash: '0x0000_GENESIS', transactions: [] }
  ]);
  const [clients, setClients] = useState([]);
  const [accuracyHistory, setAccuracyHistory] = useState([]);
  const [lossHistory, setLossHistory] = useState([]);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('IDLE');
  const [lastSync, setLastSync] = useState(null);
  const [nodeRegistry, setNodeRegistry] = useState({});
  const [hyperparams, setHyperparams] = useState({
    learning_rate: 0.01,
    batch_size: 32,
    epochs: 1
  });
  const [roundHistory, setRoundHistory] = useState([]);
  const [shards, setShards] = useState([]); 
  const [modelArchitecture, setModelArchitecture] = useState('# Loading Model source...');
  const [labState, setLabState] = useState({ status: 'IDLE', progress: 0, epoch: 0, loss: 0, accuracy: 0, ptPath: null, onnxPath: null });
  
  // State for distributed status sync (from simulation/HF updates)
  const [distributedStatus, setDistributedStatus] = useState({
    status: 'IDLE',
    round: 0,
    totalRounds: 5,
    registeredClients: 0,
    updatesReceived: 0,
    updatesNeeded: 2,
  });

  const ws = useRef(null);

  const updateClientStatus = useCallback((currentStatus, numActive = 2) => {
    setClients(Array.from({ length: 8 }, (_, i) => ({
      id: `NODE-${i}`,
      org: ['Hospital', 'FinTech', 'AutoDrive', 'Retail', 'Logistics', 'HealthAI', 'EdTech', 'GovNet'][i % 8],
      status: i < numActive ? (['TRAINING', 'AGGREGATING'].includes(currentStatus) ? 'BUSY' : 'ACTIVE') : 'IDLE',
      reputation: 100
    })));
    setClientsActive(numActive);
  }, []);

  const onMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      const { type, payload } = message;
      setLastSync(new Date());

      switch (type) {
        case 'INITIAL_SYNC': {
          console.log("INITIAL_SYNC", payload);
          const { state, logs: initialLogs } = payload;
          setRound(state.round || 0);
          setStatus(state.status || 'IDLE');
          setAccuracyHistory(state.accuracy_history || []);
          setLossHistory(state.loss_history || []);
          setLogs(initialLogs.map(l => ({ msg: `${l}`, color: '#64748b' })));
          if (state.chain) setBlockchain(state.chain);
          if (state.node_registry) setNodeRegistry(state.node_registry);
          if (state.hyperparams) setHyperparams(state.hyperparams);
          if (state.round_history) {
             setRoundHistory(state.round_history.map(r => ({
                ...r,
                lr: r.lr ?? 0.01,
                batch: r.batch ?? 32,
              })));
          }
          if (state.shards) setShards(state.shards);
          if (state.model_architecture) setModelArchitecture(state.model_architecture);
          if (state.lab_state) {
            setLabState(prev => ({ ...prev, ...state.lab_state }));
          }
          
          // Initial distributed status sync
          if (state.status) {
            setDistributedStatus(prev => ({
              ...prev,
              status: state.status,
              round: state.round ?? prev.round,
              totalRounds: state.total_rounds ?? prev.totalRounds,
              registeredClients: state.clients_active ?? prev.registeredClients,
              updatesReceived: state.updates_received ?? prev.updatesReceived,
              updatesNeeded: state.updates_needed ?? prev.updatesNeeded,
            }));
          }

          updateClientStatus(state.status, state.clients_active);
          break;
        }

        case 'STAT_UPDATE': {
          console.log("STAT_UPDATE", payload);
          if (payload.round !== undefined) setRound(payload.round);
          if (payload.status !== undefined) {
            setStatus(payload.status);
            setIsActive(['TRAINING', 'AGGREGATING', 'MINING'].includes(payload.status));
            updateClientStatus(payload.status, payload.clients_active);
          }
          if (payload.accuracy_history !== undefined) setAccuracyHistory(payload.accuracy_history);
          if (payload.loss_history !== undefined) setLossHistory(payload.loss_history);
          if (payload.chain !== undefined) setBlockchain(payload.chain);
          if (payload.node_registry !== undefined) setNodeRegistry(payload.node_registry);
          if (payload.hyperparams) setHyperparams(payload.hyperparams);
          if (payload.round_history) {
            setRoundHistory(
              payload.round_history.map(r => ({
                ...r,
                lr: r.lr ?? 0.01,
                batch: r.batch ?? 32,
              }))
            );
          }
          if (payload.shards) setShards(payload.shards);
          if (payload.model_architecture) setModelArchitecture(payload.model_architecture);
          if (payload.lab_state) {
            setLabState(prev => ({ ...prev, ...payload.lab_state }));
          }

          // Sync distributed training status from WebSocket broadcasts
          if (payload.status && ['IDLE','WAITING','AGGREGATING','COMPLETE'].includes(payload.status)) {
            setDistributedStatus(prev => ({
              ...prev,
              status: payload.status,
              round: payload.round ?? prev.round,
              totalRounds: payload.total_rounds ?? prev.totalRounds,
              registeredClients: payload.clients_active ?? prev.registeredClients,
              updatesReceived: payload.updates_received ?? prev.updatesReceived,
              updatesNeeded: payload.updates_needed ?? prev.updatesNeeded,
            }));
          }
          break;
        }

        case 'LOG': {
          const isError = payload.includes('ERROR') || payload.includes('CRITICAL');
          setLogs(prev => [...prev.slice(-199), { msg: `${payload}`, color: isError ? '#ef4444' : '#64748b' }]);
          break;
        }

        case 'LAB_PROGRESS': {
          setLabState(prev => ({
            ...prev,
            status: payload.status || 'TRAINING',
            progress: payload.progress,
            epoch: payload.epoch,
            loss: payload.loss,
            accuracy: payload.accuracy,
            mode: payload.mode || 'FEDERATED'
          }));
          break;
        }

        case 'LAB_COMPLETE': {
          setLabState(prev => ({
            ...prev,
            status: 'COMPLETE',
            progress: 100,
            ptPath: payload.pt_path,
            onnxPath: payload.onnx_path,
            mode: payload.mode
          }));
          break;
        }

        case 'LAB_ERROR': {
          setLabState(prev => ({ ...prev, status: 'ERROR', error: payload.error, errorLine: payload.line }));
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error("Hook Message Error:", err);
    }
  }, [updateClientStatus]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let reconnectTimeout = null;

    const connect = () => {
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }

      console.log("Connecting to Secure Bridge:", WS_URL);
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log("Bridge Connected");
      };

      ws.current.onmessage = onMessage;

      ws.current.onclose = () => {
        setIsConnected(false);
        if (isMounted) reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.current.onerror = (err) => console.error("WS Error:", err);
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
      const response = await fetch(`${API_BASE_URL}/api/v1/federated/start`, { method: 'POST' });
      if (!response.ok) throw new Error('Backend Offline');
      const data = await response.json();
      return data.success;
    } catch (err) {
      console.error("Round Execution Error:", err);
      return false;
    }
  };

  const executeDashboardCommand = async (command) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/laboratory/shell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      return await response.json();
    } catch (err) {
      console.error("Command Execution Error:", err);
      return { success: false, error: "Network Error" };
    }
  };

  const evalLaboratoryCode = async (code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/laboratory/eval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      return await response.json();
    } catch (err) {
      console.error("REPL Evaluation Error:", err);
      return { success: false, error: "Network Error" };
    }
  };

  return {
    round,
    isActive,
    blockchain,
    clients,
    accuracyHistory,
    lossHistory,
    rejectedCount,
    logs,
    clearLogs,
    runRound,
    setIsActive,
    isConnected,
    status,
    lastSync,
    nodeRegistry,
    hyperparams,
    roundHistory,
    modelArchitecture,
    shards,
    clientsActive,
    executeDashboardCommand,
    evalLaboratoryCode,
    labState,
    distributedStatus,
    setDistributedStatus
  };
}
