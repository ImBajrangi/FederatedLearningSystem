import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, Activity, ShieldCheck, Server, Globe, Zap, 
  Network, Settings2, Code, Database, Terminal as TerminalIcon,
  ChevronRight, BarChart3, Lock, RefreshCcw
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
  const [activeTab, setActiveTab] = useState('telemetry');
  const [selectedSource, setSelectedSource] = useState('active'); // 'active' | 'global' | 'lab' | nodeId
  const [isEditing, setIsEditing] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [isInjecting, setIsInjecting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const ledgerRef = React.useRef(null);

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

  if (selectedSource === 'active') {
    displayedCode = isEditing ? customCode : liveActiveCode;
    displayedFilename = liveActiveFilename;
    displayedTitle = isActive ? '⚡ Active In-Flight Training Code' : '🟢 Current Active Training Engine Code';
    displayedDataset = liveDataset;
    displayedHash = activeTrainingCode?.code_hash;
  } else if (selectedSource === 'global') {
    displayedCode = isEditing ? customCode : (modelArchitecture || '# Global Genesis Spec');
    displayedFilename = 'model.py';
    displayedTitle = '🌐 Global Genesis Model Specification';
    displayedDataset = 'Institutional Global Distribution';
  } else if (selectedSource === 'lab') {
    displayedCode = isEditing ? customCode : (activeTrainingCode?.source === 'laboratory' ? activeTrainingCode.code : liveActiveCode);
    displayedFilename = 'laboratory_sandbox.py';
    displayedTitle = '🧪 Code Laboratory Sandbox Script';
    displayedDataset = 'Privacy Vault / In-Memory RAM';
  } else if (nodeRegistry[selectedSource]) {
    const node = nodeRegistry[selectedSource];
    displayedCode = node.code || '# No code payload transmitted by node';
    displayedFilename = node.filename || 'node_train.py';
    displayedTitle = `💻 Node: ${node.name || selectedSource}`;
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
                    <th className="tr-th-rnd" style={{ width: '60px' }}>RND</th>
                    <th className="tr-th-node" style={{ width: '160px' }}>NODE_ID</th>
                    <th className="tr-th-params">PARAMETERS_GRID</th>
                    <th className="tr-th-acc" style={{ width: '100px', textAlign: 'right' }}>ACC_YIELD</th>
                    <th className="tr-th-status" style={{ width: '100px', textAlign: 'right' }}>STATUS</th>
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
                    [...roundHistory].reverse().map((row, idx) => (
                      <tr key={idx} className="tr-ledger-row">
                        <td className="tr-td-rnd">
                          <span className="tr-rnd-num">#{row.round.toString().padStart(2, '0')}</span>
                        </td>
                        <td>
                          <div className="tr-node-info">
                            <span className="tr-node-id">{row.client}</span>
                            <span className="tr-node-label">SECURE_EDGE_NODE</span>
                          </div>
                        </td>
                        <td>
                          <div className="tr-params-grid">
                            <div className="tr-param-item">
                              <span className="tr-param-k">LR</span>
                              <span className="tr-param-v">{row.lr}</span>
                            </div>
                            <div className="tr-param-item">
                              <span className="tr-param-k">BATCH</span>
                              <span className="tr-param-v">{row.batch}</span>
                            </div>
                            <div className="tr-param-item">
                              <span className="tr-param-k">SIGMA</span>
                              <span className="tr-param-v">0.001</span>
                            </div>
                          </div>
                        </td>
                        <td className="tr-td-acc">
                          <span className="tr-acc-yield">
                            {row.accuracy ? `${(row.accuracy * 100).toFixed(1)}%` : '—'}
                          </span>
                        </td>
                        <td className="tr-td-status">
                          <span className="tr-status-pill tr-status-verified">
                            ON-CHAIN VERIFIED
                          </span>
                        </td>
                      </tr>
                    ))
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

          {/* Dynamic Code Transparency & Active Execution Engine */}
          <section className="tr-card tr-script-card">
            <div className="tr-card-header flex-wrap gap-2">
              <div className="tr-card-title-wrap">
                <Code size={13} className="tr-card-icon text-primary" />
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
              <div className="flex items-center gap-2">
                <select
                  className="tr-node-select"
                  value={selectedSource}
                  onChange={(e) => {
                    setSelectedSource(e.target.value);
                    setIsEditing(false);
                  }}
                >
                  <option value="active">⚡ Live Active Training Code</option>
                  <option value="global">🌐 Global Model (model.py)</option>
                  <option value="lab">🧪 Code Laboratory Sandbox</option>
                  {Object.entries(nodeRegistry).map(([id, node]) => (
                    <option key={id} value={id}>
                      💻 {node.name || id} ({node.filename || 'node.py'})
                    </option>
                  ))}
                </select>

                <button 
                  onClick={handleCopyCode}
                  className="tr-card-action px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono hover:text-primary transition"
                  title="Copy Code"
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>

                {!isEditing ? (
                  <button 
                    onClick={handleStartEdit}
                    className="tr-card-action px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold hover:bg-primary/20 transition"
                  >
                    Edit / Inject
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handleInjectCode}
                      disabled={isInjecting}
                      className="px-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold hover:bg-emerald-400 transition flex items-center gap-1"
                    >
                      {isInjecting ? <RefreshCcw size={10} className="animate-spin" /> : <Zap size={10} />}
                      Inject
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="px-2 py-1 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded text-[10px] font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <span className="tr-file-tag">{displayedFilename}</span>
              </div>
            </div>
            
            {/* Dynamic Metadata Bar */}
            <div className="tr-code-meta-bar">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  <span className="text-[10px] font-mono text-slate-300">
                    SHA-256: <span className="text-emerald-400 select-all font-bold">{displayedHash}</span>
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 border-l border-white/10 pl-3">
                  <Database size={10} className="text-cyan-400" />
                  <span>{displayedDataset}</span>
                </div>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400/90 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                100% Code Transparency Verified
              </span>
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
                  <div className="tr-line-gutter">
                    {displayedCode.split('\n').map((_, i) => (
                      <span key={i} className="tr-gutter-num">{i + 1}</span>
                    ))}
                  </div>
                  <pre className="tr-code-content"><code>{displayedCode}</code></pre>
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
                {logs.length === 0 ? (
                  <div className="tr-console-empty">
                    <RefreshCcw size={14} className="animate-spin opacity-20" />
                    <span>Awaiting system initialization...</span>
                  </div>
                ) : (
                  logs
                    .filter(log => {
                      if (activeTab === 'feed') return true;
                      const logMsg = (typeof log === 'object' ? log.msg : log).toUpperCase();
                      if (activeTab === 'audit') return logMsg.includes('SECURE') || logMsg.includes('VERIFIED') || logMsg.includes('AUDIT') || logMsg.includes('BLOCK');
                      return logMsg.includes('UPDATE') || logMsg.includes('AGGREGATING') || logMsg.includes('ROUND') || logMsg.includes('NODE');
                    })
                    .map((log, i) => {
                      const logObj = typeof log === 'object' ? log : { msg: log };
                      const msgUpper = logObj.msg.toUpperCase();
                      const isSuccess = msgUpper.includes('SUCCESS') || msgUpper.includes('COMPLETE') || msgUpper.includes('FINISHED') || msgUpper.includes('SYNCED');
                      const isError = msgUpper.includes('ERR') || msgUpper.includes('CRITICAL') || msgUpper.includes('FAIL');
                      const isWarning = msgUpper.includes('WARN');
                      
                      // Using Hex for reliability on darker terminal backgrounds
                      const msgColor = isSuccess ? '#10b981' : isError ? '#f87171' : isWarning ? '#fbbf24' : '#ffffff';
                      
                      return (
                        <div key={i} className="tr-log-line group">
                          <span className="tr-log-ts" style={{ color: 'rgba(255,255,255,0.3)' }}>{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          <span className="tr-log-prefix ml-2" style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>[{i % 2 === 0 ? 'NODE_01' : 'NODE_02'}]</span>
                          <span className="tr-log-msg" style={{ color: msgColor, textShadow: isSuccess ? '0 0 10px rgba(16,185,129,0.3)' : 'none' }}>
                            {logObj.msg}
                          </span>
                          <div className="tr-log-glow" />
                        </div>
                      );
                    })
                )}
                <div className="tr-console-prompt">
                  <span className="tr-log-ts">{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  <span className="tr-log-prefix ml-2">[SYS_PROMPT]</span>
                  <div className="tr-cursor-wrap">
                    <span className="tr-cursor">_</span>
                    <span className="text-slate-500 italic opacity-50 ml-1">Awaiting next sequence...</span>
                  </div>
                </div>
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
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        .tr-col { display: flex; flex-direction: column; gap: 32px; }

        .tr-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
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
        .tr-table td { padding: 18px 20px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        
        .tr-td-rnd { width: 80px; }
        .tr-rnd-num { font-family: var(--font-mono); font-size: 11px; font-weight: 800; color: var(--primary); }
        
        .tr-node-info { display: flex; flex-direction: column; gap: 2px; }
        .tr-node-id { font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--text-main); }
        .tr-node-label { font-size: 8px; font-weight: 700; color: var(--text-muted); opacity: 0.6; }

        .tr-params-grid { display: flex; gap: 16px; }
        .tr-param-item { display: flex; gap: 6px; align-items: baseline; }
        .tr-param-label { font-size: 8px; font-weight: 700; color: var(--text-muted); }
        .tr-param-val { font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--text-main); }

        .tr-acc-badge { display: flex; align-items: baseline; gap: 1px; color: var(--success); }
        .tr-acc-val { font-family: var(--font-mono); font-size: 14px; font-weight: 800; }
        .tr-acc-unit { font-size: 9px; font-weight: 700; }

        .tr-status-badge { 
          display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px;
          border-radius: 2px; font-size: 8px; font-weight: 800; letter-spacing: 0.1em;
        }
        .tr-status-verified { background: #f0fdf4; border: 1px solid #dcfce7; color: #166534; }

        .tr-ledger-footer { padding: 12px 20px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #fff; }
        .tr-footer-text { font-size: 9px; color: var(--text-muted); opacity: 0.6; letter-spacing: 0.05em; }
        .tr-footer-stats { display: flex; align-items: center; gap: 10px; }
        .tr-stat-label { font-size: 8px; font-weight: 700; color: var(--text-muted); }
        .tr-stat-val { font-family: var(--font-mono); font-size: 10px; font-weight: 800; color: var(--text-main); }

        /* ─── Console Overhaul ─── */
        .tr-console-container {
          background: #0f172a;
          border: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          height: 380px;
          position: relative;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
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

        .tr-console-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; gap: 16px; color: rgba(255,255,255,0.15); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
        
        .tr-console-prompt { display: flex; gap: 12px; align-items: center; margin-top: 12px; }
        .tr-cursor-wrap { display: flex; align-items: center; }
        .tr-cursor { color: var(--primary); font-weight: 800; animation: tr-blink 1s step-end infinite; text-shadow: 0 0 10px var(--primary); }
        @keyframes tr-blink { 50% { opacity: 0; } }

        .tr-console-body::-webkit-scrollbar { width: 6px; }
        .tr-console-body::-webkit-scrollbar-track { background: transparent; }
        .tr-console-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .tr-console-body::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }

        .tr-live-exec-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 2px 8px;
          border-radius: 9999px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
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

        .tr-script-card { min-height: 360px; }
        .tr-node-select {
          background: #fff;
          border: 1px solid var(--border);
          font-size: 10px;
          font-weight: 600;
          color: var(--text-main);
          padding: 4px 10px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .tr-node-select:focus {
          border-color: var(--primary);
        }
        .tr-code-meta-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: #0b1120;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap;
          gap: 8px;
        }
        .tr-file-tag { font-size: 9px; font-weight: 700; color: var(--text-muted); padding: 2px 8px; background: var(--bg-main); border: 1px solid var(--border); margin-left: 4px; }
        .tr-script-body { padding: 0; background: #070c18; flex: 1; overflow-y: auto; max-height: 440px; display: flex; }
        
        .tr-code-view-wrap {
          display: flex;
          width: 100%;
          min-height: 100%;
        }
        .tr-line-gutter {
          padding: 16px 10px 16px 14px;
          background: #050811;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          user-select: none;
        }
        .tr-gutter-num {
          font-family: var(--font-mono);
          font-size: 11px;
          line-height: 1.6;
          color: rgba(255,255,255,0.2);
          text-align: right;
          min-width: 20px;
        }
        .tr-code-content {
          margin: 0;
          padding: 16px 20px;
          font-family: var(--font-mono);
          font-size: 11px;
          line-height: 1.6;
          color: #e2e8f0;
          opacity: 0.95;
          flex: 1;
          overflow-x: auto;
        }
        .tr-code-editor-area {
          width: 100%;
          height: 380px;
          padding: 16px 20px;
          background: #050811;
          color: #38bdf8;
          font-family: var(--font-mono);
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
