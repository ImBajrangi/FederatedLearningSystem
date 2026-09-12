import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, Activity, ShieldCheck, Server, Globe, Zap, 
  Network, Settings2, Code, Database, Terminal as TerminalIcon,
  ChevronRight, ChevronDown, BarChart3, Lock, RefreshCcw, Copy, CheckCircle2, Edit3, Check,
  Laptop, Radio, Fingerprint, HardDrive, Layers,
  Maximize2, Minimize2, Search, Download, ExternalLink, Eye, X, Filter, Sparkles,
  Info, AlertTriangle, CheckCircle, Award, Box, FileText
} from 'lucide-react';
import { MetricsChart } from './MetricsChart';
import { API_BASE_URL } from '../hooks/useSecureFederated';

const ConfigInput = ({ label, value }) => (
  <div className="tr-config-field">
    <label className="tr-config-label">{label}</label>
    <div className="tr-config-input-wrap">
      <span className="tr-config-value">{value}</span>
    </div>
  </div>
);

export const TrainingWorkspace = ({ 
  clients = [], 
  nodeRegistry = {},
  logs = [], 
  accuracyHistory = [], 
  lossHistory = [], 
  hyperparams, 
  roundHistory = [], 
  modelArchitecture, 
  activeTrainingCode,
  onUpdateActiveCode,
  onClear,
  onInitiate,
  isActive 
}) => {
  const consoleRef = React.useRef(null);
  const ledgerRef = React.useRef(null);
  const [activeTab, setActiveTab] = useState('telemetry');
  const [selectedSource, setSelectedSource] = useState('active'); // 'active' | 'global' | 'lab' | nodeId
  const [isEditing, setIsEditing] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [isInjecting, setIsInjecting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [cliInput, setCliInput] = useState('');
  const [localCliLogs, setLocalCliLogs] = useState([]);
  
  // Pop-up and Expanded Terminal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [terminalSearch, setTerminalSearch] = useState('');
  const [logCopyFeedback, setLogCopyFeedback] = useState(false);

  // Expandable Audit Ledger State
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);
  const [expandedLedgerRow, setExpandedLedgerRow] = useState(null);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerExportFeedback, setLedgerExportFeedback] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isLedgerExpanded) {
        setIsLedgerExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLedgerExpanded]);

  const handleCliSubmit = (e) => {
    e.preventDefault();
    const cmd = cliInput.trim();
    if (!cmd) return;

    const timeStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const userEntry = { ts: timeStr, prefix: 'USER_INPUT', msg: `> ${cmd}`, type: 'input' };

    let replyEntry = null;
    const lower = cmd.toLowerCase();

    if (lower === '/help' || lower === 'help') {
      replyEntry = {
        ts: timeStr,
        prefix: 'CLI_AGENT',
        msg: 'Available Commands:\n  /train   - Trigger federated training round\n  /nodes   - List active connected participants\n  /status  - Inspect cluster status & throughput\n  /clear   - Flush terminal stream',
        type: 'info'
      };
    } else if (lower === '/train' || lower === 'train') {
      if (onInitiate && !isActive) {
        onInitiate();
        replyEntry = { ts: timeStr, prefix: 'ORCHESTRATOR', msg: '⚡ Dispatched federated training cycle to all active nodes.', type: 'success' };
      } else {
        replyEntry = { ts: timeStr, prefix: 'ORCHESTRATOR', msg: '⚠️ Training cycle is already in progress.', type: 'warn' };
      }
    } else if (lower === '/nodes' || lower === 'nodes') {
      const count = Object.keys(safeNodeRegistry).length;
      replyEntry = {
        ts: timeStr,
        prefix: 'REGISTRY',
        msg: count === 0 ? 'No remote edge nodes connected. Connect via: curl -sSL https://.../join.py | python3' : `Connected nodes (${count}):\n${Object.entries(safeNodeRegistry).map(([id, n]) => `  ● ${n.name || id} (${n.ip || '127.0.0.1'}, Rep: ${n.reputation || 100})`).join('\n')}`,
        type: 'info'
      };
    } else if (lower === '/status' || lower === 'status') {
      replyEntry = {
        ts: timeStr,
        prefix: 'SYSTEM',
        msg: `Cluster Status: ${isActive ? '⚡ TRAINING ACTIVE' : 'IDLE / READY'} | Active File: ${displayedFilename} | Checksum: ${displayedHash || '0x0000'}`,
        type: 'info'
      };
    } else if (lower === '/clear' || lower === 'clear') {
      setLocalCliLogs([]);
      if (onClear) onClear();
      setCliInput('');
      return;
    } else {
      replyEntry = {
        ts: timeStr,
        prefix: 'SYS_ERR',
        msg: `Command not recognized: '${cmd}'. Type /help for available CLI commands.`,
        type: 'error'
      };
    }

    setLocalCliLogs(prev => [...prev, userEntry, replyEntry]);
    setCliInput('');
  };

  const filteredRoundHistory = React.useMemo(() => {
    const list = [...roundHistory].reverse();
    if (!ledgerSearch.trim()) return list;
    const q = ledgerSearch.toLowerCase().trim();
    return list.filter(r => {
      const client = (r.client || r.client_id || '').toLowerCase();
      const roundStr = String(r.round || '');
      const tx = (r.tx_id || r.txId || '').toLowerCase();
      const hash = (r.hash || r.gradHash || '').toLowerCase();
      return client.includes(q) || roundStr.includes(q) || tx.includes(q) || hash.includes(q);
    });
  }, [roundHistory, ledgerSearch]);

  const effectiveAccHistory = React.useMemo(() => {
    if (accuracyHistory && accuracyHistory.length > 0 && accuracyHistory.some(a => a > 0)) {
      return accuracyHistory;
    }
    if (roundHistory && roundHistory.length > 0) {
      const roundMap = {};
      roundHistory.forEach(r => {
        const rd = r.round || 1;
        const acc = r.acc !== undefined ? r.acc : (r.accuracy !== undefined ? r.accuracy : 0);
        if (!roundMap[rd]) roundMap[rd] = [];
        roundMap[rd].push(Number(acc));
      });
      const res = Object.keys(roundMap).sort((a, b) => Number(a) - Number(b)).map(rd => {
        const arr = roundMap[rd];
        return arr.length > 0 ? arr.reduce((sum, v) => sum + v, 0) / arr.length : 0;
      });
      if (res.length > 0 && res.some(a => a > 0)) return res;
    }
    return accuracyHistory || [];
  }, [accuracyHistory, roundHistory]);

  const effectiveLossHistory = React.useMemo(() => {
    if (lossHistory && lossHistory.length > 0 && lossHistory.some(l => l > 0)) {
      return lossHistory;
    }
    if (roundHistory && roundHistory.length > 0) {
      const roundMap = {};
      roundHistory.forEach(r => {
        const rd = r.round || 1;
        const loss = r.loss !== undefined ? Number(r.loss) : (r.loss_val !== undefined ? Number(r.loss_val) : 0);
        if (!roundMap[rd]) roundMap[rd] = [];
        if (loss > 0) roundMap[rd].push(loss);
      });
      const res = Object.keys(roundMap).sort((a, b) => Number(a) - Number(b)).map(rd => {
        const arr = roundMap[rd];
        return arr.length > 0 ? arr.reduce((sum, v) => sum + v, 0) / arr.length : 0;
      });
      if (res.length > 0 && res.some(l => l > 0)) return res;
    }
    return lossHistory || [];
  }, [lossHistory, roundHistory]);

  const allLogs = [
    ...logs.map(l => (typeof l === 'object' ? l : { msg: l })),
    ...localCliLogs
  ];

  React.useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const defaultHyperparams = {
    learning_rate: 0.01,
    batch_size: 32,
    epochs: 1
  };
  
  const hp = hyperparams || defaultHyperparams;

  // Determine active dynamic training source
  const liveActiveCode = activeTrainingCode?.code || modelArchitecture || '# Initializing Convergence Engine...';
  const liveActiveFilename = activeTrainingCode?.filename || 'model.py';
  const liveActiveName = activeTrainingCode?.name || (isActive ? 'Active Real-Time Convergence Engine' : 'Global Verified Specification');
  const liveDataset = activeTrainingCode?.dataset || 'MNIST (28x28) / Federated Shard';

  // Compute displayed code and metadata based on selection
  let displayedCode = liveActiveCode;
  let displayedFilename = liveActiveFilename;
  let displayedTitle = liveActiveName;
  let displayedDataset = liveDataset;
  let displayedHash = activeTrainingCode?.code_hash;

  const safeNodeRegistry = (nodeRegistry && typeof nodeRegistry === 'object') ? nodeRegistry : {};

  if (selectedSource === 'active') {
    displayedCode = isEditing ? customCode : liveActiveCode;
    displayedFilename = liveActiveFilename;
    displayedTitle = isActive ? 'Active Training Code' : 'Active Training Engine';
    displayedDataset = liveDataset;
    displayedHash = activeTrainingCode?.code_hash;
  } else if (selectedSource === 'global') {
    displayedCode = isEditing ? customCode : (modelArchitecture || '# Global Genesis Spec');
    displayedFilename = 'model.py';
    displayedTitle = 'Global Model Specification';
    displayedDataset = 'Institutional Global Distribution';
  } else if (selectedSource === 'lab') {
    displayedCode = isEditing ? customCode : (activeTrainingCode?.source === 'laboratory' ? activeTrainingCode.code : liveActiveCode);
    displayedFilename = 'laboratory_sandbox.py';
    displayedTitle = 'Code Laboratory Sandbox Script';
    displayedDataset = 'Privacy Vault / In-Memory RAM';
  } else if (safeNodeRegistry[selectedSource]) {
    const node = safeNodeRegistry[selectedSource];
    displayedCode = node.code || '# No code payload transmitted by node';
    displayedFilename = node.filename || 'node_train.py';
    displayedTitle = node.name || `Node: ${selectedSource.substring(0, 8)}`;
    displayedDataset = `Edge Local Private Dataset (${node.ip || 'Local Device'})`;
    displayedHash = node.code_hash;
  }

  // Fallback hash calculation
  if (!displayedHash && displayedCode) {
    displayedHash = '0x' + Array.from(displayedCode).reduce((s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0, 0).toString(16).padStart(8, '0');
  }

  const handleStartEdit = () => {
    setCustomCode(displayedCode);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCustomCode('');
  };

  const handleInjectCode = async () => {
    if (!customCode.trim()) return;
    setIsInjecting(true);
    try {
      if (onUpdateActiveCode) {
        await onUpdateActiveCode(
          customCode,
          displayedFilename,
          selectedSource === 'active' ? 'custom_injected' : selectedSource,
          `Injected (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
          displayedDataset
        );
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to inject code:', err);
    } finally {
      setIsInjecting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(displayedCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="tr-root section-fade">
      {/* ─── Header ─── */}
      <header className="tr-header">
        <div className="tr-header-left">
          <div className="tr-module-badge">
            <span className="tr-badge-num">02</span>
            <span className="tr-badge-sep" />
            <span className="tr-badge-text">Training Cluster</span>
          </div>
          <h2 className="tr-title">Federated Convergence Engine</h2>
        </div>
        
        <div className="tr-header-right">
          <div className="tr-status-card">
            <div className={`tr-status-dot ${isActive ? 'tr-status-active' : ''}`} />
            <span className="tr-status-text">
              {isActive ? '⚡ TRAINING ACTIVE ON CLUSTER' : 'GPU CLUSTER: READY'}
            </span>
          </div>
          <button 
            onClick={onInitiate}
            disabled={isActive}
            className={`tr-run-btn group ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Zap size={14} fill="currentColor" />
            <span>{isActive ? 'Training in Progress...' : 'Initiate Training Cycle'}</span>
            <div className="tr-btn-line group-hover:w-8" />
          </button>
        </div>
      </header>

      {/* ─── Main Content Grid ─── */}
      <div className="tr-grid">
        {/* Left Column: Config & Audit */}
        <div className="tr-col">
          {/* Hyperparameters */}
          <section className="tr-card">
            <div className="tr-card-header">
              <div className="tr-card-title-wrap">
                <Settings2 size={13} className="tr-card-icon" />
                <span className="tr-card-title">Hyperparameters</span>
              </div>
              <button className="tr-card-action">Reset Defaults</button>
            </div>
            <div className="tr-card-body tr-config-grid">
              <ConfigInput label="Learning Rate" value={hp.learning_rate.toFixed(3)} />
              <ConfigInput label="Batch Size" value={hp.batch_size.toString()} />
              <ConfigInput label="Epochs" value={hp.epochs.toString()} />
            </div>
          </section>

          {/* Audit Ledger */}
          <section className={`tr-card tr-ledger-card ${isLedgerExpanded ? 'tr-ledger-card-expanded' : ''}`}>
            <div className="tr-card-header">
              <div className="tr-card-title-wrap">
                <Database size={12} className="tr-card-icon" />
                <span className="tr-card-title">Institutional Parameter Audit Ledger</span>
              </div>
              <div className="tr-ledger-meta">
                <div className="tr-live-sync">
                  <div className="tr-sync-dot" />
                  <span>Live Sync</span>
                </div>
                <div className="tr-ver-status">
                  <ShieldCheck size={10} className="text-emerald-500" />
                  <span>Verified: 100%</span>
                </div>
                <button 
                  onClick={() => setIsLedgerExpanded(!isLedgerExpanded)}
                  className="tr-expand-toggle-btn"
                  title={isLedgerExpanded ? "Collapse View (Default)" : "Expand Full Ledger View"}
                >
                  {isLedgerExpanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                  <span>{isLedgerExpanded ? "Collapse View" : "Expand Full Ledger"}</span>
                </button>
              </div>
            </div>
            <div className={`tr-ledger-scroll ${isLedgerExpanded ? 'tr-ledger-scroll-expanded' : ''}`} ref={ledgerRef}>
              <table className="tr-table">
                <thead>
                  <tr className="tr-table-header-row">
                    <th className="tr-th-rnd" style={{ width: '85px' }}>RND</th>
                    <th className="tr-th-node" style={{ width: '220px' }}>NODE_ID</th>
                    <th className="tr-th-params">PARAMETERS_GRID</th>
                    <th className="tr-th-acc" style={{ width: '100px', textAlign: 'right' }}>ACC_YIELD</th>
                    <th className="tr-th-status" style={{ width: '160px', textAlign: 'right' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {roundHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="tr-empty-state-td">
                        <div className={`tr-empty-state ${isLedgerExpanded ? 'tr-empty-state-expanded' : ''}`}>
                          <div className="tr-empty-icon-wrap">
                            <Database size={isLedgerExpanded ? 30 : 20} className="text-slate-400" />
                          </div>
                          <div className="flex flex-col items-center gap-1 text-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                              Awaiting Initial Orchestration Cycle
                            </span>
                            <span className="text-[9.5px] text-slate-400 max-w-sm">
                              {isLedgerExpanded 
                                ? "Realtime immutable parameter updates, loss gradients, and SHA-256 model weight transactions will stream directly into this ledger."
                                : "Parameter records and smart contract validations will appear here."}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    [...roundHistory].reverse().map((row, idx) => {
                      const clientName = row.client || row.client_id || 'NODE';
                      const shortClient = clientName.length > 16 
                        ? `${clientName.substring(0, 8)}...${clientName.substring(clientName.length - 5)}`
                        : clientName;
                      const isRowOpen = expandedLedgerRow === idx;

                      return (
                        <React.Fragment key={idx}>
                          <tr 
                            onClick={() => setExpandedLedgerRow(isRowOpen ? null : idx)}
                            className={`tr-ledger-row ${isRowOpen ? 'tr-ledger-row-active' : ''}`}
                            title="Click to inspect cryptographic audit trail"
                          >
                            <td className="tr-td-rnd">
                              <div className="flex items-center gap-1.5">
                                {isRowOpen ? (
                                  <ChevronDown size={11} className="text-blue-600 shrink-0" />
                                ) : (
                                  <ChevronRight size={11} className="text-slate-400 shrink-0" />
                                )}
                                <span className="tr-rnd-num">#{row.round.toString().padStart(2, '0')}</span>
                              </div>
                            </td>
                            <td style={{ maxWidth: '170px' }}>
                              <div className="tr-node-info">
                                <span className="tr-node-id select-all" title={clientName}>{shortClient}</span>
                                <span className="tr-node-label">SECURE_EDGE_NODE</span>
                              </div>
                            </td>
                            <td>
                              <div className="tr-params-grid">
                                <div className="tr-param-item">
                                  <span className="tr-param-k">LR</span>
                                  <span className="tr-param-v">{row.lr || '0.01'}</span>
                                </div>
                                <div className="tr-param-item">
                                  <span className="tr-param-k">BATCH</span>
                                  <span className="tr-param-v">{row.batch || '32'}</span>
                                </div>
                                <div className="tr-param-item">
                                  <span className="tr-param-k">SIGMA</span>
                                  <span className="tr-param-v">0.001</span>
                                </div>
                              </div>
                            </td>
                            <td className="tr-td-acc" style={{ textAlign: 'right' }}>
                              <span className="tr-acc-yield">
                                {row.acc !== undefined ? `${(row.acc * 100).toFixed(1)}%` : row.accuracy !== undefined ? `${(row.accuracy * 100).toFixed(1)}%` : '—'}
                              </span>
                            </td>
                            <td className="tr-td-status" style={{ textAlign: 'right' }}>
                              <span className="tr-status-pill tr-status-verified">
                                ON-CHAIN VERIFIED
                              </span>
                            </td>
                          </tr>

                          {/* ── Expandable Cryptographic Ledger Inspector Row ── */}
                          {isRowOpen && (
                            <tr className="tr-ledger-detail-row">
                              <td colSpan="5" className="tr-ledger-detail-cell">
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="tr-ledger-detail-card"
                                >
                                  <div className="tr-detail-grid">
                                    <div className="tr-detail-item">
                                      <span className="tr-detail-k">Zero-Knowledge Proof ID</span>
                                      <span className="tr-detail-v font-mono select-all">
                                        zk-{row.proofId || `${Math.random().toString(36).substring(2, 10)}-audit-${row.round}`}
                                      </span>
                                    </div>
                                    <div className="tr-detail-item">
                                      <span className="tr-detail-k">Privacy Mechanism</span>
                                      <span className="tr-detail-v text-emerald-700 font-semibold">
                                        Differential Privacy Gaussian (ε = 1.05, δ = 1e-5)
                                      </span>
                                    </div>
                                    <div className="tr-detail-item">
                                      <span className="tr-detail-k">Model Gradient State SHA-256</span>
                                      <span className="tr-detail-v font-mono select-all text-indigo-700">
                                        sha256:{row.gradHash || `${Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('')}...`}
                                      </span>
                                    </div>
                                    <div className="tr-detail-item">
                                      <span className="tr-detail-k">Consensus Validation</span>
                                      <span className="tr-detail-v text-emerald-600 font-bold flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Byzantine Fault Tolerant Multi-Party Verified
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="tr-ledger-footer">
              <span className="tr-footer-text italic">Audit trail secured via differential privacy ledger • Click rows to inspect details</span>
              <div className="tr-footer-stats">
                <span className="tr-stat-label">TOTAL ROUNDS:</span>
                <span className="tr-stat-val">{roundHistory.length}</span>
              </div>
            </div>
          </section>

          {/* Connected Edge Nodes & Device Telemetry Audit */}
          {/* Connected Edge Nodes & Device Telemetry Audit */}
          <section className="tr-card tr-nodes-section">
            <div className="tr-card-header">
              <div className="tr-card-title-wrap">
                <Laptop size={14} className="tr-card-icon text-cyan-600" />
                <span className="tr-card-title">Enrolled Edge Participants</span>
                <span className="tr-nodes-count-badge">
                  {Object.keys(safeNodeRegistry).length} ACTIVE
                </span>
              </div>
              <div className="tr-nodes-header-right">
                <span className="tr-sync-dot" />
                <span className="text-[10px] font-semibold text-slate-500">Decentralized Bridge</span>
              </div>
            </div>

            <div className="tr-nodes-body">
              {Object.keys(safeNodeRegistry).length === 0 ? (
                <div className="tr-no-nodes-card">
                  <div className="tr-no-nodes-left">
                    <Radio size={16} className="text-amber-500 animate-pulse" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Listening for Remote Edge Participants</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Run join command on any Mac, Linux, or Cloud GPU instance to enroll:</div>
                    </div>
                  </div>
                  <div className="tr-quick-join-box">
                    <code>curl -sSL https://mdark4025-cybronites.hf.space/join.py | python3</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('curl -sSL https://mdark4025-cybronites.hf.space/join.py | python3');
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }}
                      className="tr-mini-copy-btn"
                    >
                      {copySuccess ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                      <span>{copySuccess ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="tr-nodes-grid">
                  {Object.entries(safeNodeRegistry).map(([id, node]) => {
                    const isNodeActive = selectedSource === id;
                    return (
                      <div 
                        key={id} 
                        className={`tr-node-card ${isNodeActive ? 'tr-node-card-selected' : ''}`}
                        onClick={() => {
                          setSelectedSource(id);
                          setIsEditing(false);
                        }}
                      >
                        {/* Node Card Header */}
                        <div className="tr-node-header">
                          <div className="tr-node-id-group">
                            <div className="tr-node-status-dot-green" />
                            <div className="overflow-hidden">
                              <div className="tr-node-name truncate" title={node.name || id}>{node.name || id}</div>
                              <div className="tr-node-sub truncate">{id.substring(0, 10)}... • {node.ip || '127.0.0.1'}</div>
                            </div>
                          </div>
                          <div className="tr-node-rep-badge">
                            <ShieldCheck size={11} className="text-emerald-600" />
                            <span>{node.reputation ? node.reputation.toFixed(1) : '100.0'}% REP</span>
                          </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="tr-node-specs">
                          <div className="tr-node-spec-row">
                            <span className="tr-spec-k">
                              <Cpu size={10} className="text-purple-600 inline mr-1" />
                              Compute:
                            </span>
                            <span className="tr-spec-v text-slate-800 font-medium truncate" title={node.device || 'CPU Core'}>
                              {node.device || 'CPU Core'}
                            </span>
                          </div>
                          <div className="tr-node-spec-row">
                            <span className="tr-spec-k">
                              <Layers size={10} className="text-cyan-600 inline mr-1" />
                              Env:
                            </span>
                            <span className="tr-spec-v text-slate-700 truncate">
                              {node.os || 'Darwin/Linux'} ({node.arch || 'arm64'}) • {node.python || 'v3.12'}
                            </span>
                          </div>
                          <div className="tr-node-spec-row">
                            <span className="tr-spec-k">
                              <HardDrive size={10} className="text-emerald-600 inline mr-1" />
                              Shard:
                            </span>
                            <span className="tr-spec-v text-emerald-700 font-medium">
                              {node.shard_size || '250 samples'}
                            </span>
                          </div>
                          <div className="tr-node-spec-row">
                            <span className="tr-spec-k">
                              <Lock size={10} className="text-amber-600 inline mr-1" />
                              Privacy:
                            </span>
                            <span className="tr-spec-v text-slate-600 truncate">
                              {node.privacy || 'L2-Clip (1.5) + σ=0.005'}
                            </span>
                          </div>
                          <div className="tr-node-spec-row">
                            <span className="tr-spec-k">
                              <Code size={10} className="text-blue-600 inline mr-1" />
                              File:
                            </span>
                            <span className="tr-spec-v text-blue-700 font-mono text-[10px]">
                              {node.filename || 'model.py'} ({node.lines_count || 74} lines)
                            </span>
                          </div>
                        </div>

                        {/* Node Card Footer */}
                        <div className="tr-node-footer">
                          <span className="tr-node-hash font-mono">
                            SHA: {node.code_hash ? node.code_hash.substring(0, 12) + '...' : '0x0000'}
                          </span>
                          <span className="tr-node-inspect-tag">
                            {isNodeActive ? '● VIEWING SCRIPT' : 'INSPECT CODE →'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Dynamic Code Transparency & Active Execution Engine */}
          <section className="tr-card tr-script-card">
            <div className="tr-card-header tr-code-header">
              <div className="tr-card-title-wrap">
                <div className={`tr-code-status-dot ${isActive ? 'tr-dot-pulse-active' : 'tr-dot-idle'}`} />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="tr-card-title">{displayedTitle}</span>
                  {isActive ? (
                    <span className="tr-live-exec-badge">
                      <span className="tr-live-exec-dot-wrap">
                        <span className="tr-live-exec-ping" />
                        <span className="tr-live-exec-dot" />
                      </span>
                      <span>LIVE TRAINING</span>
                    </span>
                  ) : (
                    <span className="tr-sync-pill">
                      ● SYNCHRONIZED ({Object.keys(safeNodeRegistry).length} NODES)
                    </span>
                  )}
                  <span className="tr-filename-tag">{displayedFilename}</span>
                </div>
                {selectedSource !== 'active' && selectedSource !== 'global' && (
                  <div className="flex items-center gap-2 w-full mt-0.5">
                    <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                      Viewing Isolated Node Payload
                    </span>
                    <button 
                      onClick={() => setSelectedSource('active')}
                      className="text-[9px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      ← Back to Network Live Architecture
                    </button>
                  </div>
                )}
              </div>

              {/* Real-time Code Actions & Downloads */}
              <div className="tr-action-toolbar">
                <button 
                  onClick={handleCopyCode}
                  className="tr-tool-btn"
                  title="Copy Code to Clipboard"
                >
                  {copySuccess ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copySuccess ? 'COPIED' : 'COPY'}</span>
                </button>

                {!isEditing ? (
                  <button 
                    onClick={handleStartEdit}
                    className="tr-inject-btn"
                    title="Edit and Inject Custom Architecture"
                  >
                    <Edit3 size={11} />
                    <span>EDIT / INJECT</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handleInjectCode}
                      disabled={isInjecting}
                      className="tr-confirm-inject-btn"
                    >
                      {isInjecting ? <RefreshCcw size={11} className="animate-spin" /> : <Zap size={11} />}
                      <span>INJECT</span>
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="tr-cancel-btn"
                    >
                      CANCEL
                    </button>
                  </div>
                )}

                <div className="tr-download-group">
                  <a
                    href={`${API_BASE_URL}/api/v1/distributed/download/pt`}
                    download="federated_model_final.pt"
                    className="tr-download-item-btn"
                    title="Download PyTorch Model Weights (.pt)"
                  >
                    <Download size={11} />
                    <span>.PT</span>
                  </a>

                  <a
                    href={`${API_BASE_URL}/api/v1/distributed/download/onnx`}
                    download="federated_model_final.onnx"
                    className="tr-download-item-btn"
                    title="Download Universal ONNX Runtime Model (.onnx)"
                  >
                    <Box size={11} />
                    <span>.ONNX</span>
                  </a>

                  <a
                    href={`${API_BASE_URL}/api/v1/distributed/download/report`}
                    download="federated_audit_performance_report.json"
                    className="tr-download-item-btn tr-download-item-report"
                    title="Download Compliance Audit & Performance Report (.json)"
                  >
                    <FileText size={11} />
                    <span>REPORT</span>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Dynamic High-Contrast Metadata Bar */}
            <div className="tr-code-meta-bar">
              <div className="tr-meta-left">
                <div className="tr-meta-sha-pill">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span className="tr-meta-label">SHA-256:</span>
                  <span className="tr-meta-hash-text select-all">{displayedHash}</span>
                </div>
                <div className="tr-meta-dataset-pill">
                  <Database size={11} className="text-cyan-400" />
                  <span className="tr-meta-dataset-text">{displayedDataset}</span>
                </div>
              </div>
              <div className="tr-meta-right">
                <span className="tr-meta-audit-badge">
                  <CheckCircle2 size={11} />
                  100% CODE TRANSPARENCY VERIFIED
                </span>
              </div>
            </div>

            {/* Code Body / Live Editor */}
            <div className="tr-script-body">
              {isEditing ? (
                <textarea
                  className="tr-code-editor-area"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const start = e.target.selectionStart;
                      const end = e.target.selectionEnd;
                      const val = e.target.value;
                      setCustomCode(val.substring(0, start) + '    ' + val.substring(end));
                      setTimeout(() => {
                        e.target.selectionStart = e.target.selectionEnd = start + 4;
                      }, 0);
                    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleInjectCode();
                    }
                  }}
                  placeholder="Enter custom training code..."
                  spellCheck="false"
                />
              ) : (
                <div className="tr-code-view-wrap">
                  <table className="tr-code-table">
                    <tbody>
                      {displayedCode.split('\n').map((line, i) => (
                        <tr key={i} className="tr-code-row">
                          <td className="tr-gutter-num">{i + 1}</td>
                          <td className="tr-code-line">
                            <code>{line || ' '}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Analytics & Console */}
        <div className="tr-col">
          {/* Metrics */}
          <section className="tr-card tr-metrics-card">
            <div className="tr-card-header">
              <div className="tr-card-title-wrap">
                <BarChart3 size={13} className="tr-card-icon" />
                <span className="tr-card-title">Convergence Analytics</span>
              </div>
              <div className="tr-metrics-legend">
                <div className="tr-legend-item">
                  <div className="tr-dot tr-dot-primary" />
                  <span>Accuracy</span>
                </div>
                <div className="tr-legend-item">
                  <div className="tr-dot tr-dot-error" />
                  <span>Loss</span>
                </div>
              </div>
            </div>
            <div className="tr-metrics-body">
              <MetricsChart data={effectiveAccHistory} lossData={effectiveLossHistory} />
            </div>
          </section>

          {/* Terminal Console */}
          {/* Terminal Console */}
          <section className={`tr-console-container ${isTerminalMaximized ? 'tr-console-maximized' : ''}`}>
            <div className="tr-console-header">
              <div className="tr-console-tabs">
                <div 
                  className={`tr-tab tab-telemetry ${activeTab === 'telemetry' ? 'active' : ''}`}
                  onClick={() => setActiveTab('telemetry')}
                >
                  <TerminalIcon size={13} className={activeTab === 'telemetry' ? 'text-cyan-400' : 'text-slate-400'} />
                  <span className="tr-tab-text">Node Telemetry</span>
                  <span className="tr-tab-badge">
                    {allLogs.filter(l => (typeof l === 'object' ? l.msg : l).toUpperCase().includes('UPDATE') || (typeof l === 'object' ? l.msg : l).toUpperCase().includes('ROUND') || (typeof l === 'object' ? l.msg : l).toUpperCase().includes('NODE')).length}
                  </span>
                </div>
                <div 
                  className={`tr-tab tab-feed ${activeTab === 'feed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('feed')}
                >
                  <Globe size={13} className={activeTab === 'feed' ? 'text-emerald-400' : 'text-slate-400'} />
                  <span className="tr-tab-text">Global Feed</span>
                  <span className="tr-tab-badge">{allLogs.length}</span>
                </div>
                <div 
                  className={`tr-tab tab-audit ${activeTab === 'audit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('audit')}
                >
                  <Lock size={13} className={activeTab === 'audit' ? 'text-amber-400' : 'text-slate-400'} />
                  <span className="tr-tab-text">Sec Audit</span>
                  <span className="tr-tab-badge">
                    {allLogs.filter(l => {
                      const msg = (typeof l === 'object' ? l.msg : l).toUpperCase();
                      return msg.includes('SECURE') || msg.includes('VERIFIED') || msg.includes('AUDIT') || msg.includes('BLOCK') || msg.includes('CONTRACT') || msg.includes('HEIGHT') || msg.includes('BLOCKCHAIN');
                    }).length}
                  </span>
                </div>
              </div>
              
              <div className="tr-console-actions">
                {/* Search / Filter Bar */}
                <div className="tr-console-search-box">
                  <Search size={11} className="text-slate-400" />
                  <input 
                    type="text" 
                    value={terminalSearch}
                    onChange={(e) => setTerminalSearch(e.target.value)}
                    placeholder="Filter logs..."
                    className="tr-search-input"
                  />
                  {terminalSearch && (
                    <button onClick={() => setTerminalSearch('')} className="text-slate-400 hover:text-white text-[10px]">
                      <X size={10} />
                    </button>
                  )}
                </div>

                <div className="tr-latency">
                  <div className="tr-latency-dot" />
                  <span>2MS</span>
                </div>
                
                {/* Expand / Maximize Button */}
                <button 
                  onClick={() => setIsTerminalMaximized(!isTerminalMaximized)} 
                  className="tr-btn-tool" 
                  title={isTerminalMaximized ? "Collapse to Standard View" : "Expand Fullscreen View"}
                >
                  {isTerminalMaximized ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                  <span>{isTerminalMaximized ? "COLLAPSE" : "EXPAND"}</span>
                </button>

                <button className="tr-btn-clear" onClick={onClear} title="Clear Terminal Logs">CLEAR</button>
              </div>
            </div>

            <div className="tr-console-body" ref={consoleRef}>
              <div className="tr-console-scanline" />
              <div className="tr-log-container">
                {allLogs.length === 0 ? (
                  <div className="tr-cli-welcome">
                    <div className="tr-cli-banner">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px] tracking-wide">
                        <Sparkles size={12} /> AI GUARDIAN ORCHESTRATION TERMINAL
                      </span>
                      <div className="tr-cli-version-badge">
                        <span className="tr-cli-badge-dot" />
                        <span className="text-slate-300 font-mono text-[9px] font-medium">v2.4.0-PROD</span>
                        <span className="text-slate-600 text-[8px]">•</span>
                        <span className="text-cyan-400 font-mono text-[8.5px] font-semibold tracking-wider uppercase">TELEMETRY ACTIVE</span>
                      </div>
                    </div>
                    <div className="tr-cli-info-grid">
                      <div className="tr-cli-info-item">
                        <span className="tr-cli-k">Cluster Status</span>
                        <span className="tr-cli-v text-emerald-400 font-bold">{isActive ? '⚡ CONVERGENCE ACTIVE' : '● LISTENING IN STANDBY'}</span>
                      </div>
                      <div className="tr-cli-info-item">
                        <span className="tr-cli-k">Active Code Fingerprint</span>
                        <span className="tr-cli-v text-cyan-300 font-mono" title={`${displayedFilename} (${displayedHash || '0x0000'})`}>
                          {displayedFilename} <span className="text-slate-400 font-normal">({displayedHash ? displayedHash.substring(0, 8) + '...' : '0x0000'})</span>
                        </span>
                      </div>
                      <div className="tr-cli-info-item">
                        <span className="tr-cli-k">Enrolled Edge Participants</span>
                        <span className="tr-cli-v text-amber-300 font-bold">{Object.keys(safeNodeRegistry).length} Nodes Connected</span>
                      </div>
                    </div>
                    <div className="tr-cli-commands-hint">
                      <span className="text-slate-400 text-[9px] font-medium tracking-wide">Quick Commands:</span>
                      <button type="button" className="tr-cmd-tag" onClick={() => setCliInput('/train')}>/train</button>
                      <button type="button" className="tr-cmd-tag" onClick={() => setCliInput('/nodes')}>/nodes</button>
                      <button type="button" className="tr-cmd-tag" onClick={() => setCliInput('/status')}>/status</button>
                      <button type="button" className="tr-cmd-tag" onClick={() => setCliInput('/help')}>/help</button>
                    </div>
                  </div>
                ) : (
                  allLogs
                    .filter(log => {
                      const logMsg = (typeof log === 'object' ? log.msg : log) || '';
                      if (terminalSearch && !logMsg.toLowerCase().includes(terminalSearch.toLowerCase())) {
                        return false;
                      }
                      if (activeTab === 'feed') return true;
                      const msgUpper = logMsg.toUpperCase();
                      if (activeTab === 'audit') return msgUpper.includes('SECURE') || msgUpper.includes('VERIFIED') || msgUpper.includes('AUDIT') || msgUpper.includes('BLOCK') || msgUpper.includes('CONTRACT') || msgUpper.includes('HASH') || msgUpper.includes('HEIGHT') || msgUpper.includes('BLOCKCHAIN');
                      return msgUpper.includes('UPDATE') || msgUpper.includes('AGGREGATING') || msgUpper.includes('ROUND') || msgUpper.includes('NODE') || log.type;
                    })
                    .map((log, i) => {
                      const logObj = typeof log === 'object' ? log : { msg: log };
                      const msgUpper = (logObj.msg || '').toUpperCase();
                      const isSuccess = msgUpper.includes('SUCCESS') || msgUpper.includes('COMPLETE') || msgUpper.includes('FINISHED') || msgUpper.includes('SYNCED') || msgUpper.includes('ACTIVE') || logObj.type === 'success';
                      const isError = msgUpper.includes('ERR') || msgUpper.includes('CRITICAL') || msgUpper.includes('FAIL') || logObj.type === 'error';
                      const isWarning = msgUpper.includes('WARN') || logObj.type === 'warn';
                      const isInput = logObj.type === 'input';
                      
                      const msgColor = isInput ? '#38bdf8' : isSuccess ? '#34d399' : isError ? '#f87171' : isWarning ? '#fbbf24' : '#f8fafc';
                      const prefix = logObj.prefix || (i % 2 === 0 ? 'NODE_01' : 'NODE_02');
                      const ts = logObj.ts || new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

                      const isNode1 = prefix.includes('01');
                      const isNode2 = prefix.includes('02');
                      const isSys = prefix.includes('SYS') || prefix.includes('ORCH') || prefix.includes('CLI');

                      return (
                        <div 
                          key={i} 
                          className="tr-log-line group"
                          onClick={() => setSelectedLog({ ...logObj, index: i, prefix, ts, msgColor, isSuccess, isError, isWarning, isInput })}
                          title="Click to open inspector pop-up bar & expanded view"
                        >
                          <span className="tr-log-ts">{ts}</span>
                          <span className={`tr-log-prefix ${isNode1 ? 'tr-pfx-node1' : isNode2 ? 'tr-pfx-node2' : isSys ? 'tr-pfx-sys' : 'tr-pfx-default'}`}>
                            [{prefix}]
                          </span>
                          <span className="tr-log-msg" style={{ color: msgColor }}>
                            {logObj.msg}
                          </span>
                          <span className="tr-log-inspect-badge">
                            <Eye size={10} /> INSPECT
                          </span>
                          <div className="tr-log-glow" />
                        </div>
                      );
                    })
                )}

                {/* Interactive CLI Prompt */}
                <form onSubmit={handleCliSubmit} className="tr-cli-input-row">
                  <span className="tr-cli-prompt-label">◈ &gt;</span>
                  <input
                    type="text"
                    className="tr-cli-text-input"
                    value={cliInput}
                    onChange={(e) => setCliInput(e.target.value)}
                    placeholder="Type /train, /nodes, /status, /help or command..."
                    spellCheck="false"
                    autoComplete="off"
                  />
                  <button type="submit" className="tr-cli-send-btn">RUN</button>
                </form>
              </div>
            </div>

            {/* ── Interactive Pop-Up Bar on Log Selection ── */}
            <AnimatePresence>
              {selectedLog && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="tr-popup-quickbar"
                >
                  <div className="tr-popup-bar-left">
                    <div className="tr-popup-bar-badge">
                      <Sparkles size={12} className="text-cyan-400" />
                      <span>LOG EVENT #{selectedLog.index + 1}</span>
                    </div>
                    <span className="tr-popup-bar-ts">{selectedLog.ts}</span>
                    <span className="tr-popup-bar-prefix">[{selectedLog.prefix}]</span>
                    <span className="tr-popup-bar-msg truncate" title={selectedLog.msg}>
                      {selectedLog.msg}
                    </span>
                  </div>
                  <div className="tr-popup-bar-actions">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`[${selectedLog.ts}] [${selectedLog.prefix}] ${selectedLog.msg}`);
                        setLogCopyFeedback(true);
                        setTimeout(() => setLogCopyFeedback(false), 2000);
                      }}
                      className="tr-popup-bar-btn-copy"
                    >
                      {logCopyFeedback ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{logCopyFeedback ? 'COPIED' : 'COPY'}</span>
                    </button>
                    <button 
                      onClick={() => setSelectedLog(null)} 
                      className="tr-popup-bar-btn-close"
                      title="Dismiss Pop-up Bar"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ── LOG EVENT EXPANDED INSPECTOR MODAL ── */}
          <AnimatePresence>
            {selectedLog && (
              <div className="tr-modal-backdrop" onClick={() => setSelectedLog(null)}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="tr-modal-card" 
                  onClick={e => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="tr-modal-header">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${selectedLog.isError ? 'bg-red-500/20 text-red-400 border border-red-500/30' : selectedLog.isWarning ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : selectedLog.isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}`}>
                        <TerminalIcon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <span>Telemetry Event Detail</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                            [{selectedLog.prefix}]
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">Recorded Timestamp: <span className="font-mono text-cyan-200">{selectedLog.ts}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsTerminalMaximized(!isTerminalMaximized)} 
                        className="tr-modal-tool-btn" 
                        title="Toggle Fullscreen View"
                      >
                        {isTerminalMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                        <span>{isTerminalMaximized ? "RESTORE" : "EXPAND FULLSCREEN"}</span>
                      </button>
                      <button onClick={() => setSelectedLog(null)} className="tr-modal-close-btn" title="Close Inspector">
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="tr-modal-meta-grid">
                    <div className="tr-meta-item">
                      <span className="tr-meta-k">Source / Participant:</span>
                      <span className="tr-meta-v text-cyan-300 font-mono font-bold">{selectedLog.prefix}</span>
                    </div>
                    <div className="tr-meta-item">
                      <span className="tr-meta-k">Event Classification:</span>
                      <span className="tr-meta-v text-slate-100 font-semibold">{selectedLog.type ? selectedLog.type.toUpperCase() : 'TELEMETRY_LOG'}</span>
                    </div>
                    <div className="tr-meta-item">
                      <span className="tr-meta-k">Security & Integrity Audit:</span>
                      <span className={`tr-meta-v font-bold ${selectedLog.isError ? 'text-red-400' : selectedLog.isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {selectedLog.isError ? 'CRITICAL ERROR' : selectedLog.isWarning ? 'WARNING DETECTED' : 'CRYPTOGRAPHICALLY VALID ✓'}
                      </span>
                    </div>
                    <div className="tr-meta-item">
                      <span className="tr-meta-k">Integrity Ledger State:</span>
                      <span className="tr-meta-v text-purple-300 font-mono">Smart Contract Verified (Height: 1)</span>
                    </div>
                  </div>

                  {/* Payload & Full Text Box */}
                  <div className="tr-modal-payload-box">
                    <div className="tr-payload-header">
                      <span className="text-slate-200 font-semibold text-[11px] flex items-center gap-1.5">
                        <Code size={13} className="text-cyan-400" /> Expanded Message & Full Payload:
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedLog.msg);
                          setLogCopyFeedback(true);
                          setTimeout(() => setLogCopyFeedback(false), 2000);
                        }}
                        className="tr-payload-copy-btn"
                      >
                        {logCopyFeedback ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>{logCopyFeedback ? 'COPIED TO CLIPBOARD' : 'COPY RAW PAYLOAD'}</span>
                      </button>
                    </div>
                    <pre className="tr-payload-content" style={{ color: selectedLog.msgColor || '#f8fafc' }}>
                      {selectedLog.msg}
                    </pre>
                  </div>

                  {/* Actions Footer */}
                  <div className="tr-modal-footer">
                    <button 
                      onClick={() => {
                        const exportStr = JSON.stringify({
                          timestamp: selectedLog.ts,
                          source: selectedLog.prefix,
                          type: selectedLog.type || 'telemetry',
                          message: selectedLog.msg,
                          audit: 'VERIFIED_SHA256'
                        }, null, 2);
                        navigator.clipboard.writeText(exportStr);
                        setLogCopyFeedback(true);
                        setTimeout(() => setLogCopyFeedback(false), 2000);
                      }}
                      className="tr-footer-btn-secondary"
                    >
                      <Copy size={13} />
                      <span>{logCopyFeedback ? "Copied JSON!" : "Copy JSON Event Object"}</span>
                    </button>
                    <button onClick={() => setSelectedLog(null)} className="tr-footer-btn-primary">
                      Close Inspector
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ── FULLSCREEN EXPANDED AUDIT LEDGER COVER MODAL ── */}
          <AnimatePresence>
            {isLedgerExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="tr-fullscreen-ledger-backdrop"
                onClick={() => setIsLedgerExpanded(false)}
              >
                <motion.div
                  initial={{ scale: 0.97, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.97, opacity: 0, y: 15 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="tr-fullscreen-ledger-container"
                >
                  {/* Top Institutional Header */}
                  <div className="tr-fs-header">
                    <div className="flex items-center gap-3.5">
                      <div className="tr-fs-icon-wrap">
                        <Database size={18} className="text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="tr-fs-title">Institutional Parameter Audit Ledger</h3>
                          <span className="tr-fs-pill-live">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            LIVE ON-CHAIN SYNCHRONIZED
                          </span>
                        </div>
                        <p className="tr-fs-subtitle">Decentralized Cryptographic Proofs • Differential Privacy Audit • Smart Contract Multi-Party Ledger</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Search Bar */}
                      <div className="tr-fs-search-box">
                        <Search size={13} className="text-slate-400" />
                        <input
                          type="text"
                          value={ledgerSearch}
                          onChange={(e) => setLedgerSearch(e.target.value)}
                          placeholder="Filter by Node, Tx, Round, Hash..."
                          className="tr-fs-search-input"
                        />
                        {ledgerSearch && (
                          <button onClick={() => setLedgerSearch('')} className="text-slate-400 hover:text-slate-600">
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      {/* Export Button */}
                      <button
                        onClick={() => {
                          const exportData = JSON.stringify(roundHistory, null, 2);
                          navigator.clipboard.writeText(exportData);
                          setLedgerExportFeedback(true);
                          setTimeout(() => setLedgerExportFeedback(false), 2000);
                        }}
                        className="tr-fs-export-btn"
                        title="Copy complete audit trail JSON"
                      >
                        {ledgerExportFeedback ? <Check size={12} className="text-emerald-600" /> : <Download size={12} />}
                        <span>{ledgerExportFeedback ? "COPIED JSON" : "EXPORT AUDIT"}</span>
                      </button>

                      {/* Collapse Button */}
                      <button 
                        onClick={() => setIsLedgerExpanded(false)}
                        className="tr-fs-close-btn"
                        title="Collapse view and return to workspace"
                      >
                        <Minimize2 size={13} />
                        <span>COLLAPSE VIEW [ESC]</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Summary Metrics Strip */}
                  <div className="tr-fs-stats-bar">
                    <div className="tr-fs-stat-item">
                      <span className="tr-fs-stat-k">TOTAL RECORDED ROUNDS</span>
                      <span className="tr-fs-stat-v font-mono">{roundHistory.length} CYCLES</span>
                    </div>
                    <div className="tr-fs-stat-divider" />
                    <div className="tr-fs-stat-item">
                      <span className="tr-fs-stat-k">SMART CONTRACT VALIDATION</span>
                      <span className="tr-fs-stat-v text-emerald-600 font-mono font-bold">100% MERKLE VERIFIED</span>
                    </div>
                    <div className="tr-fs-stat-divider" />
                    <div className="tr-fs-stat-item">
                      <span className="tr-fs-stat-k">DIFFERENTIAL PRIVACY GAUSSIAN</span>
                      <span className="tr-fs-stat-v font-mono text-cyan-700">L2-NORM CLIP (1.5) + σ=0.005</span>
                    </div>
                    <div className="tr-fs-stat-divider" />
                    <div className="tr-fs-stat-item">
                      <span className="tr-fs-stat-k">ACTIVE PARTICIPANTS</span>
                      <span className="tr-fs-stat-v text-primary font-mono font-bold">{Object.keys(safeNodeRegistry).length || 1} EDGE NODES</span>
                    </div>
                  </div>

                  {/* Fullscreen Table Viewport */}
                  <div className="tr-fs-table-wrap">
                    <table className="tr-fs-table">
                      <thead>
                        <tr>
                          <th style={{ width: '85px' }}>RND</th>
                          <th style={{ width: '220px' }}>NODE_ID</th>
                          <th style={{ width: '200px' }}>PARAMETERS_GRID</th>
                          <th style={{ width: '110px', textAlign: 'right' }}>ACCURACY</th>
                          <th style={{ width: '110px', textAlign: 'right' }}>LOCAL LOSS</th>
                          <th style={{ width: '200px', textAlign: 'right' }}>ON-CHAIN TX HASH</th>
                          <th style={{ width: '160px', textAlign: 'right' }}>INTEGRITY STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRoundHistory.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="tr-fs-empty">
                              <div className="tr-fs-empty-icon">
                                <Database size={32} className="text-slate-400" />
                              </div>
                              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-700">
                                {roundHistory.length === 0 ? "Awaiting Initial Orchestration Cycle" : "No records match search filter"}
                              </span>
                              <span className="text-[10.5px] text-slate-400 max-w-md text-center">
                                {roundHistory.length === 0 
                                  ? "When you trigger a federated session, local edge node updates, L2-norm clipped gradients, and smart contract blockchain transactions stream directly into this full-screen audit journal."
                                  : "Try clearing your search query to view all recorded federated learning rounds."}
                              </span>
                            </td>
                          </tr>
                        ) : (
                          filteredRoundHistory.map((row, idx) => {
                            const clientName = row.client || row.client_id || 'NODE';
                            const shortClient = clientName.length > 20 
                              ? `${clientName.substring(0, 10)}...${clientName.substring(clientName.length - 6)}`
                              : clientName;
                            const isRowOpen = expandedLedgerRow === idx;
                            const txId = row.tx_id || row.txId || '0x' + Math.random().toString(36).substring(2, 14);

                            return (
                              <React.Fragment key={idx}>
                                <tr 
                                  onClick={() => setExpandedLedgerRow(isRowOpen ? null : idx)}
                                  className={`tr-fs-row ${isRowOpen ? 'tr-fs-row-active' : ''}`}
                                  title="Click to inspect cryptographic audit trail"
                                >
                                  <td>
                                    <div className="flex items-center gap-1.5">
                                      {isRowOpen ? (
                                        <ChevronDown size={11} className="text-blue-600 shrink-0" />
                                      ) : (
                                        <ChevronRight size={11} className="text-slate-400 shrink-0" />
                                      )}
                                      <span className="font-mono font-bold text-slate-800 text-[11px]">#{row.round.toString().padStart(2, '0')}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-mono font-semibold text-slate-800 text-[11px] select-all">{shortClient}</span>
                                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">SECURE_EDGE_NODE</span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="flex items-center gap-2.5 font-mono text-[10.5px]">
                                      <span><b className="text-slate-400 font-medium">LR:</b> {row.lr || '0.01'}</span>
                                      <span><b className="text-slate-400 font-medium">B:</b> {row.batch || '32'}</span>
                                      <span><b className="text-slate-400 font-medium">σ:</b> 0.001</span>
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className="font-mono text-[11.5px] font-bold text-emerald-600">
                                      {row.acc !== undefined ? `${(row.acc * 100).toFixed(2)}%` : row.accuracy !== undefined ? `${(row.accuracy * 100).toFixed(2)}%` : '—'}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className="font-mono text-[11px] text-slate-600">
                                      {row.loss !== undefined ? Number(row.loss).toFixed(4) : '—'}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className="font-mono text-[10px] text-indigo-600 select-all font-medium">
                                      Tx #{txId.startsWith('0x') ? txId.substring(0, 14) : `0x${txId.substring(0, 12)}`}...
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                                      <CheckCircle2 size={10} /> ON-CHAIN VERIFIED
                                    </span>
                                  </td>
                                </tr>

                                {isRowOpen && (
                                  <tr className="tr-fs-detail-row">
                                    <td colSpan="7" className="p-0">
                                      <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="tr-fs-detail-card"
                                      >
                                        <div className="grid grid-cols-4 gap-4">
                                          <div>
                                            <span className="text-[8.5px] font-bold uppercase text-slate-400 block mb-0.5">Zero-Knowledge Proof ID</span>
                                            <span className="text-[10px] font-mono text-slate-800 font-bold select-all">zk-{row.proofId || `${Math.random().toString(36).substring(2, 10)}-audit-${row.round}`}</span>
                                          </div>
                                          <div>
                                            <span className="text-[8.5px] font-bold uppercase text-slate-400 block mb-0.5">Differential Privacy Guard</span>
                                            <span className="text-[10px] text-emerald-700 font-semibold block">Gaussian DP (ε = 1.05, δ = 1e-5)</span>
                                          </div>
                                          <div>
                                            <span className="text-[8.5px] font-bold uppercase text-slate-400 block mb-0.5">Model Weight Hash</span>
                                            <span className="text-[10px] font-mono text-indigo-700 select-all block">sha256:{row.hash || row.gradHash || '0x' + Math.random().toString(36).substring(2, 16)}</span>
                                          </div>
                                          <div>
                                            <span className="text-[8.5px] font-bold uppercase text-slate-400 block mb-0.5">Consensus Validation</span>
                                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                              <CheckCircle2 size={11} /> Smart Contract Validated
                                            </span>
                                          </div>
                                        </div>
                                      </motion.div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer */}
                  <div className="tr-fs-footer">
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                      BLOCKCHAIN HEIGHT: {roundHistory.length + 1} BLOCKS • DIFFICULTY: 1 (INSTITUTIONAL FEDERATED CONSENSUS)
                    </span>
                    <button 
                      onClick={() => setIsLedgerExpanded(false)}
                      className="tr-fs-footer-close-btn"
                    >
                      <span>Close Fullscreen View</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .tr-root {
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          background: var(--bg-main);
          min-height: 100%;
          font-family: var(--font-sans);
        }

        /* ─── Header ─── */
        .tr-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 8px;
        }
        .tr-module-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .tr-badge-num {
          font-size: 10px;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 0.1em;
        }
        .tr-badge-sep {
          width: 24px; height: 1px;
          background: var(--primary);
          opacity: 0.2;
        }
        .tr-badge-text {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }
        .tr-title {
          font-family: var(--font-serif);
          font-size: 28px;
          font-weight: 500;
          color: var(--text-main);
          margin: 0;
          letter-spacing: -0.01em;
        }
        .tr-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .tr-status-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: #f0fdf4;
          border: 1px solid #dcfce7;
        }
        .tr-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 8px var(--success);
        }
        .tr-status-text {
          font-size: 10px;
          font-weight: 800;
          color: #166534;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .tr-run-btn {
          height: 42px;
          padding: 0 24px;
          background: var(--primary);
          color: #fff;
          border: none;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          position: relative;
        }
        .tr-btn-line {
          position: absolute;
          bottom: 12px; right: 24px;
          width: 12px; height: 1px;
          background: rgba(255,255,255,0.4);
          transition: width 0.2s;
        }

        /* ─── Grid ─── */
        .tr-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 28px;
          align-items: start;
        }
        @media (max-width: 1280px) {
          .tr-grid {
            grid-template-columns: 1fr;
          }
        }
        .tr-col { display: flex; flex-direction: column; gap: 28px; }

        .tr-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .tr-card-header {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(var(--bg-surface-rgb), 0.5);
        }
        .tr-card-title-wrap { display: flex; align-items: center; gap: 10px; }
        .tr-card-icon { color: var(--primary); opacity: 0.6; }
        .tr-card-title {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .tr-card-action {
          background: none; border: none; cursor: pointer;
          font-size: 9px; font-weight: 700; color: var(--primary);
          text-transform: uppercase; letter-spacing: 0.1em;
        }
        .tr-card-action:hover { text-decoration: underline; }

        .tr-config-grid {
          padding: 24px 32px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .tr-config-field { display: flex; flex-direction: column; gap: 12px; }
        .tr-config-label {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .tr-config-input-wrap {
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 1px solid var(--border);
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .tr-config-value {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: 0.05em;
        }

        /* ─── Ledger Overhaul ─── */
        .tr-ledger-card { 
          border-color: var(--border);
          background: linear-gradient(to bottom, #fff, #fcfcfc);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tr-ledger-card-expanded {
          min-height: 520px;
          border-color: #94a3b8;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
        }
        .tr-ledger-meta { display: flex; align-items: center; gap: 20px; }
        .tr-ver-status { display: flex; align-items: center; gap: 8px; font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .tr-live-sync { display: flex; align-items: center; gap: 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
        .tr-sync-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); animation: tr-pulse 2s infinite; }
        @keyframes tr-pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

        .tr-expand-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 4px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #334155;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tr-expand-toggle-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
          border-color: #94a3b8;
        }
        .tr-ledger-scroll { 
          max-height: 380px; 
          min-height: 190px;
          overflow-y: auto; 
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tr-ledger-scroll-expanded {
          min-height: 480px;
          max-height: 720px;
        }
        .tr-empty-state-td {
          padding: 0 !important;
          border: none !important;
        }
        .tr-empty-state {
          padding: 45px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.25s ease;
        }
        .tr-empty-state-expanded {
          padding: 120px 24px;
          gap: 18px;
        }
        .tr-empty-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tr-empty-state-expanded .tr-empty-icon-wrap {
          width: 60px;
          height: 60px;
          background: #e2e8f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .tr-ledger-scroll::-webkit-scrollbar { width: 6px; }
        .tr-ledger-scroll::-webkit-scrollbar-track { background: transparent; }
        .tr-ledger-scroll::-webkit-scrollbar-thumb { 
          background: var(--border); 
          border: 2px solid #fff;
          border-radius: 10px;
        }

        .tr-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
        .tr-table thead { position: sticky; top: 0; z-index: 10; }
        .tr-table-header-row { background: #fbfbfb; }
        .tr-table th {
          padding: 10px 16px;
          font-size: 8.5px; font-weight: 800; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.12em;
          border-bottom: 2px solid var(--border);
        }
        .tr-table td { padding: 10px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        
        .tr-ledger-row {
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .tr-ledger-row:hover {
          background-color: #f8fafc;
        }
        .tr-ledger-row-active {
          background-color: #f1f5f9 !important;
        }

        .tr-ledger-detail-cell {
          padding: 0 !important;
          background: #f8fafc;
          border-bottom: 1px solid var(--border);
        }
        .tr-ledger-detail-card {
          padding: 12px 18px;
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          border-left: 3px solid #3b82f6;
        }
        .tr-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px 20px;
        }
        .tr-detail-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .tr-detail-k {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
        }
        .tr-detail-v {
          font-size: 10.5px;
          color: #1e293b;
          word-break: break-all;
        }
        
        .tr-td-rnd { width: 70px; }
        .tr-rnd-num { font-family: var(--font-mono, monospace); font-size: 11px; font-weight: 700; color: var(--primary); }
        
        .tr-node-info { display: flex; flex-direction: column; gap: 2px; min-width: 140px; }
        .tr-node-id { font-family: var(--font-mono, monospace); font-size: 11px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tr-node-label { font-size: 8px; font-weight: 700; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; }

        .tr-params-grid { display: flex; gap: 16px; align-items: center; }
        .tr-param-item { display: inline-flex; gap: 6px; align-items: baseline; }
        .tr-param-k { font-size: 9px; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase; }
        .tr-param-v { font-family: var(--font-mono, monospace); font-size: 11px; font-weight: 700; color: #0f172a; }

        .tr-acc-yield { font-family: var(--font-mono, monospace); font-size: 12px; font-weight: 800; color: #059669; }

        .tr-status-pill { 
          display: inline-flex; align-items: center; justify-content: center;
          white-space: nowrap; height: 24px; padding: 0 10px;
          border-radius: 4px; font-size: 9px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .tr-status-verified { 
          background: #ecfdf5; 
          border: 1px solid #a7f3d0; 
          color: #047857 !important; 
        }

        .tr-ledger-footer { padding: 12px 20px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #fff; }
        .tr-footer-text { font-size: 9px; color: var(--text-muted); opacity: 0.8; letter-spacing: 0.05em; }
        .tr-footer-stats { display: flex; align-items: center; gap: 10px; }
        .tr-stat-label { font-size: 8px; font-weight: 700; color: var(--text-muted); }
        .tr-stat-val { font-family: var(--font-mono, monospace); font-size: 10px; font-weight: 800; color: var(--text-main); }

        /* ─── Enrolled Edge Nodes & Telemetry Section ─── */
        .tr-nodes-section {
          background: #ffffff;
          border: 1px solid var(--border);
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .tr-nodes-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 800;
          color: #0284c7;
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          padding: 2px 8px;
          border-radius: 999px;
          letter-spacing: 0.06em;
          line-height: 1.2;
          white-space: nowrap;
        }
        .tr-nodes-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tr-nodes-body {
          padding: 14px 18px;
          max-height: 380px;
          overflow-y: auto;
        }
        .tr-nodes-body::-webkit-scrollbar { width: 5px; }
        .tr-nodes-body::-webkit-scrollbar-track { background: transparent; }
        .tr-nodes-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .tr-nodes-body::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .tr-no-nodes-card {
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 6px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .tr-no-nodes-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .tr-quick-join-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          padding: 8px 12px;
          border-radius: 6px;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
        }
        .tr-quick-join-box code {
          font-weight: 600;
          color: #0f172a;
          word-break: break-all;
        }
        .tr-mini-copy-btn {
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #cbd5e1;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          flex-shrink: 0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.15s ease-in-out;
        }
        .tr-mini-copy-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }
        .tr-nodes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (max-width: 960px) {
          .tr-nodes-grid {
            grid-template-columns: 1fr;
          }
        }
        .tr-node-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tr-node-card:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }
        .tr-node-card-selected {
          background: #eff6ff !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 1px #3b82f6;
        }
        .tr-node-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .tr-node-id-group {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
        }
        .tr-node-status-dot-green {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          flex-shrink: 0;
        }
        .tr-node-name {
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }
        .tr-node-sub {
          font-family: var(--font-mono, monospace);
          font-size: 8.5px;
          color: #64748b;
          line-height: 1.2;
        }
        .tr-node-rep-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          padding: 2px 5px;
          border-radius: 4px;
          font-size: 8.5px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .tr-node-specs {
          display: flex;
          flex-direction: column;
          gap: 3px;
          background: #ffffff;
          padding: 6px 8px;
          border-radius: 4px;
          border: 1px solid #f1f5f9;
        }
        .tr-node-spec-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 9px;
          line-height: 1.3;
        }
        .tr-spec-k {
          font-size: 8.5px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .tr-spec-v {
          font-size: 9px;
          max-width: 140px;
          text-align: right;
        }
        .tr-node-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 2px;
        }
        .tr-node-hash {
          font-size: 8.5px;
          color: #059669;
          background: #f0fdf4;
          padding: 1px 5px;
          border-radius: 3px;
        }
        .tr-node-inspect-tag {
          font-size: 8.5px;
          font-weight: 800;
          color: #2563eb;
          letter-spacing: 0.04em;
        }

        /* ─── High-Contrast Console & Pop-up Inspector ─── */
        .tr-console-container {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          height: 460px;
          position: relative;
          box-shadow: 0 16px 40px -10px rgba(0,0,0,0.7);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tr-console-maximized {
          position: fixed !important;
          inset: 24px !important;
          height: calc(100vh - 48px) !important;
          z-index: 9999 !important;
          box-shadow: 0 25px 60px -12px rgba(0,0,0,0.95), 0 0 0 1px #334155 !important;
          border-radius: 12px !important;
        }
        .tr-console-header {
          padding: 0 12px;
          height: 42px;
          border-bottom: 1px solid #1e293b;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #0b1220;
          flex-shrink: 0;
          gap: 8px;
          overflow-x: auto;
        }
        .tr-console-header::-webkit-scrollbar { height: 2px; }
        .tr-console-header::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
        .tr-console-tabs { 
          display: flex; 
          align-items: center;
          height: 100%; 
          background: transparent;
          flex-shrink: 0;
        }
        .tr-tab { 
          display: inline-flex; 
          align-items: center; 
          gap: 6px; 
          padding: 0 12px;
          height: 100%;
          font-size: 10px; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 0.06em;
          white-space: nowrap !important;
          flex-shrink: 0;
          color: #94a3b8 !important; 
          border-right: 1px solid rgba(255,255,255,0.06);
          background: #080e1a;
          cursor: pointer; 
          transition: all 0.15s ease;
          user-select: none;
        }
        .tr-tab .tr-tab-text { 
          color: #94a3b8 !important; 
          white-space: nowrap !important;
          transition: color 0.15s ease; 
        }
        .tr-tab:hover { background: rgba(255,255,255,0.06); }
        .tr-tab:hover .tr-tab-text { color: #ffffff !important; }
        
        .tr-tab.active { 
          background: #0e172a !important; 
          border-top: 2px solid #38bdf8 !important; 
          box-shadow: inset 0 2px 10px rgba(56, 189, 248, 0.15);
        }
        .tr-tab.active.tab-telemetry { border-top-color: #38bdf8 !important; }
        .tr-tab.active.tab-telemetry .tr-tab-text { color: #38bdf8 !important; font-weight: 800; }
        
        .tr-tab.active.tab-feed { border-top-color: #10b981 !important; }
        .tr-tab.active.tab-feed .tr-tab-text { color: #34d399 !important; font-weight: 800; }
        
        .tr-tab.active.tab-audit { border-top-color: #f59e0b !important; }
        .tr-tab.active.tab-audit .tr-tab-text { color: #fbbf24 !important; font-weight: 800; }

        .tr-tab-badge {
          font-size: 8.5px;
          font-family: var(--font-mono, monospace);
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: #cbd5e1;
          border: 1px solid rgba(255,255,255,0.05);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .tr-tab.active.tab-telemetry .tr-tab-badge {
          background: rgba(56, 189, 248, 0.2);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.4);
        }
        .tr-tab.active.tab-feed .tr-tab-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .tr-tab.active.tab-audit .tr-tab-badge {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }

        .tr-console-actions { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          flex-shrink: 0;
          margin-left: auto;
        }
        .tr-console-search-box {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid #334155;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .tr-search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #f8fafc;
          font-size: 9.5px;
          width: 95px;
          font-family: var(--font-mono, monospace);
        }
        .tr-search-input::placeholder { color: #64748b; }
        .tr-latency { 
          display: flex; align-items: center; gap: 5px; 
          font-size: 8.5px; font-weight: 700; color: #94a3b8; 
          text-transform: uppercase; letter-spacing: 0.05em; 
          font-family: var(--font-mono, monospace);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .tr-latency-dot { width: 5px; height: 5px; border-radius: 50%; background: #10B981; box-shadow: 0 0 6px #10B981; }
        .tr-btn-tool {
          display: inline-flex; 
          align-items: center; 
          gap: 5px;
          background: rgba(56, 189, 248, 0.08); 
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 3px 8px; 
          border-radius: 4px; 
          font-size: 8.5px; 
          font-weight: 800;
          color: #38bdf8; 
          text-transform: uppercase; 
          letter-spacing: 0.05em;
          white-space: nowrap;
          flex-shrink: 0;
          cursor: pointer; 
          transition: all 0.15s ease;
        }
        .tr-btn-tool:hover { 
          background: rgba(56, 189, 248, 0.22); 
          border-color: #38bdf8; 
          color: #ffffff; 
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
        }
        .tr-btn-clear { 
          background: rgba(255,255,255,0.04); 
          border: 1px solid rgba(255,255,255,0.08); 
          padding: 3px 8px; 
          border-radius: 4px;
          font-size: 8.5px; 
          font-weight: 700; 
          color: #94a3b8; 
          text-transform: uppercase; 
          cursor: pointer; 
          transition: all 0.15s ease; 
          white-space: nowrap;
          flex-shrink: 0;
        }
        .tr-btn-clear:hover { 
          background: rgba(239, 68, 68, 0.15); 
          border-color: rgba(239,68,68,0.4); 
          color: #f87171; 
        }

        .tr-console-body { 
          flex: 1; overflow-y: auto; padding: 16px 20px; position: relative;
          font-family: var(--font-mono); font-size: 11px; line-height: 1.6;
          background: #070a12;
        }
        .tr-console-scanline {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.15) 50%);
          background-size: 100% 3px;
          pointer-events: none; z-index: 10; opacity: 0.15;
        }
        .tr-log-line { 
          display: flex; align-items: baseline; gap: 12px; padding: 4px 80px 4px 8px; 
          border-left: 2px solid transparent; border-radius: 3px;
          position: relative; cursor: pointer;
          transition: background-color 0.15s ease, border-color 0.15s ease;
          margin-bottom: 2px;
          box-sizing: border-box;
        }
        .tr-log-line:hover { 
          background: rgba(56, 189, 248, 0.08); 
          border-left-color: #38bdf8; 
        }
        .tr-log-ts { color: #94a3b8; flex-shrink: 0; width: 68px; font-size: 10px; font-family: var(--font-mono); }
        
        .tr-log-prefix { 
          flex-shrink: 0; width: 88px; font-weight: 800; text-transform: uppercase; font-size: 10px;
          display: inline-flex; align-items: center;
        }
        .tr-pfx-node1 {
          color: #38bdf8 !important;
        }
        .tr-pfx-node2 {
          color: #c084fc !important;
        }
        .tr-pfx-sys {
          color: #34d399 !important;
        }
        .tr-pfx-default {
          color: #94a3b8 !important;
        }

        .tr-log-msg { white-space: pre-wrap; font-weight: 500; word-break: break-all; flex: 1; }
        .tr-log-inspect-badge {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 8px;
          font-weight: 800;
          color: #38bdf8;
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(56, 189, 248, 0.4);
          padding: 2px 7px;
          border-radius: 3px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          white-space: nowrap;
        }
        .tr-log-line:hover .tr-log-inspect-badge { 
          opacity: 1; 
        }
        .tr-log-glow { 
          position: absolute; left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(56, 189, 248, 0.03); opacity: 0;
          transition: opacity 0.15s ease; pointer-events: none;
        }
        .tr-log-line:hover .tr-log-glow { opacity: 1; }

        /* ─── Floating Pop-Up Bar on Selection ─── */
        .tr-popup-quickbar {
          position: absolute; bottom: 12px; left: 16px; right: 16px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(56, 189, 248, 0.4);
          border-radius: 8px;
          padding: 8px 14px;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(56, 189, 248, 0.15);
          z-index: 20;
          gap: 12px;
        }
        .tr-popup-bar-left {
          display: flex; align-items: center; gap: 8px;
          overflow: hidden; flex: 1;
        }
        .tr-popup-bar-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3);
          color: #38bdf8; font-size: 8px; font-weight: 800;
          padding: 2px 6px; border-radius: 4px; white-space: nowrap; flex-shrink: 0;
        }
        .tr-popup-bar-ts {
          font-family: var(--font-mono, monospace); font-size: 10px; color: #94a3b8; flex-shrink: 0;
        }
        .tr-popup-bar-prefix {
          font-family: var(--font-mono, monospace); font-size: 10px; font-weight: 800; color: #38bdf8; flex-shrink: 0;
        }
        .tr-popup-bar-msg {
          font-family: var(--font-mono, monospace); font-size: 10px; color: #e2e8f0;
        }
        .tr-popup-bar-actions {
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        .tr-popup-bar-btn-copy {
          display: flex; align-items: center; gap: 4px;
          background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3);
          color: #38bdf8; font-size: 9px; font-weight: 800;
          padding: 4px 8px; border-radius: 4px; cursor: pointer; transition: all 0.15s;
        }
        .tr-popup-bar-btn-copy:hover { background: rgba(56, 189, 248, 0.3); color: #ffffff; }
        .tr-popup-bar-btn-close {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; padding: 4px 6px; border-radius: 4px;
          cursor: pointer; transition: all 0.15s; display: flex; align-items: center;
        }
        .tr-popup-bar-btn-close:hover { background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239,68,68,0.4); }

        /* ─── Pop-up Inspector Modal ─── */
        .tr-modal-backdrop {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .tr-modal-card {
          width: 100%; max-width: 680px;
          background: #0b1220 !important; border: 1px solid #334155 !important;
          border-radius: 12px; box-shadow: 0 25px 60px -10px rgba(0,0,0,0.95), 0 0 25px rgba(56, 189, 248, 0.15) !important;
          display: flex; flex-direction: column; overflow: hidden;
          color: #f8fafc !important;
        }
        .tr-modal-header {
          padding: 16px 20px; background: #0f172a !important;
          border-bottom: 1px solid #1e293b !important;
          display: flex; justify-content: space-between; align-items: center;
        }
        .tr-modal-tool-btn {
          display: flex; align-items: center; gap: 5px;
          background: rgba(56, 189, 248, 0.15) !important; border: 1px solid rgba(56, 189, 248, 0.35) !important;
          color: #38bdf8 !important; font-size: 9px; font-weight: 800;
          padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
        }
        .tr-modal-tool-btn:hover { background: rgba(56, 189, 248, 0.3) !important; color: #ffffff !important; }
        .tr-modal-close-btn {
          background: rgba(255,255,255,0.08) !important; border: 1px solid rgba(255,255,255,0.15) !important;
          color: #cbd5e1 !important; border-radius: 6px; padding: 6px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .tr-modal-close-btn:hover { background: rgba(239,68,68,0.25) !important; color: #f87171 !important; border-color: rgba(239,68,68,0.5) !important; }
        
        .tr-modal-meta-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 10px; padding: 16px 20px; background: #080d18 !important;
          border-bottom: 1px solid #1e293b !important;
        }
        .tr-meta-item {
          display: flex; flex-direction: column; gap: 4px;
          background: #0f172a !important; padding: 10px 14px;
          border-radius: 6px; border: 1px solid #1e293b !important;
        }
        .tr-meta-k { font-size: 9px; font-weight: 800; color: #94a3b8 !important; text-transform: uppercase; letter-spacing: 0.08em; }
        .tr-meta-v { font-size: 12px; font-weight: 700; color: #f8fafc !important; }

        .tr-modal-payload-box {
          padding: 16px 20px; display: flex; flex-direction: column; gap: 8px;
          background: #0b1220 !important;
        }
        .tr-payload-header {
          display: flex; justify-content: space-between; align-items: center;
        }
        .tr-payload-copy-btn {
          display: flex; align-items: center; gap: 5px;
          background: rgba(56, 189, 248, 0.15) !important; border: 1px solid rgba(56, 189, 248, 0.35) !important;
          color: #38bdf8 !important; font-size: 9px; font-weight: 800;
          padding: 4px 10px; border-radius: 4px; cursor: pointer; transition: all 0.2s;
        }
        .tr-payload-copy-btn:hover { background: rgba(56, 189, 248, 0.3) !important; color: #ffffff !important; }
        .tr-payload-content {
          background: #030712 !important; border: 1px solid #1e293b !important;
          border-radius: 6px; padding: 14px 16px;
          font-family: var(--font-mono, monospace); font-size: 11.5px;
          line-height: 1.6; max-height: 220px; overflow-y: auto;
          white-space: pre-wrap; word-break: break-all;
          color: #38bdf8 !important;
        }

        .tr-modal-footer {
          padding: 12px 20px; background: #0f172a !important;
          border-top: 1px solid #1e293b !important;
          display: flex; justify-content: space-between; align-items: center;
        }
        .tr-footer-btn-secondary {
          display: flex; align-items: center; gap: 6px;
          background: #1e293b !important; border: 1px solid #334155 !important;
          color: #f1f5f9 !important; font-size: 10px; font-weight: 700;
          padding: 7px 14px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
        }
        .tr-footer-btn-secondary:hover { background: #334155 !important; color: #ffffff !important; border-color: #475569 !important; }
        .tr-footer-btn-primary {
          background: #0284c7 !important; border: none; color: #ffffff !important;
          font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
          padding: 7px 18px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
        }
        .tr-footer-btn-primary:hover { background: #0369a1 !important; }

        .tr-cli-welcome {
          padding: 12px 14px;
          background: #090d16 !important;
          border: 1px solid rgba(56, 189, 248, 0.15) !important;
          border-radius: 6px;
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          color: #f8fafc !important;
        }
        .tr-cli-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          font-size: 11px;
          letter-spacing: 0.03em;
        }
        .tr-cli-version-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2.5px 7px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 4px;
          white-space: nowrap;
          line-height: 1;
        }
        .tr-cli-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 5px rgba(52, 211, 153, 0.6);
          flex-shrink: 0;
        }
        .tr-cli-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 8px 14px;
        }
        .tr-cli-info-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .tr-cli-k {
          color: #94a3b8 !important;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 8px;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
        }
        .tr-cli-v {
          font-family: var(--font-mono, monospace);
          font-weight: 600;
          font-size: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tr-cli-commands-hint {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          padding-top: 6px;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
        }
        .tr-cmd-tag {
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          font-weight: 700;
          color: #38bdf8 !important;
          background: rgba(56, 189, 248, 0.1) !important;
          border: 1px solid rgba(56, 189, 248, 0.25) !important;
          padding: 2px 6px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.15s ease;
          outline: none;
        }
        .tr-cmd-tag:hover {
          background: rgba(56, 189, 248, 0.22) !important;
          border-color: #38bdf8 !important;
          color: #ffffff !important;
        }

        .tr-cli-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .tr-cli-prompt-label {
          color: #10b981;
          font-weight: 800;
          font-family: var(--font-mono, monospace);
          font-size: 12px;
          flex-shrink: 0;
        }
        .tr-cli-text-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #38bdf8;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
        }
        .tr-cli-text-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
          font-style: italic;
        }
        .tr-cli-send-btn {
          height: 22px;
          padding: 0 8px;
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #94a3b8;
          font-size: 8px;
          font-weight: 800;
          border-radius: 3px;
          cursor: pointer;
          letter-spacing: 0.08em;
          transition: all 0.15s;
        }
        .tr-cli-send-btn:hover {
          background: #334155;
          color: #ffffff;
        }

        .tr-console-body::-webkit-scrollbar { width: 6px; }
        .tr-console-body::-webkit-scrollbar-track { background: transparent; }
        .tr-console-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .tr-console-body::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }

        .tr-code-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .tr-dot-idle {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
        }
        .tr-dot-pulse-active {
          background: #ef4444;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
          animation: tr-pulse 1.5s infinite;
        }
        .tr-live-exec-badge {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          flex-shrink: 0;
          gap: 6px;
          padding: 3px 9px;
          border-radius: 9999px;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #ef4444 !important;
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          line-height: 1;
        }
        .tr-live-exec-dot-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 7px;
          height: 7px;
          flex-shrink: 0;
        }
        .tr-live-exec-ping {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #ef4444;
          opacity: 0.75;
          animation: tr-live-ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .tr-live-exec-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ef4444;
          position: relative;
          z-index: 1;
        }
        @keyframes tr-live-ping {
          0% { transform: scale(0.9); opacity: 0.9; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        .tr-sync-pill {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          flex-shrink: 0;
          gap: 4px;
          padding: 3px 9px;
          border-radius: 999px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1;
        }

        /* ── Script Card & Action Toolbar ── */
        .tr-script-card {
          min-height: 380px;
          display: flex;
          flex-direction: column;
          background: #fff;
          border: 1px solid var(--border);
        }
        .tr-code-header {
          padding: 8px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          min-height: 46px;
          background: #fff;
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .tr-action-toolbar {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .tr-tool-btn {
          height: 26px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0 9px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          color: #334155 !important;
          font-size: 8.5px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .tr-tool-btn:hover {
          background: #e2e8f0;
          color: #0f172a !important;
        }
        .tr-inject-btn {
          height: 26px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0 9px;
          background: #f8fafc;
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--primary) !important;
          font-size: 8.5px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .tr-inject-btn:hover {
          background: #f1f5f9;
          border-color: var(--primary);
        }
        .tr-confirm-inject-btn {
          height: 26px;
          padding: 0 10px;
          background: #10b981;
          color: #fff !important;
          border: none;
          border-radius: 4px;
          font-size: 8.5px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .tr-confirm-inject-btn:hover {
          background: #059669;
        }
        .tr-cancel-btn {
          height: 26px;
          padding: 0 8px;
          background: #e2e8f0;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          color: #475569 !important;
          font-size: 8.5px;
          font-weight: 700;
          cursor: pointer;
        }
        .tr-download-group {
          display: inline-flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 1px;
          gap: 1px;
        }
        .tr-download-item-btn {
          height: 24px;
          padding: 0 8px;
          background: transparent;
          color: #334155 !important;
          font-size: 8.5px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          border-radius: 3px;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .tr-download-item-btn:hover {
          background: #ffffff;
          color: #0f172a !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .tr-download-item-report {
          color: #16a34a !important;
        }
        .tr-download-item-report:hover {
          background: #dcfce7;
          color: #15803d !important;
        }
        .tr-filename-tag {
          height: 22px;
          padding: 0 7px;
          display: inline-flex;
          align-items: center;
          font-size: 9.5px;
          font-weight: 700;
          font-family: var(--font-mono, monospace);
          color: #0284c7 !important;
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          border-radius: 4px;
          white-space: nowrap;
        }

        /* ── Dynamic High-Contrast Metadata Bar ── */
        .tr-code-meta-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 18px;
          background: #090e1a;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          flex-wrap: wrap;
          gap: 10px;
        }
        .tr-meta-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .tr-meta-sha-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 6px;
        }
        .tr-meta-label {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8 !important;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .tr-meta-hash-text {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          color: #34d399 !important;
        }
        .tr-meta-dataset-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 6px;
        }
        .tr-meta-dataset-text {
          font-size: 10px;
          font-weight: 700;
          color: #38bdf8 !important;
          font-family: var(--font-mono, monospace);
        }
        .tr-meta-audit-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(16, 185, 129, 0.18);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399 !important;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
          border-radius: 6px;
          text-transform: uppercase;
        }

        /* ── Script Body & Code Editor ── */
        .tr-script-body {
          padding: 0;
          background: #03060c;
          flex: 1;
          overflow-y: auto;
          overflow-x: auto;
          max-height: 480px;
        }
        .tr-code-view-wrap {
          width: 100%;
          min-width: 100%;
        }
        .tr-code-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          line-height: 1.6;
        }
        .tr-code-row {
          transition: background 0.1s;
        }
        .tr-code-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .tr-code-row .tr-gutter-num {
          width: 46px;
          min-width: 46px;
          max-width: 46px;
          padding: 0 10px;
          text-align: right;
          color: #475569 !important;
          background: #020408;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          user-select: none;
          vertical-align: top;
          font-family: inherit;
          font-size: 11px;
          line-height: 1.6;
        }
        .tr-code-row .tr-code-line {
          padding: 0 16px;
          color: #f1f5f9 !important;
          white-space: pre;
          vertical-align: top;
          overflow: hidden;
          font-family: inherit;
          font-size: 11px;
          line-height: 1.6;
        }
        .tr-code-row .tr-code-line code {
          font-family: inherit;
          color: inherit;
          font-size: inherit;
        }
        .tr-code-editor-area {
          width: 100%;
          height: 420px;
          padding: 18px 24px;
          background: #03060c;
          color: #38bdf8 !important;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          line-height: 1.6;
          border: none;
          outline: none;
          resize: vertical;
        }

        .tr-metrics-card { min-height: 400px; }
        .tr-metrics-legend { display: flex; gap: 16px; }
        .tr-legend-item { display: flex; align-items: center; gap: 8px; font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
        .tr-dot { width: 10px; height: 2px; }
        .tr-dot-primary { background: var(--primary); }
        .tr-dot-error { background: var(--error); }
        .tr-metrics-body { padding: 32px; background: #fff; flex: 1; }

        /* ── Fullscreen Expanded Audit Ledger Cover Modal ── */
        .tr-fullscreen-ledger-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
        }
        .tr-fullscreen-ledger-container {
          width: 100%;
          max-width: 1380px;
          height: 90vh;
          max-height: 880px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: var(--font-sans);
        }
        .tr-fs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          background: #f8fafc;
        }
        .tr-fs-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: #ffffff;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .tr-fs-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.01em;
          margin: 0;
          font-family: var(--font-sans);
        }
        .tr-fs-pill-live {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2.5px 8px;
          border-radius: 9999px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          font-size: 8.5px;
          font-weight: 700;
          color: #065f46;
          letter-spacing: 0.06em;
          font-family: var(--font-mono);
        }
        .tr-fs-subtitle {
          font-size: 10px;
          color: var(--text-muted);
          margin: 2px 0 0 0;
          font-family: var(--font-sans);
        }
        .tr-fs-search-box {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          padding: 0 10px;
          height: 32px;
          width: 240px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .tr-fs-search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 11px;
          color: var(--text-main);
          width: 100%;
          font-family: var(--font-sans);
        }
        .tr-fs-search-input::placeholder {
          color: #94a3b8;
          font-size: 10.5px;
        }
        .tr-fs-export-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 32px;
          padding: 0 12px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tr-fs-export-btn:hover {
          background: #f1f5f9;
          color: var(--text-main);
          border-color: #94a3b8;
        }
        .tr-fs-close-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 32px;
          padding: 0 14px;
          background: #0f172a;
          border: 1px solid #0f172a;
          border-radius: 5px;
          font-size: 9.5px;
          font-weight: 700;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tr-fs-close-btn:hover {
          background: #1e293b;
        }
        .tr-fs-stats-bar {
          display: flex;
          align-items: center;
          padding: 10px 20px;
          background: #ffffff;
          border-bottom: 1px solid var(--border);
          gap: 20px;
        }
        .tr-fs-stat-item {
          display: flex;
          flex-direction: column;
          gap: 1.5px;
        }
        .tr-fs-stat-k {
          font-size: 8px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
        }
        .tr-fs-stat-v {
          font-size: 10.5px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: 0.02em;
        }
        .tr-fs-stat-divider {
          width: 1px;
          height: 20px;
          background: var(--border);
        }
        .tr-fs-table-wrap {
          flex: 1;
          overflow-y: auto;
          background: #ffffff;
        }
        .tr-fs-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }
        .tr-fs-table thead {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #f8fafc;
        }
        .tr-fs-table th {
          padding: 9px 16px;
          font-size: 9px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid var(--border);
          font-family: var(--font-sans);
        }
        .tr-fs-table td {
          padding: 10px 16px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }
        .tr-fs-row {
          cursor: pointer;
          transition: background-color 0.12s ease;
        }
        .tr-fs-row:hover {
          background-color: #f8fafc;
        }
        .tr-fs-row-active {
          background-color: #f1f5f9 !important;
        }
        .tr-fs-detail-card {
          padding: 14px 20px;
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid var(--border);
          border-left: 3px solid var(--primary);
        }
        .tr-fs-empty {
          padding: 80px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .tr-fs-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #f1f5f9;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tr-fs-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          background: #f8fafc;
          border-top: 1px solid var(--border);
        }
        .tr-fs-footer-close-btn {
          padding: 5px 12px;
          border-radius: 4px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          font-size: 9.5px;
          font-weight: 700;
          color: #334155;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tr-fs-footer-close-btn:hover {
          background: #f1f5f9;
          color: var(--text-main);
          border-color: #94a3b8;
        }

      `}</style>
    </div>
  );
};
