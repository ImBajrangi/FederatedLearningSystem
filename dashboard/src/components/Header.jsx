import React, { useState, useEffect } from 'react';
import { ShieldCheck, Terminal, Copy, Check, X, Cpu, Globe, Laptop, Download, Code2, FileCode, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = ({ status }) => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'download' | 'code'
  const [copiedCloud, setCopiedCloud] = useState(false);
  const [copiedLocal, setCopiedLocal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [scriptContent, setScriptContent] = useState('');
  const [isLoadingScript, setIsLoadingScript] = useState(false);

  const cloudCommand = 'curl -sSL https://mdark4025-cybronites.hf.space/join.py | python3';
  const downloadAndRunCommand = 'curl -sSL https://mdark4025-cybronites.hf.space/join.py -o join.py && python3 join.py';
  const localCommand = 'python3 join.py';

  // Fetch join.py code dynamically when code tab is viewed
  useEffect(() => {
    if (showConnectModal && !scriptContent) {
      setIsLoadingScript(true);
      fetch('/join.py')
        .then(res => {
          if (!res.ok) throw new Error('Local route error');
          return res.text();
        })
        .then(text => {
          setScriptContent(text);
          setIsLoadingScript(false);
        })
        .catch(() => {
          // Fallback fetch to cloud space
          fetch('https://mdark4025-cybronites.hf.space/join.py')
            .then(res => res.text())
            .then(text => {
              setScriptContent(text);
              setIsLoadingScript(false);
            })
            .catch(() => {
              setIsLoadingScript(false);
            });
        });
    }
  }, [showConnectModal, scriptContent]);

  const handleCopyCloud = () => {
    navigator.clipboard.writeText(cloudCommand);
    setCopiedCloud(true);
    setTimeout(() => setCopiedCloud(false), 2000);
  };

  const handleCopyLocal = () => {
    navigator.clipboard.writeText(downloadAndRunCommand);
    setCopiedLocal(true);
    setTimeout(() => setCopiedLocal(false), 2000);
  };

  const handleCopyCode = () => {
    if (scriptContent) {
      navigator.clipboard.writeText(scriptContent);
    } else {
      navigator.clipboard.writeText(cloudCommand);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadFile = () => {
    if (scriptContent) {
      const blob = new Blob([scriptContent], { type: 'text/x-python' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'join.py';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      window.open('https://mdark4025-cybronites.hf.space/join.py', '_blank');
    }
  };

  return (
    <>
      <header className="hd-root">
        <div className="hd-left">
          <div className="hd-logo">FL</div>
          <div className="hd-titles">
            <h1 className="hd-main-title">
              AI Guardian <span className="hd-accent-italic">Platform</span>
            </h1>
            <span className="hd-sub-title">INSTITUTIONAL FEDERATED LAB</span>
          </div>
        </div>

        <div className="hd-right">
          {/* Quick Connect Node Button */}
          <button
            onClick={() => setShowConnectModal(true)}
            className="hd-connect-btn"
            data-tooltip="Pair new distributed compute nodes with instant 1-line command or download code directly"
            data-tooltip-pos="bottom"
          >
            <Terminal size={13} className="hd-btn-icon" />
            <span>Connect Node</span>
          </button>

          <div 
            className={`hd-status-pill ${
              status === 'TRAINING' ? 'hd-status-training' :
              status === 'OFFLINE' ? 'hd-status-offline' :
              status === 'COMPLETE' || status === 'FINISHED' ? 'hd-status-complete' :
              status === 'READY' || status === 'WAITING' ? 'hd-status-ready' : 'hd-status-idle'
            }`}
            data-tooltip={`Orchestrator state: ${status || 'ONLINE'} across active cluster`}
            data-tooltip-pos="bottom"
          >
            <div className={`hd-status-dot ${status === 'TRAINING' ? 'animate-pulse' : ''}`} />
            <span className="hd-status-text">
              {status === 'TRAINING' ? 'LIVE TRAINING' :
               status === 'OFFLINE' ? 'OFFLINE' :
               status === 'COMPLETE' || status === 'FINISHED' ? 'COMPLETED' :
               status === 'READY' || status === 'WAITING' ? 'READY (CONNECTED)' :
               status || 'ONLINE'}
            </span>
          </div>

          <div 
            className="hd-secure-pill"
            data-tooltip="Differential privacy (ε, δ) & TLS gradient encryption active"
            data-tooltip-pos="bottom"
          >
            <ShieldCheck size={14} className="hd-shield-icon" />
            <span className="hd-secure-text">Node Secured</span>
          </div>
        </div>
      </header>

      {/* Connect Node Instruction Modal */}
      <AnimatePresence>
        {showConnectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hd-modal-backdrop"
            onClick={() => setShowConnectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="hd-modal-box"
            >
              {/* Modal Header */}
              <div className="hd-modal-header">
                <div className="hd-modal-title-wrap">
                  <div className="hd-modal-icon-badge">
                    <Terminal size={16} />
                  </div>
                  <div>
                    <h3 className="hd-modal-title">Connect Any Device Node</h3>
                    <p className="hd-modal-desc">Instant federated network enrollment • No repo cloning required</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="hd-modal-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="hd-modal-tabs">
                <button
                  onClick={() => setActiveTab('stream')}
                  className={`hd-tab-btn ${activeTab === 'stream' ? 'active' : ''}`}
                >
                  <Globe size={13} />
                  <span>1-Line Universal (Zero Files)</span>
                </button>
                <button
                  onClick={() => setActiveTab('download')}
                  className={`hd-tab-btn ${activeTab === 'download' ? 'active' : ''}`}
                >
                  <Download size={13} />
                  <span>Download join.py</span>
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`hd-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                >
                  <Code2 size={13} />
                  <span>Direct Code</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="hd-modal-body">
                {activeTab === 'stream' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col gap-4"
                  >
                    <div className="hd-section">
                      <div className="hd-section-label">
                        <Globe size={13} className="text-emerald-600" />
                        <span>Instant Universal Terminal Directive (Runs directly in memory)</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-1">
                        Paste this into any Mac, Linux, Windows WSL terminal, or Cloud GPU. Automatically verifies hardware, provisions ML dependencies, and connects:
                      </p>
                      <div className="hd-code-box">
                        <code className="hd-code-text">{cloudCommand}</code>
                        <button
                          onClick={handleCopyCloud}
                          className="hd-copy-btn"
                        >
                          {copiedCloud ? <Check size={12} className="hd-check-icon text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedCloud ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Steps */}
                    <div className="hd-steps-list">
                      <div className="hd-step-item">
                        <span className="hd-step-num">1</span>
                        <span className="hd-step-text"><strong>Zero Setup:</strong> No manual downloading or cloning needed.</span>
                      </div>
                      <div className="hd-step-item">
                        <span className="hd-step-num">2</span>
                        <span className="hd-step-text"><strong>Model Selection:</strong> Prompts you in terminal to choose the network model or custom Python architecture.</span>
                      </div>
                      <div className="hd-step-item">
                        <span className="hd-step-num">3</span>
                        <span className="hd-step-text"><strong>Encrypted Privacy:</strong> Applies Local Differential Privacy before gradient transmission.</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'download' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col gap-4"
                  >
                    <div className="hd-section">
                      <div className="hd-section-label">
                        <Download size={13} className="text-blue-600" />
                        <span>Download Script or Run Auto-Download Command</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-1">
                        If you want the standalone <code>join.py</code> script file on your machine:
                      </p>

                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={handleDownloadFile}
                          className="hd-action-download-btn"
                        >
                          <Download size={13} />
                          <span>Download join.py Script</span>
                        </button>
                      </div>

                      <div className="hd-section-label mt-2">
                        <Laptop size={13} className="text-slate-600" />
                        <span>Or run 1-line auto-download and execute:</span>
                      </div>
                      <div className="hd-code-box">
                        <code className="hd-code-text">{downloadAndRunCommand}</code>
                        <button
                          onClick={handleCopyLocal}
                          className="hd-copy-btn"
                        >
                          {copiedLocal ? <Check size={12} className="hd-check-icon text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedLocal ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 flex flex-col gap-1">
                      <span className="font-semibold text-slate-900">Custom CLI Options:</span>
                      <code className="text-[10px] text-slate-800 bg-white p-1.5 rounded border border-slate-200 font-mono">
                        python3 join.py --name "Hospital-Alpha" --epochs 2
                      </code>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'code' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode size={14} className="text-slate-700" />
                        <span className="text-[11px] font-bold text-slate-800">join.py Standalone Client Source Code</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono border border-slate-200">
                          {scriptContent ? `${scriptContent.split('\n').length} lines` : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyCode}
                          className="hd-copy-code-full-btn"
                        >
                          {copiedCode ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedCode ? 'Code Copied!' : 'Copy Full Python Code'}</span>
                        </button>
                        <button
                          onClick={handleDownloadFile}
                          className="hd-copy-code-full-btn"
                        >
                          <Download size={12} />
                          <span>Save as File</span>
                        </button>
                      </div>
                    </div>

                    <div className="hd-raw-code-container">
                      <pre className="hd-raw-code-text">
                        {isLoadingScript ? (
                          <span className="text-slate-400 italic">Fetching complete join.py script from coordinator...</span>
                        ) : scriptContent ? (
                          scriptContent
                        ) : (
                          `# You can copy the universal command:\n${cloudCommand}`
                        )}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="hd-modal-footer">
                <span className="hd-footer-info">
                  <Cpu size={13} className="text-emerald-600" />
                  Supports Apple MPS, CUDA GPUs & CPU NumPy Vector cores
                </span>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="hd-footer-btn"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .hd-root {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 28px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border, #E2E6EC);
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .hd-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .hd-logo {
          width: 40px;
          height: 40px;
          background: #364E68;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(54, 78, 104, 0.2);
          border-radius: 4px;
        }
        .hd-titles {
          display: flex;
          flex-direction: column;
        }
        .hd-main-title {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 20px;
          font-weight: 600;
          color: #1E293B;
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .hd-accent-italic {
          font-style: italic;
          color: #B8860B;
          text-decoration: underline;
          text-decoration-color: rgba(184, 134, 11, 0.3);
          text-underline-offset: 4px;
        }
        .hd-sub-title {
          font-size: 9px;
          font-weight: 800;
          color: #94A3B8;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .hd-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .hd-connect-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 32px;
          padding: 0 14px;
          background: #364E68;
          color: #ffffff !important;
          border: none;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(54, 78, 104, 0.15);
        }
        .hd-connect-btn:hover {
          background: #27384A;
          transform: translateY(-1px);
        }
        .hd-btn-icon {
          color: #34D399;
        }
        .hd-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 32px;
          padding: 0 14px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        .hd-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
          animation: hd-pulse 2s infinite;
        }
        .hd-status-text {
          font-size: 10px;
          font-weight: 800;
          color: #047857;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .hd-status-offline {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.25);
        }
        .hd-status-offline .hd-status-dot {
          background: #ef4444;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
          animation: none;
        }
        .hd-status-offline .hd-status-text {
          color: #b91c1c;
        }
        .hd-status-ready {
          background: rgba(14, 165, 233, 0.08);
          border-color: rgba(14, 165, 233, 0.25);
        }
        .hd-status-ready .hd-status-dot {
          background: #0ea5e9;
          box-shadow: 0 0 8px rgba(14, 165, 233, 0.6);
          animation: none;
        }
        .hd-status-ready .hd-status-text {
          color: #0369a1;
        }
        .hd-status-complete {
          background: rgba(139, 92, 246, 0.08);
          border-color: rgba(139, 92, 246, 0.25);
        }
        .hd-status-complete .hd-status-dot {
          background: #8b5cf6;
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
          animation: none;
        }
        .hd-status-complete .hd-status-text {
          color: #6d28d9;
        }
        .hd-status-idle {
          background: rgba(100, 116, 139, 0.08);
          border-color: rgba(100, 116, 139, 0.25);
        }
        .hd-status-idle .hd-status-dot {
          background: #64748b;
          box-shadow: none;
          animation: none;
        }
        .hd-status-idle .hd-status-text {
          color: #475569;
        }
        .hd-secure-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 32px;
          padding: 0 14px;
          background: rgba(54, 78, 104, 0.06);
          border: 1px solid rgba(54, 78, 104, 0.18);
          border-radius: 4px;
        }
        .hd-shield-icon {
          color: #364E68;
        }
        .hd-secure-text {
          font-size: 10px;
          font-weight: 700;
          color: #364E68;
          font-style: italic;
          letter-spacing: 0.04em;
        }

        /* ── Modal Styles ── */
        .hd-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(6px);
          padding: 16px;
        }
        .hd-modal-box {
          background: #ffffff;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
          max-width: 580px;
          width: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .hd-modal-header {
          padding: 18px 24px;
          background: #F8FAFC;
          border-bottom: 1px solid #E2E6EC;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hd-modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hd-modal-icon-badge {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background: #364E68;
          color: #34D399;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hd-modal-title {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
          line-height: 1.2;
        }
        .hd-modal-desc {
          font-size: 11px;
          color: #64748B;
          margin: 2px 0 0 0;
        }
        .hd-modal-close-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          border-radius: 4px;
          color: #64748B;
          cursor: pointer;
          transition: all 0.15s;
        }
        .hd-modal-close-btn:hover {
          background: #E2E8F0;
          color: #0F172A;
        }
        .hd-modal-tabs {
          display: flex;
          background: #F1F5F9;
          border-bottom: 1px solid #CBD5E1;
          padding: 6px 16px 0 16px;
          gap: 6px;
        }
        .hd-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          border: none;
          background: transparent;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          border-radius: 4px 4px 0 0;
        }
        .hd-tab-btn:hover {
          color: #0F172A;
          background: rgba(255, 255, 255, 0.5);
        }
        .hd-tab-btn.active {
          color: #0F172A;
          background: #FFFFFF;
          border-bottom: 2px solid #364E68;
          box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.02);
        }
        .hd-action-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #364E68;
          color: #ffffff;
          border: none;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 6px rgba(54, 78, 104, 0.15);
        }
        .hd-action-download-btn:hover {
          background: #27384A;
          transform: translateY(-1px);
        }
        .hd-copy-code-full-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          color: #1E293B;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .hd-copy-code-full-btn:hover {
          background: #F8FAFC;
          border-color: #94A3B8;
        }
        .hd-raw-code-container {
          background: #0F172A;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 12px;
          max-height: 260px;
          overflow-y: auto;
          overflow-x: auto;
        }
        .hd-raw-code-text {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          line-height: 1.5;
          color: #E2E8F0;
          margin: 0;
          white-space: pre;
        }
        .hd-modal-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #ffffff;
        }
        .hd-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hd-section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #334155;
          letter-spacing: 0.02em;
        }
        .hd-code-box {
          background: #F8FAFC;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
        }
        .hd-code-text {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 600;
          color: #0F172A;
          white-space: nowrap;
          overflow-x: auto;
          user-select: all;
        }
        .hd-copy-btn {
          flex-shrink: 0;
          height: 28px;
          padding: 0 12px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #0F172A !important;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.15s ease-in-out;
        }
        .hd-copy-btn:hover {
          background: #F1F5F9;
          border-color: #94A3B8;
        }
        .hd-check-icon {
          color: #059669;
        }
        .hd-steps-list {
          padding-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .hd-step-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .hd-step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #F1F5F9;
          color: #334155;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .hd-step-text {
          font-size: 11px;
          color: #475569;
          line-height: 1.5;
        }
        .hd-modal-footer {
          padding: 14px 24px;
          background: #F8FAFC;
          border-top: 1px solid #E2E6EC;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hd-footer-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #64748B;
        }
        .hd-footer-btn {
          height: 30px;
          padding: 0 16px;
          background: #ffffff;
          border: 1px solid #CBD5E1;
          color: #0F172A;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .hd-footer-btn:hover {
          background: #F1F5F9;
        }

        @keyframes hd-pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

