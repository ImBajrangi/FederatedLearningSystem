import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap, Globe, Lock, Cpu, Server, TrendingUp, AlertCircle, Terminal, Download, Box, Award, FileText, Copy, Check, CheckCircle2 } from 'lucide-react';
import { MetricsChart } from './MetricsChart';
import { BlockchainRibbon } from './BlockchainExplorer';
import { API_BASE_URL } from '../hooks/useSecureFederated';

export const Dashboard = ({
  accuracyHistory = [],
  isConnected,
  isActive,
  status,
  startSimulation,
  clearSimulation,
  blockchain = [],
  clients = [],
  nodeRegistry = {},
  rejectedCount = 0,
  round = 0,
  distributedStatus = {},
  startDistributedSession = () => {},
  stopDistributedSession = () => {}
}) => {
  const [copyCloudSuccess, setCopyCloudSuccess] = useState(false);
  const [copyLocalSuccess, setCopyLocalSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [cliTab, setCliTab] = useState('universal');

  const handleDownloadJoinScript = async () => {
    try {
      const res = await fetch('/join.py');
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'join.py';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (e) {
      window.open('https://mdark4025-cybronites.hf.space/join.py', '_blank');
    }
  };

  const currentAccuracy = accuracyHistory.length > 0
    ? (accuracyHistory[accuracyHistory.length - 1] * 100).toFixed(2)
    : "0.00";

  return (
    <div className="dash-root section-fade">
      {/* ─── Header Section ─── */}
      <header className="dash-header">
        <div className="dash-header-info">
          <h2 className="dash-title">Global Orchestration Dashboard</h2>
          <div className="dash-meta">
            <div className="dash-meta-item">
              <span className="dash-meta-label">NODE_ID:</span>
              <span className="dash-meta-value">0x88F2_SECURE</span>
            </div>
            <div className="dash-meta-divider" />
            <div className="dash-meta-item">
              <span className="dash-meta-label">MODE:</span>
              <span className="dash-meta-value dash-meta-value-primary">Institutional Production</span>
            </div>
          </div>
        </div>

        <div className="dash-header-controls">
          <div 
            className="dash-stat-group border-r border-border/50"
            data-tooltip="Aggregated global test accuracy evaluated across all distributed shards"
            data-tooltip-pos="bottom"
          >
            <span className="dash-stat-label">Convergence</span>
            <div className="dash-stat-value-wrap">
              <span className="dash-stat-value text-accent-glow font-serif">{currentAccuracy}%</span>
              <div className={`dash-status-dot ${isConnected && isActive ? 'dash-status-active' : ''} shadow-inner`}>
                <Activity size={10} />
              </div>
            </div>
          </div>

          <div className="dash-actions">
            <button
              onClick={startSimulation}
              disabled={isActive || !isConnected}
              className={`dash-btn-primary ${(!isConnected || isActive) ? 'dash-btn-disabled' : ''}`}
              data-tooltip="Initiate distributed gradient aggregation round across enrolled nodes"
              data-tooltip-pos="bottom"
            >
              <Zap size={12} fill="currentColor" />
              <span>{status === 'IDLE' ? 'Connect Sessions' : status === 'FINISHED' ? 'Report Complete' : 'Synchronized'}</span>
            </button>
            <button 
              onClick={clearSimulation} 
              className="dash-btn-icon"
              data-tooltip="Reset telemetry and convergence charts"
              data-tooltip-pos="bottom"
            >
              <TrendingUp size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Top Metrics Grid ─── */}
      <div className="dash-grid">
        {/* Main Chart */}
        <div className="dash-card dash-card-main card-shadow-premium bg-white border-border/40">
          <div 
            className="dash-card-header bg-slate-50/50 backdrop-blur-sm"
            data-tooltip="Real-time multi-epoch accuracy convergence graph"
          >
            <div className="dash-card-title-wrap">
              <Activity size={14} className="text-accent" />
              <span className="dash-card-title">Real-Time Model Convergence</span>
            </div>
            <div className="dash-card-legend">
              <div className="dash-legend-item">
                <div className="dash-legend-color" />
                <span>Converged Accuracy</span>
              </div>
            </div>
          </div>
          <div className="dash-card-body dash-chart-container">
            <MetricsChart data={accuracyHistory} isActive={isActive} />
          </div>
        </div>

        {/* Right Sidebar Stats */}
        <div className="dash-sidebar-stats">
          {/* Security Policy */}
          <div className="dash-card dash-card-accent">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-7 h-7 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={16} />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Protection</span>
            </div>
            <h3 className="dash-accent-title">Security Policy Active</h3>
            <p className="dash-accent-text">Differential privacy calibration active. Zero raw telemetry exposure via secure gRPC tunnel.</p>
          </div>

          {/* Network Resilience */}
          <div className="dash-card dash-resilience-card">
            <div className="dash-card-header">
              <div className="flex items-center gap-2">
                <Activity size={13} className="dash-card-icon" />
                <span className="dash-card-title">Network Resilience</span>
              </div>
            </div>
            <div className="dash-card-body dash-metrics-list">
              <div className="dash-metric-row" data-tooltip="Active client devices and private datasets connected to the network">
                <span className="dash-metric-label">Active Shards</span>
                <span className="dash-metric-value">{clients.filter(c => c.status === 'ACTIVE' || c.status === 'BUSY').length} / 8</span>
              </div>
              <div className="dash-metric-row" data-tooltip="Total completed training rounds across all devices">
                <span className="dash-metric-label">Rounds Synced</span>
                <span className="dash-metric-value">{round}</span>
              </div>
              <div className="dash-metric-row" data-tooltip="Security alerts: Any corrupted or invalid updates blocked automatically">
                <span className="dash-metric-label">Integrity Alerts</span>
                <span className={`dash-metric-value ${rejectedCount > 0 ? 'dash-value-error' : 'dash-value-success'}`}>{rejectedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Distributed Neural Exchange (Institutional Redesign) ─── */}
      <div className="dash-distributed-section">
        <div className="dist-organizer-grid">
          
          {/* Panel 1: Orchestration & Session Controller */}
          <div className="dist-panel">
            <div className="dist-panel-header">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                  <Zap size={13} />
                </div>
                <div>
                  <h3 className="dist-panel-title">Session Controller</h3>
                  <span className="dist-panel-subtitle">Orchestration & Quorum</span>
                </div>
              </div>
              <div className={`dist-status-badge ${['WAITING', 'TRAINING', 'AGGREGATING', 'IN_PROGRESS'].includes(distributedStatus.status) ? 'dist-status-badge-active' : ''}`}>
                <span className="dist-status-pulse" />
                <span>{distributedStatus.status || 'IDLE'}</span>
              </div>
            </div>

            <div className="dist-panel-body">
              {/* Quorum Fulfillment Telemetry */}
              <div className="dist-telemetry-card">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="dist-field-label">Consensus Quorum</span>
                  <span className="dist-field-val-mono font-bold text-sky-600">
                    {(distributedStatus.registeredClients || Object.keys(nodeRegistry || {}).length || 0)} / {Math.max(1, distributedStatus.updatesNeeded || distributedStatus.registeredClients || 1)} Nodes
                  </span>
                </div>
                <div className="dist-progress-bar-bg">
                  <motion.div 
                    className="dist-progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(100, Math.round(((distributedStatus.registeredClients || Object.keys(nodeRegistry || {}).length || 0) / Math.max(1, distributedStatus.updatesNeeded || distributedStatus.registeredClients || 1)) * 100))}%` 
                    }}
                  />
                </div>
              </div>

              {/* Protocol Hyperparameters Matrix */}
              <div className="dist-params-grid">
                <div className="dist-param-cell">
                  <span className="dist-param-key">Rounds Cap</span>
                  <span className="dist-param-val">05 Max</span>
                </div>
                <div className="dist-param-cell">
                  <span className="dist-param-key">Aggregation</span>
                  <span className="dist-param-val">FedAvg Median</span>
                </div>
                <div className="dist-param-cell">
                  <span className="dist-param-key">DP Privacy</span>
                  <span className="dist-param-val">σ = 0.005</span>
                </div>
                <div className="dist-param-cell">
                  <span className="dist-param-key">Transport</span>
                  <span className="dist-param-val">gRPC / WSS</span>
                </div>
              </div>

              {/* Readiness Notice */}
              {(() => {
                const regCount = (distributedStatus.registeredClients || Object.keys(nodeRegistry || {}).length || 0);
                const isSessionActive = ['WAITING', 'TRAINING', 'AGGREGATING', 'IN_PROGRESS'].includes(distributedStatus.status);

                if (isSessionActive) {
                  return (
                    <div className="dist-notice dist-notice-active">
                      <Activity size={13} className="text-sky-600 animate-spin" />
                      <span>Federated round {distributedStatus.round || 1} in progress across {regCount} nodes...</span>
                    </div>
                  );
                }

                if (regCount === 0) {
                  return (
                    <div className="dist-notice dist-notice-warning">
                      <AlertCircle size={13} className="text-amber-500" />
                      <span>Awaiting edge worker. Run command in Panel 3 to connect a node.</span>
                    </div>
                  );
                }

                return (
                  <div className="dist-notice dist-notice-ready">
                    <CheckCircle2 size={13} className="text-emerald-600 font-bold" />
                    <span>{regCount} node{regCount > 1 ? 's' : ''} enrolled & verified. Ready to initiate session.</span>
                  </div>
                );
              })()}
            </div>

            {/* Action Button */}
            <div className="dist-panel-footer">
              {(() => {
                const regCount = (distributedStatus.registeredClients || Object.keys(nodeRegistry || {}).length || 0);
                const isSessionActive = ['WAITING', 'TRAINING', 'AGGREGATING', 'IN_PROGRESS'].includes(distributedStatus.status);
                
                if (!isSessionActive && regCount === 0) {
                  return (
                    <button 
                      onClick={() => {
                        setCliTab('universal');
                        navigator.clipboard.writeText('curl -sSL https://mdark4025-cybronites.hf.space/join.py | python3');
                        setCopyCloudSuccess(true);
                        setTimeout(() => setCopyCloudSuccess(false), 2000);
                      }}
                      className="dist-btn-action dist-btn-guide"
                      data-tooltip="Copy 1-line connection script to your clipboard"
                      data-tooltip-pos="bottom"
                    >
                      <Terminal size={13} />
                      <span>Copy Client Run Command</span>
                    </button>
                  );
                }

                return (
                  <button 
                    onClick={() => isSessionActive ? stopDistributedSession() : startDistributedSession(5, Math.max(1, regCount))}
                    className={`dist-btn-action ${isSessionActive ? 'dist-btn-terminate' : 'dist-btn-execute'}`}
                    data-tooltip={isSessionActive ? "Halt active distributed training cycle" : "Begin federated training cycle across connected nodes"}
                    data-tooltip-pos="bottom"
                  >
                    {isSessionActive ? <TrendingUp size={13} /> : <Zap size={13} fill="currentColor" />}
                    <span>{isSessionActive ? 'Halt Active Session' : (distributedStatus.status === 'COMPLETE' ? 'Restart Training Cycle' : 'Initiate Federated Session')}</span>
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Panel 2: Aggregation Progress & Consensus Matrix */}
          <div className="dist-panel">
            <div className="dist-panel-header">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Activity size={13} />
                </div>
                <div>
                  <h3 className="dist-panel-title">Aggregation Progress</h3>
                  <span className="dist-panel-subtitle">Gradient Ingestion Matrix</span>
                </div>
              </div>
              <div className="dist-meta-pill">
                <span>Round {distributedStatus.round || 0} / 05</span>
              </div>
            </div>

            <div className="dist-panel-body">
              {/* Dual Stat Cards */}
              <div className="grid grid-cols-2 gap-3 mb-1">
                <div className="dist-stat-tile">
                  <span className="dist-stat-tile-label">Registered Nodes</span>
                  <div className="dist-stat-tile-val-row">
                    <span className="dist-stat-tile-val text-slate-800">
                      {distributedStatus.registeredClients || Object.keys(nodeRegistry || {}).length || 0}
                    </span>
                    <span className="dist-stat-tile-denom">
                      / {Math.max(1, distributedStatus.updatesNeeded || distributedStatus.registeredClients || 1).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <div className="dist-stat-tile">
                  <span className="dist-stat-tile-label">Current Round</span>
                  <div className="dist-stat-tile-val-row">
                    <span className="dist-stat-tile-val text-slate-800">
                      {distributedStatus.round || 0}
                    </span>
                    <span className="dist-stat-tile-denom">/ 05</span>
                  </div>
                </div>
              </div>

              {/* Gauge & Progress Center */}
              <div className="dist-gauge-section">
                <div className="dist-gauge-wrap">
                  <svg className="dist-gauge-svg" viewBox="0 0 100 100">
                    <circle className="dist-gauge-track" r="42" cx="50" cy="50" />
                    <motion.circle 
                      className="dist-gauge-indicator"
                      stroke="#0284c7"
                      strokeDasharray="264"
                      initial={{ strokeDashoffset: 264 }}
                      animate={{ 
                        strokeDashoffset: 264 - (264 * Math.min(1, ((distributedStatus.updatesReceived || 0) / Math.max(1, distributedStatus.updatesNeeded || 1)))) 
                      }}
                      r="42" cx="50" cy="50" 
                    />
                  </svg>
                  <div className="dist-gauge-center-text">
                    <span className="dist-gauge-num">{distributedStatus.updatesReceived || 0}</span>
                    <span className="dist-gauge-unit">Updates</span>
                  </div>
                </div>

                {/* Pipeline Phase Indicator */}
                <div className="dist-phases-strip">
                  <div className={`dist-phase-dot ${distributedStatus.status === 'WAITING' ? 'active' : (distributedStatus.status ? 'done' : '')}`}>
                    <span className="phase-num">1</span>
                    <span className="phase-name">Dispatch</span>
                  </div>
                  <div className="dist-phase-line" />
                  <div className={`dist-phase-dot ${distributedStatus.status === 'TRAINING' ? 'active' : (['AGGREGATING', 'COMPLETE'].includes(distributedStatus.status) ? 'done' : '')}`}>
                    <span className="phase-num">2</span>
                    <span className="phase-name">Train</span>
                  </div>
                  <div className="dist-phase-line" />
                  <div className={`dist-phase-dot ${distributedStatus.status === 'AGGREGATING' ? 'active' : (distributedStatus.status === 'COMPLETE' ? 'done' : '')}`}>
                    <span className="phase-num">3</span>
                    <span className="phase-name">Ingest</span>
                  </div>
                  <div className="dist-phase-line" />
                  <div className={`dist-phase-dot ${distributedStatus.status === 'COMPLETE' ? 'done' : ''}`}>
                    <span className="phase-num">4</span>
                    <span className="phase-name">FedAvg</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dist-panel-footer">
              <div className="dist-status-strip">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="mono text-[9px] uppercase tracking-wide text-slate-600">
                  {distributedStatus.status === 'COMPLETE' 
                    ? 'Consensus Convergence Reached ✓' 
                    : distributedStatus.status === 'AGGREGATING'
                    ? 'Computing Byzantine FedAvg Median...'
                    : distributedStatus.status === 'TRAINING'
                    ? 'Edge Shards Computing Local Gradients...'
                    : 'Awaiting Gradient Distribution'}
                </span>
              </div>
            </div>

            <div className="dist-bg-globe-watermark">
              <Globe size={160} />
            </div>
          </div>

          {/* Panel 3: Edge Connectivity & Worker Dispatch */}
          <div className="dist-panel">
            <div className="dist-panel-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Terminal size={13} />
                </div>
                <div>
                  <h3 className="dist-panel-title">Edge Connectivity</h3>
                  <span className="dist-panel-subtitle">Zero-Clone Node Launcher</span>
                </div>
              </div>
              <button
                onClick={handleDownloadJoinScript}
                className="dist-header-action-btn"
                title="Download standalone join.py script"
              >
                <Download size={11} />
                <span>{downloadSuccess ? 'SAVED ✓' : 'join.py'}</span>
              </button>
            </div>

            <div className="dist-panel-body">
              {/* Tab Selector */}
              <div className="dist-tab-switcher">
                <button 
                  onClick={() => setCliTab('universal')}
                  className={`dist-tab-btn ${cliTab === 'universal' ? 'active' : ''}`}
                >
                  Universal 1-Liner
                </button>
                <button 
                  onClick={() => setCliTab('standalone')}
                  className={`dist-tab-btn ${cliTab === 'standalone' ? 'active' : ''}`}
                >
                  Local join.py
                </button>
                <button 
                  onClick={() => setCliTab('flags')}
                  className={`dist-tab-btn ${cliTab === 'flags' ? 'active' : ''}`}
                >
                  CLI Flags
                </button>
              </div>

              {/* Tab 1: Universal 1-Liner */}
              {cliTab === 'universal' && (
                <div className="dist-cli-content">
                  <div className="flex items-center justify-between mb-1">
                    <span className="mono text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                      One-Liner Node Stream
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`curl -sSL ${API_BASE_URL}/join.py | python3`);
                        setCopyCloudSuccess(true);
                        setTimeout(() => setCopyCloudSuccess(false), 2000);
                      }}
                      className="dist-mini-copy-btn"
                      title="Copy universal cloud command"
                    >
                      {copyCloudSuccess ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                      <span>{copyCloudSuccess ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>
                  <div className="dist-terminal-box">
                    <div className="dist-terminal-prompt">$</div>
                    <code className="dist-terminal-code">
                      <span className="token-cmd">curl</span> <span className="token-flag">-sSL</span> <span className="token-url">{API_BASE_URL}/join.py</span> <span className="token-pipe">|</span> <span className="token-exec">python3</span>
                    </code>
                  </div>
                  <p className="dist-cli-desc">
                    Connects any Mac, Linux, Windows, or Cloud GPU directly without downloading files.
                  </p>
                </div>
              )}

              {/* Tab 2: Standalone Script */}
              {cliTab === 'standalone' && (
                <div className="dist-cli-content">
                  <div className="flex items-center justify-between mb-1">
                    <span className="mono text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                      Download &amp; Execute
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`curl -sSL ${API_BASE_URL}/join.py -o join.py && python3 join.py`);
                        setCopyLocalSuccess(true);
                        setTimeout(() => setCopyLocalSuccess(false), 2000);
                      }}
                      className="dist-mini-copy-btn"
                      title="Copy download and execute command"
                    >
                      {copyLocalSuccess ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                      <span>{copyLocalSuccess ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>
                  <div className="dist-terminal-box">
                    <div className="dist-terminal-prompt">$</div>
                    <code className="dist-terminal-code">
                      <span className="token-cmd">curl</span> <span className="token-flag">-sSL</span> <span className="token-url">{API_BASE_URL}/join.py</span> <span className="token-flag">-o</span> join.py <span className="token-pipe">&amp;&amp;</span> <span className="token-exec">python3 join.py</span>
                    </code>
                  </div>
                  <p className="dist-cli-desc">
                    Saves <code>join.py</code> locally to configure custom datasets, epochs, and parameters.
                  </p>
                </div>
              )}

              {/* Tab 3: CLI Flags */}
              {cliTab === 'flags' && (
                <div className="dist-cli-content">
                  <div className="dist-flags-grid">
                    <div className="dist-flag-row" onClick={() => navigator.clipboard.writeText('python3 join.py --name "Hospital-Alpha"')}>
                      <code className="dist-flag-name">--name &lt;str&gt;</code>
                      <span className="dist-flag-desc">Custom node identity</span>
                    </div>
                    <div className="dist-flag-row" onClick={() => navigator.clipboard.writeText(`python3 join.py --server ${API_BASE_URL}`)}>
                      <code className="dist-flag-name">--server &lt;url&gt;</code>
                      <span className="dist-flag-desc">Bridge server URL</span>
                    </div>
                    <div className="dist-flag-row" onClick={() => navigator.clipboard.writeText('python3 join.py --epochs 5 --lr 0.001')}>
                      <code className="dist-flag-name">--epochs &lt;N&gt;</code>
                      <span className="dist-flag-desc">Local training epochs</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="dist-panel-footer">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="mono text-[8px] font-bold text-slate-600">
                    {distributedStatus.status === 'COMPLETE' ? 'SESSION_SETTLED_READY' : 'LISTENING_FOR_HANDSHAKE'}
                  </span>
                </div>
                <span className="mono text-[8px] text-slate-400">PORT 7880 WSS</span>
              </div>
            </div>
          </div>

        </div>

        {/* ─── Trained Model Artifact & Deployment Card (Visible when Training Completes or on request) ─── */}
        {(distributedStatus.status === 'COMPLETE' || status === 'COMPLETE' || status === 'FINISHED' || round >= 5 || (accuracyHistory && accuracyHistory.length > 0)) && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="dash-trained-model-card"
          >
            <div className="dash-tm-header">
              <div className="dash-tm-title-wrap">
                <div className="dash-tm-badge">
                  <Award size={14} className="text-emerald-500" />
                  <span>TRAINING CYCLE COMPLETED</span>
                </div>
                <h4 className="dash-tm-title">Trained Federated Model Checkpoint</h4>
                <p className="dash-tm-desc">
                  All 5 consensus rounds aggregated via decentralized coordinate-wise median & verified on blockchain ledger.
                </p>
              </div>
              <div className="dash-tm-meta-tags">
                <div className="dash-tm-tag">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>100% SMART CONTRACT VERIFIED</span>
                </div>
                <div className="dash-tm-tag">
                  <Cpu size={12} className="text-cyan-500" />
                  <span>PYTORCH & ONNX EXPORTS READY</span>
                </div>
              </div>
            </div>

            <div className="dash-tm-body">
              <div className="dash-tm-stats-grid">
                <div className="dash-tm-stat-box">
                  <span className="dash-tm-stat-label">Convergence Accuracy</span>
                  <span className="dash-tm-stat-value text-emerald-600 font-serif">{currentAccuracy}%</span>
                </div>
                <div className="dash-tm-stat-box">
                  <span className="dash-tm-stat-label">Model Architecture</span>
                  <span className="dash-tm-stat-value font-mono text-slate-800">MNISTNet (PyTorch)</span>
                </div>
                <div className="dash-tm-stat-box">
                  <span className="dash-tm-stat-label">Consensus Height</span>
                  <span className="dash-tm-stat-value font-mono text-slate-800">{blockchain.length} Blocks</span>
                </div>
                <div className="dash-tm-stat-box">
                  <span className="dash-tm-stat-label">Differential Privacy</span>
                  <span className="dash-tm-stat-value text-slate-700">Gaussian (σ=0.005)</span>
                </div>
              </div>

              <div className="dash-tm-actions">
                <a
                  href={`${API_BASE_URL}/api/v1/distributed/download/pt`}
                  download="federated_model_final.pt"
                  className="dash-tm-btn dash-tm-btn-primary"
                >
                  <Download size={14} />
                  <span>Download PyTorch Model (.pt)</span>
                </a>

                <a
                  href={`${API_BASE_URL}/api/v1/distributed/download/onnx`}
                  download="federated_model_final.onnx"
                  className="dash-tm-btn dash-tm-btn-secondary"
                >
                  <Box size={14} />
                  <span>Download ONNX Model (.onnx)</span>
                </a>

                <a
                  href={`${API_BASE_URL}/api/v1/distributed/download/report`}
                  download="federated_audit_performance_report.json"
                  className="dash-tm-btn dash-tm-btn-report"
                >
                  <FileText size={14} />
                  <span>Performance & Audit Report (.json)</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ─── Blockchain Journal ─── */}
      <div className="dash-journal-section">
        <div className="dash-journal-header">
          <h3 className="dash-journal-title">Immutable Node Journal</h3>
          <div className="dash-journal-line" />
        </div>
        <div className="dash-journal-container">
          <BlockchainRibbon blockchain={blockchain} />
        </div>
      </div>

      <style>{`
        .dash-root {
          padding: 24px 28px 120px 28px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          background: var(--bg-main);
          min-height: 100%;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
          font-family: var(--font-sans);
        }

        /* ─── Header ─── */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .dash-title {
          font-family: var(--font-serif);
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 500;
          color: var(--text-main);
          letter-spacing: -0.02em;
          margin: 0 0 8px 0;
          word-break: break-word;
        }
        .dash-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .dash-meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dash-meta-label {
          font-size: 9px;
          font-weight: 500;
          color: var(--text-muted);
          opacity: 0.4;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }
        .dash-meta-value {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-main);
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .dash-meta-value-primary {
          color: var(--primary);
          opacity: 1;
        }
        .dash-meta-divider {
          width: 1px;
          height: 10px;
          background: var(--border);
          opacity: 0.6;
        }

        .dash-header-controls {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .dash-stat-group {
          text-align: right;
          padding-right: 20px;
          border-right: 1px solid var(--border);
          height: 44px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .dash-stat-label {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-muted);
          opacity: 0.4;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          margin-bottom: 6px;
        }
        .dash-stat-value-wrap {
          display: flex;
          align-items: baseline;
          justify-content: flex-end;
          gap: 12px;
        }
        .dash-stat-value {
          font-family: var(--font-serif);
          font-size: 28px;
          font-weight: 500;
          color: var(--text-main);
          line-height: 1;
        }
        .dash-status-dot {
          padding: 4px;
          border-radius: 50%;
          background: var(--bg-surface);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateY(-2px);
        }
        .dash-status-active {
          background: color-mix(in srgb, var(--success) 10%, transparent);
          color: var(--success);
          animation: dash-pulse 2s infinite;
        }
        @keyframes dash-pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        /* ─── Distributed Neural Exchange (Institutional Studio Theme) ─── */
        .dash-distributed-section { 
          margin-top: 24px; 
          margin-bottom: 32px; 
          position: relative;
        }
        .dist-organizer-grid {
          display: grid;
          grid-template-columns: minmax(280px, 320px) minmax(0, 1fr) minmax(300px, 340px);
          gap: 16px;
          position: relative;
          z-index: 10;
          align-items: stretch;
        }
        @media (max-width: 1200px) { .dist-organizer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 860px) { .dist-organizer-grid { grid-template-columns: 1fr; } }

        .dist-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          position: relative;
          min-width: 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 12px -2px rgba(0, 0, 0, 0.03);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .dist-panel:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.06);
        }

        .dist-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .dist-panel-title {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .dist-panel-subtitle {
          font-size: 9px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dist-panel-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .dist-panel-footer {
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
        }

        /* Status Badges */
        .dist-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .dist-status-badge-active {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #16a34a;
        }
        .dist-status-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94a3b8;
        }
        .dist-status-badge-active .dist-status-pulse {
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
          animation: pulse 1.5s infinite;
        }

        .dist-meta-pill {
          padding: 3px 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          font-weight: 700;
          color: #0284c7;
        }

        /* Telemetry & Param Matrix */
        .dist-telemetry-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 12px;
        }
        .dist-field-label {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
        }
        .dist-field-val-mono {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
        }
        .dist-progress-bar-bg {
          width: 100%;
          height: 5px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 4px;
        }
        .dist-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #0284c7, #10b981);
          border-radius: 3px;
        }

        .dist-params-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .dist-param-cell {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 4px;
          padding: 6px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .dist-param-key {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
        }
        .dist-param-val {
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          font-weight: 600;
          color: #1e293b;
        }

        /* Notices */
        .dist-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 500;
        }
        .dist-notice-warning {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          color: #b45309;
        }
        .dist-notice-ready {
          background: #f0fdf4;
          border: 1px solid #dcfce7;
          color: #15803d;
        }
        .dist-notice-active {
          background: #f0f9ff;
          border: 1px solid #e0f2fe;
          color: #0369a1;
        }

        /* Action Buttons */
        .dist-btn-action {
          width: 100%;
          padding: 10px 14px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: var(--font-sans);
        }
        .dist-btn-guide {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #334155;
        }
        .dist-btn-guide:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
        }
        .dist-btn-execute {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
        }
        .dist-btn-execute:hover {
          filter: brightness(1.08);
          box-shadow: 0 6px 18px rgba(2, 132, 199, 0.35);
          transform: translateY(-1px);
        }
        .dist-btn-terminate {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
        }
        .dist-btn-terminate:hover {
          filter: brightness(1.08);
          box-shadow: 0 6px 18px rgba(239, 68, 68, 0.35);
        }

        /* Center Panel Stat Tiles */
        .dist-stat-tile {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .dist-stat-tile-label {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
        }
        .dist-stat-tile-val-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .dist-stat-tile-val {
          font-family: var(--font-mono, monospace);
          font-size: 20px;
          font-weight: 700;
          line-height: 1;
        }
        .dist-stat-tile-denom {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }

        /* Circular Gauge */
        .dist-gauge-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
          padding: 4px 0;
        }
        .dist-gauge-wrap {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dist-gauge-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .dist-gauge-track {
          fill: none;
          stroke: #e2e8f0;
          stroke-width: 5;
        }
        .dist-gauge-indicator {
          fill: none;
          stroke-width: 5;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s ease;
        }
        .dist-gauge-center-text {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .dist-gauge-num {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1;
          font-family: var(--font-mono, monospace);
        }
        .dist-gauge-unit {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-top: 2px;
        }

        /* Pipeline Phases Strip */
        .dist-phases-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 100%;
          padding: 6px 10px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 6px;
        }
        .dist-phase-dot {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 8px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .dist-phase-dot .phase-num {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 800;
        }
        .dist-phase-dot.active {
          color: #0284c7;
        }
        .dist-phase-dot.active .phase-num {
          background: #0284c7;
          color: #ffffff;
          box-shadow: 0 0 6px rgba(2, 132, 199, 0.4);
        }
        .dist-phase-dot.done {
          color: #10b981;
        }
        .dist-phase-dot.done .phase-num {
          background: #10b981;
          color: #ffffff;
        }
        .dist-phase-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
          max-width: 16px;
        }

        .dist-status-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .dist-bg-globe-watermark {
          position: absolute;
          bottom: -20px;
          right: -20px;
          color: #0284c7;
          opacity: 0.03;
          pointer-events: none;
          z-index: 0;
        }

        /* Right Panel: Tabs & Code Box */
        .dist-header-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .dist-header-action-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .dist-tab-switcher {
          display: flex;
          gap: 4px;
          background: #f1f5f9;
          padding: 2px;
          border-radius: 5px;
          border: 1px solid #e2e8f0;
        }
        .dist-tab-btn {
          flex: 1;
          padding: 4px 6px;
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: none;
          background: transparent;
          color: #64748b;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .dist-tab-btn.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .dist-cli-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .dist-terminal-box {
          background: #090e17;
          border: 1px solid #1e293b;
          border-radius: 6px;
          padding: 8px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
        }
        .dist-terminal-prompt {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          font-weight: 700;
          color: #10b981;
          user-select: none;
        }
        .dist-terminal-code {
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          line-height: 1.4;
          color: #e2e8f0;
          word-break: break-all;
        }
        .dist-terminal-code .token-cmd { color: #38bdf8; font-weight: 700; }
        .dist-terminal-code .token-flag { color: #fbbf24; }
        .dist-terminal-code .token-url { color: #a5f3fc; }
        .dist-terminal-code .token-pipe { color: #f472b6; font-weight: 700; }
        .dist-terminal-code .token-exec { color: #4ade80; font-weight: 700; }

        .dist-cli-desc {
          font-size: 9px;
          line-height: 1.4;
          color: #64748b;
          margin: 0;
        }
        .dist-cli-desc code {
          font-family: var(--font-mono, monospace);
          font-size: 8px;
          background: #f1f5f9;
          padding: 1px 3px;
          border-radius: 2px;
          color: #0f172a;
        }

        .dist-flags-grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dist-flag-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 5px 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .dist-flag-row:hover {
          background: #f1f5f9;
        }
        .dist-flag-name {
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          font-weight: 700;
          color: #0284c7;
        }
        .dist-flag-desc {
          font-size: 8px;
          color: #64748b;
        }

        .dist-mini-copy-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 8px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }
        .dist-mini-copy-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .dash-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dash-btn-primary {
          height: 40px;
          background: var(--primary);
          color: #fff;
          border: none;
          padding: 0 24px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .dash-btn-primary:hover:not(.dash-btn-disabled) { box-shadow: 0 4px 14px rgba(0,0,0,0.15); filter: brightness(1.08); }
        .dash-btn-primary:active:not(.dash-btn-disabled) { transform: scale(0.99); }
        .dash-btn-disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); box-shadow: none; }
        
        .dash-btn-icon {
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .dash-btn-icon:hover { background: var(--bg-surface); color: var(--text-main); border-color: var(--text-muted); }

        /* ─── Grid ─── */
        .dash-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 16px;
          align-items: stretch;
        }
        @media (max-width: 1024px) {
          .dash-grid {
            grid-template-columns: 1fr;
          }
        }
        .dash-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .dash-card-header {
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(var(--bg-surface-rgb), 0.5);
        }
        .dash-card-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dash-card-icon { color: var(--primary); opacity: 0.7; }
        .dash-card-title {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .dash-card-legend {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .dash-legend-item { display: flex; align-items: center; gap: 8px; }
        .dash-legend-color { width: 10px; height: 4px; background: var(--primary); border-radius: 2px; }

        .dash-chart-container {
          padding: 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 0 0 8px 8px;
        }

        .dash-sidebar-stats {
          display: flex;
          flex-direction: column;
          gap: 14px;
          height: 100%;
          justify-content: space-between;
        }
        .dash-card-accent {
          background: linear-gradient(135deg, #090e17 0%, #131c2e 100%) !important;
          color: #fff !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          padding: 18px !important;
          border-radius: 8px !important;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.35) !important;
        }
        .dash-card-accent::after {
          content: '';
          position: absolute;
          top: -20%; right: -10%;
          width: 80%; height: 140%;
          background: linear-gradient(135deg, transparent, rgba(56, 189, 248, 0.08));
          transform: rotate(15deg);
          pointer-events: none;
        }
        .dash-accent-title {
          font-family: var(--font-sans) !important;
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #f8fafc !important;
          margin: 0 0 6px 0 !important;
          letter-spacing: -0.01em !important;
        }
        .dash-accent-text {
          font-size: 11px !important;
          line-height: 1.5 !important;
          color: #94a3b8 !important;
          letter-spacing: 0.01em !important;
          margin: 0 !important;
        }

        .dash-resilience-card {
          border-radius: 8px !important;
          flex: 1;
        }
        .dash-metrics-list { 
          padding: 16px 18px !important; 
          display: flex; 
          flex-direction: column; 
          gap: 14px; 
          flex: 1;
          justify-content: space-around;
        }
        .dash-metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }
        .dash-metric-row:last-child { border-bottom: none; padding-bottom: 0; }
        .dash-metric-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .dash-metric-value { font-size: 13px; font-weight: 700; font-family: var(--font-mono, monospace); color: var(--primary); }
        .dash-value-error { color: var(--error); }
        .dash-value-success { color: var(--success); }

        /* ─── Journal ─── */
        .dash-journal-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .dash-journal-header {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
        }
        .dash-journal-title {
          font-family: var(--font-serif);
          font-size: 20px;
          font-weight: 500;
          color: var(--text-main);
          margin: 0;
          background: var(--bg-main);
          padding-right: 16px;
          z-index: 2;
        }
        .dash-journal-line {
          flex: 1;
          height: 1px;
          background: var(--border);
          opacity: 0.6;
        }


        .dash-journal-container {
          min-height: 180px;
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          flex-direction: column;
        }

        /* ─── Trained Model Artifact & Deployment Card ─── */
        .dash-trained-model-card {
          margin-top: 24px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .dash-tm-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 16px;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .dash-tm-header { flex-direction: column; }
        }
        .dash-tm-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 800;
          color: #059669;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .dash-tm-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
          letter-spacing: -0.01em;
        }
        .dash-tm-desc {
          font-size: 12px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }
        .dash-tm-meta-tags {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }
        .dash-tm-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          color: #334155;
          letter-spacing: 0.05em;
        }
        .dash-tm-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .dash-tm-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .dash-tm-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .dash-tm-stat-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 16px;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dash-tm-stat-label {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .dash-tm-stat-value {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .dash-tm-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
        }
        .dash-tm-btn {
          height: 38px;
          padding: 0 16px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .dash-tm-btn-primary {
          background: #0f172a;
          color: #ffffff !important;
          border: 1px solid #0f172a;
        }
        .dash-tm-btn-primary:hover {
          background: #1e293b;
          border-color: #1e293b;
        }
        .dash-tm-btn-secondary {
          background: #ffffff;
          color: #0f172a !important;
          border: 1px solid #cbd5e1;
        }
        .dash-tm-btn-secondary:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }
        .dash-tm-btn-report {
          background: #f0fdf4;
          color: #15803d !important;
          border: 1px solid #bbf7d0;
        }
        .dash-tm-btn-report:hover {
          background: #dcfce7;
          border-color: #86efac;
        }

        /* ─── Responsive ─── */
        @media (max-width: 1200px) {
          .dash-grid { grid-template-columns: 1fr; }
          .dash-sidebar-stats { flex-direction: row; }
          .dash-sidebar-stats > * { flex: 1; }
        }
      `}</style>
    </div>
  );
};
