import React from 'react';
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

export const TrainingWorkspace = ({ clients, logs = [], accuracyHistory = [], lossHistory = [], hyperparams, roundHistory = [], modelArchitecture }) => {
  const defaultHyperparams = {
    learning_rate: 0.01,
    batch_size: 32,
    epochs: 1
  };
  
  const hp = hyperparams || defaultHyperparams;

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
            <div className="tr-status-dot" />
            <span className="tr-status-text">GPU CLUSTER: READY</span>
          </div>
          <button className="tr-run-btn group">
            <Zap size={14} fill="currentColor" />
            <span>Initiate Training</span>
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
              <div className="tr-live-sync">
                <div className="tr-sync-dot" />
                <span>Live Sync</span>
              </div>
            </div>
            <div className="tr-ledger-scroll">
              <table className="tr-table">
                <thead>
                  <tr>
                    <th>Rnd</th>
                    <th>Node_ID</th>
                    <th>LR</th>
                    <th>Batch</th>
                    <th className="tr-text-right">Acc %</th>
                    <th className="tr-text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roundHistory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="tr-empty-state">
                        Awaiting initial orchestration cycle...
                      </td>
                    </tr>
                  ) : (
                    [...roundHistory].reverse().map((row, idx) => (
                      <tr key={idx}>
                        <td className="tr-rnd">#{row.round.toString().padStart(2, '0')}</td>
                        <td>
                          <div className="tr-node-info">
                            <span className="tr-node-id">{row.client}</span>
                            <span className="tr-node-ver">Node_v{idx + 1}</span>
                          </div>
                        </td>
                        <td className="tr-mono">{row.lr.toFixed(3)}</td>
                        <td className="tr-mono">{row.batch}</td>
                        <td className="tr-text-right tr-acc">{(row.acc * 100).toFixed(1)}%</td>
                        <td className="tr-text-right">
                          <div className="tr-verified-badge">
                            <ShieldCheck size={8} />
                            <span>Verified</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Model Script */}
          <section className="tr-card tr-script-card">
            <div className="tr-card-header">
              <div className="tr-card-title-wrap">
                <Code size={13} className="tr-card-icon" />
                <span className="tr-card-title">Model Specification</span>
                <span className="tr-file-tag">model.py</span>
              </div>
            </div>
            <div className="tr-script-body">
              <pre><code>{modelArchitecture}</code></pre>
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
          <section className="tr-console">
            <div className="tr-console-header">
              <div className="tr-console-title">
                <TerminalIcon size={11} className="tr-console-icon" />
                <span>Cluster Node Telemetry</span>
              </div>
              <button className="tr-console-clear">Clear</button>
            </div>
            <div className="tr-console-body scroll-m-0">
              {logs.map((log, i) => {
                const logObj = typeof log === 'object' ? log : { msg: log };
                const isComplete = logObj.msg.includes('COMPLETE') || logObj.msg.includes('FINISHED');
                const isError = logObj.msg.includes('ERR') || logObj.msg.includes('CRITICAL');
                return (
                  <div key={i} className="tr-console-line">
                    <span className="tr-timestamp">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    <span className={`tr-log-msg ${isComplete ? 'tr-log-success' : isError ? 'tr-log-error' : ''}`}>
                      {logObj.msg}
                    </span>
                  </div>
                );
              })}
              <div className="tr-console-cursor">
                <span className="tr-timestamp">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                <div className="tr-cursor-char" />
                <span className="tr-log-msg-muted">Awaiting sequence...</span>
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

        /* ─── Ledger ─── */
        .tr-ledger-card { border-color: rgba(var(--primary-rgb), 0.15); }
        .tr-live-sync { display: flex; align-items: center; gap: 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); opacity: 0.6; }
        .tr-sync-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--primary); animation: tr-pulse 2s infinite; }
        @keyframes tr-pulse { 0% { opacity: 1; } 50% { opacity: 0.2; } 100% { opacity: 1; } }

        .tr-ledger-scroll { max-height: 280px; overflow-y: auto; }
        .tr-ledger-scroll::-webkit-scrollbar { width: 4px; }
        .tr-ledger-scroll::-webkit-scrollbar-thumb { background: var(--border); }

        .tr-table { width: 100%; border-collapse: collapse; text-align: left; }
        .tr-table thead { position: sticky; top: 0; background: #f8fafc; z-index: 1; }
        .tr-table th {
          padding: 12px 20px;
          font-size: 9px; font-weight: 800; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.15em;
          border-bottom: 2px solid var(--border);
        }
        .tr-table td { padding: 14px 20px; border-bottom: 1px solid var(--border); }
        .tr-rnd { font-family: var(--font-mono); font-size: 10px; font-weight: 800; color: var(--text-main); }
        .tr-node-id { display: block; font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--text-main); }
        .tr-node-ver { font-size: 8px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; }
        .tr-mono { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
        .tr-acc { font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--success); }
        .tr-text-right { text-align: right; }
        .tr-verified-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 8px; background: #f0fdf4; border: 1px solid #dcfce7;
          border-radius: 2px; font-size: 8px; font-weight: 800; color: #166534;
          text-transform: uppercase; letter-spacing: 0.1em;
        }

        .tr-script-card { min-height: 320px; }
        .tr-file-tag { font-size: 9px; font-weight: 700; color: var(--text-muted); padding: 2px 8px; background: var(--bg-main); border: 1px solid var(--border); margin-left: 8px; }
        .tr-script-body { padding: 24px; background: #fff; flex: 1; overflow-y: auto; }
        .tr-script-body pre { margin: 0; font-family: var(--font-mono); font-size: 11px; line-height: 1.6; color: var(--text-main); opacity: 0.8; }

        /* ─── Right Column ─── */
        .tr-metrics-card { min-height: 400px; }
        .tr-metrics-legend { display: flex; gap: 16px; }
        .tr-legend-item { display: flex; align-items: center; gap: 8px; font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
        .tr-dot { width: 10px; height: 2px; }
        .tr-dot-primary { background: var(--primary); }
        .tr-dot-error { background: var(--error); }
        .tr-metrics-body { padding: 32px; background: #fff; flex: 1; }

        .tr-console {
          background: #0f172a;
          border: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          min-height: 350px;
        }
        .tr-console-header {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.02);
        }
        .tr-console-title { display: flex; align-items: center; gap: 10px; font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.15em; }
        .tr-console-clear { background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; cursor: pointer; }
        .tr-console-clear:hover { background: rgba(255,255,255,0.05); color: #fff; }
        
        .tr-console-body { padding: 24px; overflow-y: auto; flex: 1; font-family: var(--font-mono); font-size: 11px; line-height: 1.8; color: rgba(255,255,255,0.5); }
        .tr-console-line { display: flex; gap: 16px; margin-bottom: 4px; }
        .tr-timestamp { color: rgba(255,255,255,0.15); flex-shrink: 0; }
        .tr-log-msg { white-space: pre-wrap; }
        .tr-log-success { color: var(--primary); }
        .tr-log-error { color: var(--error); }
        .tr-console-cursor { display: flex; align-items: center; gap: 16px; }
        .tr-cursor-char { width: 6px; height: 12px; background: var(--primary); animation: tr-blink 1s step-end infinite; }
        @keyframes tr-blink { 50% { opacity: 0; } }
        .tr-log-msg-muted { color: rgba(255,255,255,0.3); }

        .tr-empty-state { padding: 48px; text-align: center; font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.25em; opacity: 0.4; }
      `}</style>
    </div>
  );
};
