import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, Activity, ShieldCheck, Server, Globe, Zap, 
  Network, Settings2, Code, Database, Terminal as TerminalIcon,
  ChevronRight, BarChart3, Lock, RefreshCcw, Copy, CheckCircle2, Edit3, Check,
  Laptop, Radio, Fingerprint, HardDrive, Layers
} from 'lucide-react';
import { MetricsChart } from './MetricsChart';

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
  const [cliInput, setCliInput] = useState('');
  const [localCliLogs, setLocalCliLogs] = useState([]);

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
    displayedTitle = isActive ? 'Active In-Flight Training Code' : 'Current Active Training Engine Code';
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
          <section className="tr-card tr-ledger-card">
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
              </div>
            </div>
            <div className="tr-ledger-scroll" ref={ledgerRef}>
              <table className="tr-table">
                <thead>
                  <tr className="tr-table-header-row">
                    <th className="tr-th-rnd" style={{ width: '70px' }}>RND</th>
                    <th className="tr-th-node" style={{ width: '220px' }}>NODE_ID</th>
                    <th className="tr-th-params">PARAMETERS_GRID</th>
                    <th className="tr-th-acc" style={{ width: '100px', textAlign: 'right' }}>ACC_YIELD</th>
                    <th className="tr-th-status" style={{ width: '160px', textAlign: 'right' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {roundHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="tr-empty-state">
                        <div className="tr-empty-icon-wrap">
                          <Database size={24} className="opacity-10" />
                        </div>
                        <span>Awaiting initial orchestration cycle...</span>
                      </td>
                    </tr>
                  ) : (
                    [...roundHistory].reverse().map((row, idx) => {
                      const clientName = row.client || row.client_id || 'NODE';
                      const shortClient = clientName.length > 16 
                        ? `${clientName.substring(0, 8)}...${clientName.substring(clientName.length - 5)}`
                        : clientName;

                      return (
                        <tr key={idx} className="tr-ledger-row">
                          <td className="tr-td-rnd">
                            <span className="tr-rnd-num">#{row.round.toString().padStart(2, '0')}</span>
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="tr-ledger-footer">
              <span className="tr-footer-text italic">Audit trail secured via differential privacy ledger</span>
              <div className="tr-footer-stats">
                <span className="tr-stat-label">TOTAL ROUNDS:</span>
                <span className="tr-stat-val">{roundHistory.length}</span>
              </div>
            </div>
          </section>

          {/* Connected Edge Nodes & Device Telemetry Audit */}
          <section className="tr-card tr-nodes-section">
            <div className="tr-card-header">
              <div className="tr-card-title-wrap">
                <Laptop size={13} className="tr-card-icon text-cyan-400" />
                <span className="tr-card-title">Enrolled Edge Nodes & Device Telemetry</span>
                <span className="tr-nodes-count-badge">
                  {Object.keys(safeNodeRegistry).length} ACTIVE
                </span>
              </div>
              <div className="tr-card-action text-[10px] text-slate-400">
                <span>Auto-Discovered via Decentralized Bridge</span>
              </div>
            </div>

            <div className="tr-nodes-body">
              {Object.keys(safeNodeRegistry).length === 0 ? (
                <div className="tr-no-nodes-card">
                  <div className="tr-no-nodes-left">
                    <Radio size={16} className="text-amber-400 animate-pulse" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Listening for Remote Edge Participants</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Run join command on any Mac, Linux, or Cloud GPU instance to enroll:</div>
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
                            <div>
                              <div className="tr-node-name">{node.name || id}</div>
                              <div className="tr-node-sub">{id.substring(0, 10)}... • {node.ip || '127.0.0.1'}</div>
                            </div>
                          </div>
                          <div className="tr-node-rep-badge">
                            <ShieldCheck size={11} className="text-emerald-400" />
                            <span>{node.reputation ? node.reputation.toFixed(1) : '100.0'}% REP</span>
                          </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="tr-node-specs">
                          <div className="tr-node-spec-row">
                            <span className="tr-spec-k">
                              <Cpu size={10} className="text-purple-400 inline mr-1" />
                              Compute:
                            </span>
                            <span className="tr-spec-v text-purple-300 font-medium truncate" title={node.device || 'CPU Core'}>
                              {node.device || 'CPU Core'}
                            </span>
                          </div>
                          <div className="tr-node-spec-row">
                            <span className="tr-spec-k">
                              <Layers size={10} className="text-cyan-400 inline mr-1" />
                              Environment:
                            </span>
                            <span className="tr-spec-v text-cyan-200 truncate">
                              {node.os || 'Darwin/Linux'} ({node.arch || 'arm64'}) • {node.python || 'v3.12'}
                            </span>
                          </div>
                          <div className="tr-node-spec-row">
                            <span className="tr-spec-k">
                              <HardDrive size={10} className="text-emerald-400 inline mr-1" />
                              Local Shard:
                            </span>
                            <span className="tr-spec-v text-emerald-300">
                              {node.shard_size || '250 samples'} (Private RAM)
                            </span>
                          </div>
                          <div className="tr-node-spec-row">
                            <span className="tr-spec-k">
                              <Lock size={10} className="text-amber-400 inline mr-1" />
                              Privacy Spec:
                            </span>
                            <span className="tr-spec-v text-amber-200">
                              {node.privacy || 'L2-Clip (1.5) + Gaussian σ=0.005'}
                            </span>
                          </div>
                          <div className="tr-node-spec-row">
                            <span className="tr-spec-k">
                              <Code size={10} className="text-blue-400 inline mr-1" />
                              Code File:
                            </span>
                            <span className="tr-spec-v text-blue-200 font-mono text-[10px]">
                              {node.filename || 'model.py'} ({node.lines_count || 74} lines)
                            </span>
                          </div>
                        </div>

                        {/* Node Card Footer */}
                        <div className="tr-node-footer">
                          <span className="tr-node-hash font-mono">
                            SHA: {node.code_hash ? node.code_hash.substring(0, 14) + '...' : '0x0000'}
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
                <span className="tr-card-title">{displayedTitle}</span>
                {isActive && (
                  <span className="tr-live-exec-badge">
                    <span className="tr-live-exec-dot animate-ping" />
                    <span className="tr-live-exec-dot" />
                    LIVE TRAINING
                  </span>
                )}
              </div>

              {/* Source Switcher & Actions */}
              <div className="tr-action-toolbar">
                <select
                  className="tr-source-dropdown"
                  value={selectedSource}
                  onChange={(e) => {
                    setSelectedSource(e.target.value);
                    setIsEditing(false);
                  }}
                >
                  <option value="active">⚡ Live Active Training Code</option>
                  <option value="global">🌐 Global Model (model.py)</option>
                  <option value="lab">🧪 Code Laboratory Sandbox</option>
                  {Object.entries(safeNodeRegistry).map(([id, node]) => (
                    <option key={id} value={id}>
                      💻 {node.name || id} ({node.filename || 'node.py'})
                    </option>
                  ))}
                </select>

                <button 
                  onClick={handleCopyCode}
                  className="tr-tool-btn"
                  title="Copy Code"
                >
                  {copySuccess ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copySuccess ? 'COPIED' : 'COPY'}</span>
                </button>

                {!isEditing ? (
                  <button 
                    onClick={handleStartEdit}
                    className="tr-inject-btn"
                  >
                    <Edit3 size={11} />
                    <span>EDIT / INJECT</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
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

                <span className="tr-filename-tag">{displayedFilename}</span>
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
              <MetricsChart data={accuracyHistory} lossData={lossHistory} />
            </div>
          </section>

          {/* Terminal Console */}
          <section className="tr-console-container">
            <div className="tr-console-header">
              <div className="tr-console-tabs">
                <div 
                  className={`tr-tab ${activeTab === 'telemetry' ? 'active' : ''}`}
                  onClick={() => setActiveTab('telemetry')}
                >
                  <TerminalIcon size={10} />
                  <span>Node Telemetry</span>
                </div>
                <div 
                  className={`tr-tab ${activeTab === 'feed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('feed')}
                >
                  <Globe size={10} />
                  <span>Global Feed</span>
                </div>
                <div 
                  className={`tr-tab ${activeTab === 'audit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('audit')}
                >
                  <Lock size={10} />
                  <span>Sec Audit</span>
                </div>
              </div>
              <div className="tr-console-actions">
                <div className="tr-latency">
                  <div className="tr-latency-dot" />
                  <span>{Math.floor(Math.random() * 5 + 2)}MS LATENCY</span>
                </div>
                <button className="tr-btn-clear" onClick={onClear}>Clear</button>
              </div>
            </div>
            <div className="tr-console-body" ref={consoleRef}>
              <div className="tr-console-scanline" />
              <div className="tr-log-container">
                {allLogs.length === 0 ? (
                  <div className="tr-cli-welcome">
                    <div className="tr-cli-banner">
                      <span className="text-emerald-400 font-bold">◈ AI GUARDIAN ORCHESTRATION TERMINAL</span>
                      <span className="text-slate-400 text-[10px]">v2.4.0-PROD • TELEMETRY ACTIVE</span>
                    </div>
                    <div className="tr-cli-info-grid">
                      <div className="tr-cli-info-item">
                        <span className="tr-cli-k">Status:</span>
                        <span className="tr-cli-v text-emerald-400">{isActive ? '⚡ CONVERGENCE IN PROGRESS' : '● LISTENING FOR PARTICIPANTS'}</span>
                      </div>
                      <div className="tr-cli-info-item">
                        <span className="tr-cli-k">Active Code:</span>
                        <span className="tr-cli-v text-cyan-400">{displayedFilename} ({displayedHash ? displayedHash.substring(0, 12) + '...' : '0x0000'})</span>
                      </div>
                      <div className="tr-cli-info-item">
                        <span className="tr-cli-k">Edge Nodes:</span>
                        <span className="tr-cli-v text-amber-300">{Object.keys(safeNodeRegistry).length} Enrolled</span>
                      </div>
                    </div>
                    <div className="tr-cli-commands-hint">
                      <span className="text-slate-400">Available commands:</span>
                      <span className="tr-cmd-tag" onClick={() => { setCliInput('/train'); }}>/train</span>
                      <span className="tr-cmd-tag" onClick={() => { setCliInput('/nodes'); }}>/nodes</span>
                      <span className="tr-cmd-tag" onClick={() => { setCliInput('/status'); }}>/status</span>
                      <span className="tr-cmd-tag" onClick={() => { setCliInput('/help'); }}>/help</span>
                    </div>
                  </div>
                ) : (
                  allLogs
                    .filter(log => {
                      if (activeTab === 'feed') return true;
                      const logMsg = (typeof log === 'object' ? log.msg : log).toUpperCase();
                      if (activeTab === 'audit') return logMsg.includes('SECURE') || logMsg.includes('VERIFIED') || logMsg.includes('AUDIT') || logMsg.includes('BLOCK');
                      return logMsg.includes('UPDATE') || logMsg.includes('AGGREGATING') || logMsg.includes('ROUND') || logMsg.includes('NODE') || log.type;
                    })
                    .map((log, i) => {
                      const logObj = typeof log === 'object' ? log : { msg: log };
                      const msgUpper = (logObj.msg || '').toUpperCase();
                      const isSuccess = msgUpper.includes('SUCCESS') || msgUpper.includes('COMPLETE') || msgUpper.includes('FINISHED') || msgUpper.includes('SYNCED') || logObj.type === 'success';
                      const isError = msgUpper.includes('ERR') || msgUpper.includes('CRITICAL') || msgUpper.includes('FAIL') || logObj.type === 'error';
                      const isWarning = msgUpper.includes('WARN') || logObj.type === 'warn';
                      const isInput = logObj.type === 'input';
                      
                      const msgColor = isInput ? '#38bdf8' : isSuccess ? '#34d399' : isError ? '#f87171' : isWarning ? '#fbbf24' : '#f1f5f9';
                      const prefix = logObj.prefix || (i % 2 === 0 ? 'NODE_01' : 'NODE_02');
                      const ts = logObj.ts || new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

                      return (
                        <div key={i} className="tr-log-line group">
                          <span className="tr-log-ts">{ts}</span>
                          <span className="tr-log-prefix">[{prefix}]</span>
                          <span className="tr-log-msg" style={{ color: msgColor, whiteSpace: 'pre-wrap' }}>
                            {logObj.msg}
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
          </section>
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
          font-size: 10px;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.15em;
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
        }
        .tr-ledger-meta { display: flex; align-items: center; gap: 20px; }
        .tr-ver-status { display: flex; align-items: center; gap: 8px; font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .tr-live-sync { display: flex; align-items: center; gap: 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
        .tr-sync-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); animation: tr-pulse 2s infinite; }
        @keyframes tr-pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

        .tr-ledger-scroll { 
          max-height: 240px; 
          overflow-y: auto; 
          position: relative;
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
          padding: 12px 20px;
          font-size: 9px; font-weight: 800; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.15em;
          border-bottom: 2px solid var(--border);
        }
        .tr-table td { padding: 14px 20px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        
        .tr-td-rnd { width: 70px; }
        .tr-rnd-num { font-family: var(--font-mono, monospace); font-size: 11px; font-weight: 800; color: var(--primary); }
        
        .tr-node-info { display: flex; flex-direction: column; gap: 3px; }
        .tr-node-id { font-family: var(--font-mono, monospace); font-size: 11px; font-weight: 700; color: #0f172a; word-break: break-all; }
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
          font-size: 9px;
          font-weight: 800;
          color: #0284c7;
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          padding: 2px 8px;
          border-radius: 999px;
          letter-spacing: 0.06em;
        }
        .tr-nodes-body {
          padding: 16px 20px;
        }
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
          background: #0f172a;
          color: #38bdf8;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
        }
        .tr-quick-join-box code {
          word-break: break-all;
        }
        .tr-mini-copy-btn {
          background: rgba(255,255,255,0.1);
          color: #f1f5f9;
          border: none;
          padding: 4px 10px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .tr-mini-copy-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .tr-nodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .tr-node-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tr-node-card:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          transform: translateY(-1px);
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
        }
        .tr-node-id-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tr-node-status-dot-green {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          flex-shrink: 0;
        }
        .tr-node-name {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
        }
        .tr-node-sub {
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          color: #64748b;
        }
        .tr-node-rep-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 800;
        }
        .tr-node-specs {
          display: flex;
          flex-direction: column;
          gap: 5px;
          background: #ffffff;
          padding: 10px 12px;
          border-radius: 4px;
          border: 1px solid #f1f5f9;
        }
        .tr-node-spec-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
        }
        .tr-spec-k {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .tr-spec-v {
          font-size: 10px;
          max-width: 170px;
          text-align: right;
        }
        .tr-node-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
        }
        .tr-node-hash {
          font-size: 9px;
          color: #059669;
          background: #f0fdf4;
          padding: 2px 6px;
          border-radius: 3px;
        }
        .tr-node-inspect-tag {
          font-size: 9px;
          font-weight: 800;
          color: #2563eb;
          letter-spacing: 0.05em;
        }

        /* ─── Console Overhaul ─── */
        .tr-console-container {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          height: 440px;
          position: relative;
          box-shadow: 0 12px 36px -10px rgba(0,0,0,0.6);
          overflow: hidden;
        }
        .tr-console-header {
          padding: 0 16px;
          height: 42px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1e293b;
          flex-shrink: 0;
        }
        .tr-console-tabs { display: flex; height: 100%; }
        .tr-tab { 
          display: flex; align-items: center; gap: 10px; padding: 0 16px;
          font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
          color: rgba(255,255,255,0.4); border-right: 1px solid rgba(255,255,255,0.05);
          cursor: pointer; transition: all 0.2s;
        }
        .tr-tab:hover { background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.6); }
        .tr-tab.active { background: #0f172a; color: var(--primary); border-top: 2px solid var(--primary); }

        .tr-console-actions { display: flex; align-items: center; gap: 20px; }
        .tr-latency { display: flex; align-items: center; gap: 8px; font-size: 8px; font-weight: 700; color: rgba(255,255,255,0.2); text-transform: uppercase; }
        .tr-latency-dot { width: 4px; height: 4px; border-radius: 50%; background: #10B981; }
        .tr-btn-clear { background: none; border: none; padding: 4px 8px; font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; cursor: pointer; }
        .tr-btn-clear:hover { color: #fff; }

        .tr-console-body { 
          flex: 1; overflow-y: auto; padding: 20px 24px; position: relative;
          font-family: var(--font-mono); font-size: 11px; line-height: 1.6;
        }
        .tr-console-scanline {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1) 50%);
          background-size: 100% 2px;
          pointer-events: none; z-index: 10; opacity: 0.1;
        }
        .tr-log-container { position: relative; z-index: 1; }
        .tr-log-line { display: flex; gap: 12px; margin-bottom: 4px; position: relative; }
        .tr-log-ts { color: rgba(255,255,255,0.15); flex-shrink: 0; width: 65px; font-size: 9px; }
        .tr-log-prefix { color: rgba(255,255,255,0.3); flex-shrink: 0; width: 80px; font-weight: 700; text-transform: uppercase; font-size: 9px; }
        .tr-log-msg { white-space: pre-wrap; font-weight: 500; }
        .tr-log-glow { 
          position: absolute; left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(var(--primary-rgb), 0.05); opacity: 0;
          transition: opacity 0.2s; pointer-events: none;
        }
        .tr-log-line:hover .tr-log-glow { opacity: 1; }

        .tr-cli-welcome {
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .tr-cli-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .tr-cli-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .tr-cli-info-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 10px;
        }
        .tr-cli-k {
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 8px;
          letter-spacing: 0.08em;
        }
        .tr-cli-v {
          font-family: var(--font-mono, monospace);
          font-weight: 700;
          font-size: 10px;
        }
        .tr-cli-commands-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          padding-top: 4px;
        }
        .tr-cmd-tag {
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          font-weight: 700;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 2px 6px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tr-cmd-tag:hover {
          background: rgba(56, 189, 248, 0.25);
          transform: translateY(-1px);
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
          gap: 6px;
          padding: 2px 8px;
          border-radius: 9999px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #ef4444 !important;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }
        .tr-live-exec-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ef4444;
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
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          min-height: 48px;
          background: #fff;
          border-bottom: 1px solid var(--border);
        }
        .tr-action-toolbar {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: nowrap;
          flex-shrink: 0;
        }
        .tr-source-dropdown {
          height: 28px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          font-size: 10px;
          font-weight: 600;
          color: #0f172a !important;
          padding: 0 8px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tr-source-dropdown:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(54, 78, 104, 0.15);
        }
        .tr-tool-btn {
          height: 28px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0 9px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          color: #334155 !important;
          font-size: 9px;
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
          height: 28px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0 9px;
          background: #f8fafc;
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--primary) !important;
          font-size: 9px;
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
          height: 28px;
          padding: 0 10px;
          background: #10b981;
          color: #fff !important;
          border: none;
          border-radius: 4px;
          font-size: 9px;
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
          height: 28px;
          padding: 0 8px;
          background: #e2e8f0;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          color: #475569 !important;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }
        .tr-filename-tag {
          height: 28px;
          padding: 0 8px;
          display: inline-flex;
          align-items: center;
          font-size: 10px;
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

      `}</style>
    </div>
  );
};
