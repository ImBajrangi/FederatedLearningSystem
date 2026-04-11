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

      {/* ─── Distributed Neural Exchange (Reorganized) ─── */}
      <div className="dash-distributed-section">
        <div className="dist-organizer-grid">
          
          {/* Panel 1: Orchestration & Session */}
          <div className="dist-panel">
            <div className="dist-panel-header">
              <Zap size={14} className="text-accent" />
              <span className="type-label-bold !text-main">Session Controller</span>
            </div>
            
            <div className="flex flex-col gap-6">
              <div>
                <span className="dist-metric-label-mini">Network State</span>
                <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-slate-50 border border-border rounded-sm">
                  <span className={`w-2 h-2 rounded-full ${distributedStatus.status !== 'IDLE' ? 'bg-success animate-pulse' : 'bg-slate-300'}`} 
                        style={{ backgroundColor: distributedStatus.status !== 'IDLE' ? 'var(--success)' : '#cbd5e1' }} />
                  <span className="mono text-[10px] font-bold uppercase tracking-widest text-main">
                    {distributedStatus.status || 'Offline'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="dist-metric-label-mini text-accent">Protocol Constraints</span>
                <div className="mono text-[10px] space-y-2 opacity-70">
                  <div className="flex justify-between border-b border-border/40 pb-1">
                    <span>ROUNDS_LIMIT</span> 
                    <span className="text-main font-bold">05</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-1">
                    <span>MIN_CONSENSUS</span> 
                    <span className="text-main font-bold">02</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => distributedStatus.status === 'IDLE' ? startDistributedSession(5, 2) : stopDistributedSession()}
              className={`dist-btn-action-large ${distributedStatus.status === 'IDLE' ? '' : 'dist-btn-stop-large'}`}
            >
              {distributedStatus.status === 'IDLE' ? <Zap size={12} fill="currentColor" /> : <TrendingUp size={12} />}
              <span>{distributedStatus.status === 'IDLE' ? 'Initiate Session' : 'Terminate'}</span>
            </button>
          </div>

          {/* Panel 2: Live Metrics & Convergence */}
          <div className="dist-panel">
            <div className="dist-panel-header">
              <Activity size={14} className="text-accent" />
              <span className="type-label-bold !text-main">Aggregation Progress</span>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="dist-metric-box">
                <span className="dist-metric-label-mini">Registered Nodes</span>
                <div className="dist-metric-value-row">
                  <span className="dist-metric-val">{distributedStatus.registeredClients || 0}</span>
                  <span className="type-label opacity-30">/ 02</span>
                </div>
              </div>
              <div className="dist-metric-box">
                <span className="dist-metric-label-mini">Current Round</span>
                <div className="dist-metric-value-row">
                  <span className="dist-metric-val">{distributedStatus.round || 0}</span>
                  <span className="type-label opacity-30">/ 05</span>
                </div>
              </div>
            </div>

            <div className="dist-ring-center">
              <div className="absolute flex flex-col items-center">
                <span className="serif text-3xl text-main leading-none">{distributedStatus.updatesReceived || 0}</span>
                <span className="dist-metric-label-mini !text-[7px] opacity-40">Updates</span>
              </div>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle stroke="var(--border)" strokeOpacity="0.3" strokeWidth="3" fill="transparent" r="45" cx="50" cy="50" />
                <motion.circle 
                  stroke="var(--accent)"
                  strokeWidth="3" 
                  strokeDasharray="283" 
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * ((distributedStatus.updatesReceived || 0) / (distributedStatus.updatesNeeded || 1))) }}
                  strokeLinecap="round" 
                  fill="transparent" 
                  r="45" cx="50" cy="50" 
                />
              </svg>
            </div>
            
            <p className="mt-6 text-center mono text-[8px] uppercase tracking-tighter opacity-40">
              Awaiting Gradient Distribution
            </p>

            <div className="dist-bg-globe-watermark">
              <Globe size={180} />
            </div>
          </div>

          {/* Panel 3: CLI Edge Directive */}
          <div className="dist-panel">
            <div className="dist-panel-header">
              <Terminal size={14} className="text-accent" />
              <span className="type-label-bold !text-main">Edge Connectivity</span>
            </div>

            <p className="text-[10px] leading-relaxed text-muted mb-6">
              Geographically distributed entities must execute the following directive to join the synchronization pool.
            </p>

            <div className="dist-terminal">
              <code className="text-main/80 block break-all leading-relaxed mb-4">
                python run_client.py <br/> 
                --server https://mdark4025-cybronites.hf.space <br/>
                --name "NODE_{Math.floor(Math.random()*1000)}"
              </code>
              <div className="flex items-center gap-2 opacity-40 selection:bg-transparent">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="mono text-[8px]">READY_FOR_HANDSHAKE</span>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-border/40">
              <div className="flex items-start gap-3">
                <AlertCircle size={14} className="text-accent mt-1 flex-shrink-0" />
                <p className="text-[9px] leading-relaxed opacity-60 italic">
                  Nodes automatically encrypt gradients using AES-256-GCM before transport. Ensure stable internet uplink during aggregation.
                </p>
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
        .dash-distributed-section { 
          margin-top: 40px; 
          margin-bottom: 60px; 
          position: relative;
        }
        .dist-organizer-grid {
          display: grid;
          grid-template-columns: 280px 1fr 320px;
          gap: 24px;
          position: relative;
          z-index: 10;
        }
        @media (max-width: 1200px) { .dist-organizer-grid { grid-template-columns: 300px 1fr; } }
        @media (max-width: 850px) { .dist-organizer-grid { grid-template-columns: 1fr; } }

        .dist-panel {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          padding: 32px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: border-color 0.3s, transform 0.3s;
        }
        .dist-panel:hover { border-color: var(--accent); }
        
        .dist-panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }

        .dist-bg-globe-watermark {
          position: absolute;
          bottom: -30px;
          right: -30px;
          color: var(--accent);
          opacity: 0.03;
          pointer-events: none;
          z-index: 0;
        }

        .dist-metric-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 24px;
        }
        .dist-metric-value-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .dist-metric-val { 
          font-family: var(--font-serif); 
          font-size: 32px; 
          color: var(--text-main);
          line-height: 1;
        }
        .dist-metric-label-mini {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          font-weight: 600;
        }

        .dist-btn-action-large {
          margin-top: auto;
          padding: 18px;
          background: var(--accent);
          color: white;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 4px 15px var(--accent-glow);
        }
        .dist-btn-action-large:hover { transform: translateY(-2px); box-shadow: 0 8px 25px var(--accent-glow); }
        .dist-btn-stop-large { background: rgba(239, 68, 68, 0.1); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.2); box-shadow: none; }
        .dist-btn-stop-large:hover { background: var(--error); color: white; }

        .dist-ring-center {
          width: 110px; height: 110px;
          position: relative;
          display: flex;
          align-items: center; justify-content: center;
          margin: 0 auto;
        }
        
        .dist-terminal {
          background: var(--bg-main);
          padding: 24px;
          border: 1px solid var(--border);
          font-family: var(--font-mono);
          font-size: 10px;
          position: relative;
          overflow: hidden;
        }
        .dist-terminal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 3px; height: 100%;
          background: var(--accent);
          opacity: 0.5;
        }

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
        .dist-bg-globe {
          position: absolute;
          top: -60px;
          right: -60px;
          color: var(--accent);
          opacity: 0.04;
          pointer-events: none;
          transition: opacity 1s;
          display: block;
          z-index: 0;
        }
        .dist-card-premium:hover .dist-bg-globe { opacity: 0.1; }
        
        .dist-layout { display: flex; flex-direction: row; min-height: 380px; position: relative; z-index: 10; }
        @media (max-width: 768px) { .dist-layout { flex-direction: column; } }
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

        .dist-metrics-grid { display: grid; grid-gap: 40px; grid-template-columns: 1fr 140px 1fr; }
        @media (max-width: 1024px) { .dist-metrics-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 640px) { .dist-metrics-grid { grid-template-columns: 1fr; } }
        
        .dist-metric-item { display: flex; flex-direction: column; gap: 8px; }
        .dist-progress-ring-container {
          position: relative;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
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
