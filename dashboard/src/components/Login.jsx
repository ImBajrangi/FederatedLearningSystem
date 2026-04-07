import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, Cpu, Key, ChevronRight, Activity, Terminal } from 'lucide-react';

export const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState(0); // 0: Idle, 1: Scanning, 2: Finalizing

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsAuthenticating(true);
    setAuthStep(1);

    // Simulate Institutional Handshake
    setTimeout(() => {
      setAuthStep(2);
      setTimeout(() => {
        onLogin({ id: username, role: 'Senior Researcher', node: 'NODE_07' });
      }, 800);
    }, 1500);
  };

  return (
    <div className="login-root">
      <div className="login-bg-overlay" />
      <div className="login-grid" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="login-container"
      >
        {/* Header Block */}
        <header className="login-header">
          <div className="login-logo-wrap">
            <div className="login-logo">
              <ShieldCheck size={24} style={{ color: '#364E68' }} />
            </div>
            <div className="login-title-group">
              <h1 className="login-h1">Secure Access Portal</h1>
              <span className="login-subtitle">Federated Learning Institutional Node</span>
            </div>
          </div>
          <div className="login-status-badge">
            <div className="login-dot pulse" />
            <span>ENCRYPTED</span>
          </div>
        </header>

        {/* Main Interface */}
        <div className="login-body">
          <AnimatePresence mode="wait">
            {!isAuthenticating ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit}
                className="login-form"
              >
                <div className="login-field-group">
                  <label className="login-label">Institutional Identity</label>
                  <div className="login-input-wrap">
                    <Cpu size={14} className="login-input-icon" />
                    <input 
                      type="text" 
                      placeholder="e.g. RESEARCHER_ID"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="login-input"
                    />
                  </div>
                </div>

                <div className="login-field-group">
                  <label className="login-label">Access Key</label>
                  <div className="login-input-wrap">
                    <Key size={14} className="login-input-icon" />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="login-input"
                    />
                  </div>
                </div>

                <button type="submit" className="login-submit-btn">
                  <span>Sign In</span>
                  <ChevronRight size={14} />
                  <div className="login-btn-glimmer" />
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="auth"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="login-auth-status"
              >
                <div className="login-auth-spinner">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="login-spinner-ring"
                  />
                  <Terminal size={24} className="login-spinner-icon" />
                </div>
                
                <div className="login-auth-logs">
                  <div className={`login-log-line ${authStep >= 1 ? 'active' : ''}`}>
                    <span className="log-prefix">CC-01:</span>
                    <span className="log-msg">Scanning credentials...</span>
                  </div>
                  <div className={`login-log-line ${authStep >= 2 ? 'active' : ''}`}>
                    <span className="log-prefix">CC-02:</span>
                    <span className="log-msg">Handshake verified. FINALIZING.</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <footer className="login-footer">
          <div className="login-footer-item">
            <Activity size={10} />
            <span>SESSION: 4MS LATENCY</span>
          </div>
          <div className="login-footer-item">
            <Lock size={10} />
            <span>V_2.4 CRYPTO BRIDGE</span>
          </div>
        </footer>
      </motion.div>

      <style>{`
        .login-root {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #fdfdfb;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: var(--font-sans);
          overflow: hidden;
        }

        .login-bg-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(54,78,104,0.03) 100%);
        }

        .login-grid {
          position: absolute;
          inset: 0;
          background-image: var(--bg-grid-pattern);
          background-size: var(--bg-grid-size);
          opacity: 0.1;
        }

        .login-container {
          width: 420px;
          background: #fff;
          border: 1px solid var(--border);
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.08);
          position: relative;
          z-index: 10;
        }

        .login-header {
          padding: 32px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: rgba(253,253,251,0.5);
        }

        .login-logo-wrap { display: flex; align-items: flex-start; gap: 16px; }
        .login-logo {
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-main);
          border: 1px solid var(--border);
        }

        .login-title-group { display: flex; flex-direction: column; gap: 2px; }
        .login-h1 { font-size: 20px; margin: 0; color: var(--text-main); font-weight: 500; font-family: var(--font-serif); }
        .login-subtitle { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-muted); opacity: 0.6; }

        .login-status-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 10px;
          background: #f0fdf4;
          border: 1px solid #dcfce7;
          font-size: 8px;
          font-weight: 900;
          color: #166534;
          letter-spacing: 0.1em;
        }

        .login-body { padding: 40px 32px; min-height: 280px; }

        .login-form { display: flex; flex-direction: column; gap: 24px; }
        .login-field-group { display: flex; flex-direction: column; gap: 8px; }
        .login-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-muted); }

        .login-input-wrap {
          position: relative;
          height: 48px;
          display: flex;
          align-items: center;
          border-bottom: 2px solid var(--border);
          transition: all 0.2s;
        }
        .login-input-wrap:focus-within { border-color: var(--primary); }

        .login-input-icon { margin-right: 16px; color: var(--text-muted); opacity: 0.5; }
        .login-input {
          flex: 1;
          height: 100%;
          background: none;
          border: none;
          font-size: 14px;
          color: var(--text-main);
          font-weight: 500;
        }
        .login-input:focus { outline: none; }
        .login-input::placeholder { color: var(--text-muted); opacity: 0.3; }

        .login-submit-btn {
          height: 52px;
          background: var(--primary);
          color: #fff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
          margin-top: 8px;
        }
        .login-submit-btn:hover { background: #1e3a5f; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(54,78,104,0.2); }
        .login-submit-btn:active { transform: translateY(0); }

        .login-auth-status {
          display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 32px;
        }
        .login-auth-spinner { position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; }
        .login-spinner-ring {
          position: absolute; inset: 0;
          border: 2px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
        }
        .login-spinner-icon { color: var(--primary); opacity: 0.4; }

        .login-auth-logs { width: 100%; display: flex; flex-direction: column; gap: 8px; }
        .login-log-line {
          font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); opacity: 0.3; display: flex; gap: 12px; transition: all 0.3s;
        }
        .login-log-line.active { opacity: 1; color: var(--text-main); }
        .log-prefix { color: var(--primary); font-weight: 700; width: 45px; }

        .login-footer {
          padding: 24px 32px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          background: rgba(253,253,251,0.5);
        }
        .login-footer-item { display: flex; align-items: center; gap: 8px; font-size: 8px; font-weight: 800; color: var(--text-muted); opacity: 0.4; letter-spacing: 0.1em; }

        .pulse { animation: login-pulse 2s infinite; }
        @keyframes login-pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};
