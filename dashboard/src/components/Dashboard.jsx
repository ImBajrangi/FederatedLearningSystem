import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap, Globe, Lock, Cpu, Server, TrendingUp, AlertCircle, Terminal } from 'lucide-react';
import { MetricsChart } from './MetricsChart';
import { BlockchainRibbon } from './BlockchainExplorer';

export const Dashboard = ({
  accuracyHistory = [],
  isConnected,
  isActive,
  status,
  startSimulation,
  clearSimulation,
  blockchain = [],
  clients = [],
  rejectedCount = 0,
  round = 0,
  distributedStatus = {},
  startDistributedSession = () => {},
  stopDistributedSession = () => {}
}) => {
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
          <div className="dash-stat-group border-r border-border/50">
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
            >
              <Zap size={12} fill="currentColor" />
              <span>{status === 'IDLE' ? 'Connect Sessions' : status === 'FINISHED' ? 'Report Complete' : 'Synchronized'}</span>
            </button>
            <button onClick={clearSimulation} className="dash-btn-icon">
              <TrendingUp size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Top Metrics Grid ─── */}
      <div className="dash-grid">
        {/* Main Chart */}
        <div className="dash-card dash-card-main card-shadow-premium bg-white border-border/40">
          <div className="dash-card-header bg-slate-50/50 backdrop-blur-sm">
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
          <div className="dash-card dash-card-accent bg-primary shadow-xl overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck size={80} />
            </div>
            <ShieldCheck size={20} className="text-accent mb-6" />
            <h3 className="dash-accent-title serif">Security Policy Active</h3>
            <p className="dash-accent-text opacity-70">Differential Privacy calibration active. Coordination via Secure gRPC Tunnel.</p>
          </div>

          {/* Network Resilience */}
          <div className="dash-card">
            <div className="dash-card-header">
              <Activity size={12} className="dash-card-icon" />
              <span className="dash-card-title">Network Resilience</span>
            </div>
            <div className="dash-card-body dash-metrics-list">
              <div className="dash-metric-row">
                <span className="dash-metric-label">Active Shards</span>
                <span className="dash-metric-value">{clients.filter(c => c.status === 'ACTIVE' || c.status === 'BUSY').length} / 8</span>
              </div>
              <div className="dash-metric-row">
                <span className="dash-metric-label">Rounds Synced</span>
                <span className="dash-metric-value">{round}</span>
              </div>
              <div className="dash-metric-row">
                <span className="dash-metric-label">Integrity Alerts</span>
                <span className={`dash-metric-value ${rejectedCount > 0 ? 'dash-value-error' : 'dash-value-success'}`}>{rejectedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Distributed Neural Exchange Section ─── */}
      <div className="dash-distributed-section">
        <div className="dist-card-premium">
          <div className="dist-bg-globe">
             <Globe size={400} />
          </div>

          <div className="dist-layout">
            {/* Control Sidebar */}
            <div className="dist-sidebar">
              <div>
                <div className="dist-header-group">
                  <div className="dist-icon-box">
                    <Globe size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="type-label-bold !text-main">Synchronization</span>
                    <span className="mono text-[8px] opacity-40 uppercase">v2.4 Distributed</span>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <span className="type-label block mb-2">Network Status</span>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-sm">
                      <span className={`w-2 h-2 rounded-full ${distributedStatus.status !== 'IDLE' ? 'bg-success animate-pulse' : 'bg-slate-300'}`} 
                            style={{ backgroundColor: distributedStatus.status !== 'IDLE' ? 'var(--success)' : '#cbd5e1' }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {distributedStatus.status || 'Offline'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="type-label block mb-2">Protocol Config</span>
                    <div className="text-[10px] space-y-1 opacity-60 mono">
                      <div className="flex justify-between"><span>ROUNDS:</span> <span>05</span></div>
                      <div className="flex justify-between"><span>MIN_NODES:</span> <span>02</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => distributedStatus.status === 'IDLE' ? startDistributedSession(5, 2) : stopDistributedSession()}
                className={`dist-btn-action ${distributedStatus.status === 'IDLE' ? 'dist-btn-start' : 'dist-btn-stop'}`}
              >
                {distributedStatus.status === 'IDLE' ? <Zap size={12} fill="currentColor" /> : <TrendingUp size={12} />}
                <span>{distributedStatus.status === 'IDLE' ? 'Initiate Exchange' : 'Terminate'}</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="dist-main">
              <div className="dist-metrics-grid">
                
                {/* Metrics */}
                <div className="dist-metric-item">
                  <div>
                    <span className="type-label block mb-2">Registered Nodes</span>
                    <div className="flex items-baseline gap-3">
                      <span className="serif text-4xl text-main">{distributedStatus.registeredClients || 0}</span>
                      <span className="type-label opacity-30">/ 02 Min</span>
                    </div>
                    <div className="mt-4 h-1 bg-border relative overflow-hidden">
                       <motion.div 
                          className="absolute h-full left-0"
                          style={{ backgroundColor: 'var(--accent)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, ((distributedStatus.registeredClients || 0) / 2) * 100)}%` }}
                       />
                    </div>
                  </div>

                  <div className="mt-8">
                    <span className="type-label block mb-2">Round Progress</span>
                    <div className="flex items-baseline gap-3">
                      <span className="serif text-4xl text-main">{distributedStatus.round || 0}</span>
                      <span className="type-label opacity-30">/ 05 Rounds</span>
                    </div>
                  </div>
                </div>

                {/* Progress Ring */}
                <div className="flex flex-col items-center justify-center">
                  <div className="dist-progress-ring-container">
                    <div className="dist-ring-text">
                      <span className="serif text-3xl leading-none">{distributedStatus.updatesReceived || 0}</span>
                      <span className="type-label !text-[8px] opacity-40">Uplinks</span>
                    </div>
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle className="text-border" strokeWidth="4" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" 
                              style={{ color: 'var(--border)' }} />
                      <motion.circle 
                        strokeWidth="4" 
                        strokeDasharray="283" 
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset: 283 - (283 * ((distributedStatus.updatesReceived || 0) / (distributedStatus.updatesNeeded || 1))) }}
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="45" cx="50" cy="50" 
                        style={{ color: 'var(--accent)' }}
                      />
                    </svg>
                  </div>
                  <span className="mt-4 text-center type-label opacity-40 uppercase">Awaiting Node Gradients</span>
                </div>

                {/* CLI Guide */}
                <div className="dist-cli-box">
                  <div className="flex items-center gap-2">
                    <Terminal size={12} style={{ color: 'var(--accent)' }} />
                    <span className="type-label-bold !text-main">Connection Directive</span>
                  </div>
                  <div className="dist-code-area">
                    python run_client.py <br/> --server https://mdark4025-cybronites.hf.space
                  </div>
                  <p className="type-label !text-[8px] leading-relaxed opacity-50 italic">
                    Geographically distributed nodes must use this endpoint for secure weight synchronization.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
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
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          background: var(--bg-main);
          min-height: 100%;
          font-family: var(--font-sans);
        }

        /* ─── Header ─── */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 32px;
          border-bottom: 1px solid var(--border);
        }
        .dash-title {
          font-family: var(--font-serif);
          font-size: 32px;
          font-weight: 500;
          color: var(--text-main);
          letter-spacing: -0.02em;
          margin: 0 0 16px 0;
        }
        .dash-meta {
          display: flex;
          align-items: center;
          gap: 16px;
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
          gap: 40px;
        }
        .dash-stat-group {
          text-align: right;
          padding-right: 40px;
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

        .dash-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 44px;
        }
        .dash-btn-primary {
          height: 100%;
          background: var(--primary);
          color: #fff;
          border: none;
          padding: 0 32px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .dash-btn-primary:hover:not(.dash-btn-disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        .dash-btn-primary:active:not(.dash-btn-disabled) { transform: scale(0.98); }
        .dash-btn-disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); box-shadow: none; }
        
        .dash-btn-icon {
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .dash-btn-icon:hover { background: var(--bg-surface); color: var(--text-main); border-color: var(--text-muted); }

        /* ─── Grid ─── */
        .dash-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 40px;
        }
        .dash-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
        }
        .dash-card-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(var(--bg-surface-rgb), 0.5);
        }
        .dash-card-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dash-card-icon { color: var(--primary); opacity: 0.6; }
        .dash-card-title {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }
        .dash-card-legend {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .dash-legend-item { display: flex; align-items: center; gap: 8px; }
        .dash-legend-color { width: 10px; height: 4px; background: var(--primary); }

        .dash-chart-container {
          padding: 32px;
          height: 380px;
          background: #fff;
        }

        .dash-sidebar-stats {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .dash-card-accent {
          background: var(--primary);
          color: #fff;
          border: none;
          padding: 32px;
          position: relative;
          overflow: hidden;
        }
        .dash-card-accent::after {
          content: '';
          position: absolute;
          top: -20%; right: -10%;
          width: 80%; height: 140%;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.05));
          transform: rotate(15deg);
        }
        .dash-accent-icon { margin-bottom: 24px; opacity: 0.4; }
        .dash-accent-title {
          font-family: var(--font-serif);
          font-size: 20px;
          font-weight: 500;
          margin: 0 0 12px 0;
        }
        .dash-accent-text {
          font-size: 11px;
          line-height: 1.6;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin: 0;
        }

        .dash-metrics-list { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
        .dash-metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }
        .dash-metric-row:last-child { border-bottom: none; padding-bottom: 0; }
        .dash-metric-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .dash-metric-value { font-size: 14px; font-weight: 700; color: var(--primary); }
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
        .dash-distributed-section {
          margin-top: 40px;
        }
        .dash-card-distributed {
          position: relative;
          border-radius: 20px;
          border: 1px solid color-mix(in srgb, var(--primary) 15%, transparent);
          background: linear-gradient(135deg, rgba(var(--bg-surface-rgb), 0.95), rgba(var(--bg-surface-rgb), 0.8));
          backdrop-filter: blur(20px);
        }
        .dash-distributed-bg-icon {
          position: absolute;
          top: -20px;
          right: -40px;
          color: var(--primary);
          opacity: 0.03;
          pointer-events: none;
          transform: rotate(15deg);
        }
        .dist-btn {
          height: 40px;
          padding: 0 24px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: var(--font-sans);
        }
        .dist-btn-start {
          background: var(--primary);
          color: #fff;
          border: none;
          box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
        }
        .dist-btn-start:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.4);
        }
        .dist-btn-stop {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .dist-btn-stop:hover {
          background: #ef4444;
          color: #fff;
        }

        .dist-metric-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 12px;
        }
        .dist-metric-label {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 8px;
          display: block;
        }
        .dist-metric-value {
          font-family: var(--font-serif);
          font-size: 24px;
          color: var(--text-main);
          font-weight: 500;
        }

        .dist-progress-ring-wrap {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto;
        }
        .dist-progress-label {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .dist-progress-svg {
          width: 120px;
          height: 120px;
          transform: rotate(-90deg);
        }
        .dist-ring-bg {
          fill: none;
          stroke: var(--border);
          stroke-width: 6;
          opacity: 0.3;
        }
        .dist-ring-fill {
          fill: none;
          stroke: var(--primary);
          stroke-width: 6;
          stroke-linecap: round;
          stroke-dasharray: 283;
        }

        .dash-journal-container {
          height: 320px;
          border: 1px solid var(--border);
          background: #000;
          display: flex;
          flex-direction: column;
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
