import React, { useState } from 'react';
import { ShieldCheck, Terminal, Copy, Check, X, Cpu, Globe, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = ({ status }) => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [copiedCloud, setCopiedCloud] = useState(false);
  const [copiedLocal, setCopiedLocal] = useState(false);

  const cloudCommand = 'curl -sSL https://mdark4025-cybronites.hf.space/join.py | python3';
  const localCommand = 'python join.py';

  const handleCopyCloud = () => {
    navigator.clipboard.writeText(cloudCommand);
    setCopiedCloud(true);
    setTimeout(() => setCopiedCloud(false), 2000);
  };

  const handleCopyLocal = () => {
    navigator.clipboard.writeText(localCommand);
    setCopiedLocal(true);
    setTimeout(() => setCopiedLocal(false), 2000);
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
          >
            <Terminal size={13} className="hd-btn-icon" />
            <span>Connect Node</span>
          </button>

          <div className="hd-status-pill">
            <div className="hd-status-dot" />
            <span className="hd-status-text">{status}</span>
          </div>

          <div className="hd-secure-pill">
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
                    <p className="hd-modal-desc">Zero-file setup • Instant federated network enrollment</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="hd-modal-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="hd-modal-body">
                {/* Cloud Command (Recommended for all external devices) */}
                <div className="hd-section">
                  <div className="hd-section-label">
                    <Globe size={13} className="text-emerald-600" />
                    <span>Option 1: Cloud & Remote Devices (No local files needed)</span>
                  </div>
                  <div className="hd-code-box">
                    <code className="hd-code-text">{cloudCommand}</code>
                    <button
                      onClick={handleCopyCloud}
                      className="hd-copy-btn"
                    >
                      {copiedCloud ? <Check size={12} className="hd-check-icon" /> : <Copy size={12} />}
                      <span>{copiedCloud ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Local Command (For working in this cloned repository) */}
                <div className="hd-section">
                  <div className="hd-section-label">
                    <Laptop size={13} className="text-slate-600" />
                    <span>Option 2: Local Workspace (In this project folder)</span>
                  </div>
                  <div className="hd-code-box">
                    <code className="hd-code-text">{localCommand}</code>
                    <button
                      onClick={handleCopyLocal}
                      className="hd-copy-btn"
                    >
                      {copiedLocal ? <Check size={12} className="hd-check-icon" /> : <Copy size={12} />}
                      <span>{copiedLocal ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Steps */}
                <div className="hd-steps-list">
                  <div className="hd-step-item">
                    <span className="hd-step-num">1</span>
                    <span className="hd-step-text"><strong>Runs automatically:</strong> Provisions PyTorch / NumPy dependencies on device.</span>
                  </div>
                  <div className="hd-step-item">
                    <span className="hd-step-num">2</span>
                    <span className="hd-step-text"><strong>Interactive Selection:</strong> Prompts you in terminal to choose the platform model or your own custom file.</span>
                  </div>
                  <div className="hd-step-item">
                    <span className="hd-step-num">3</span>
                    <span className="hd-step-text"><strong>Realtime Sync:</strong> Your chosen model code and SHA-256 hash stream live into the Training Workspace.</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="hd-modal-footer">
                <span className="hd-footer-info">
                  <Cpu size={13} className="text-emerald-600" />
                  Supports Apple MPS, CUDA GPUs & CPU cores
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
        .hd-modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
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
          background: #090E1A;
          border: 1px solid #1E293B;
          border-radius: 6px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .hd-code-text {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          color: #34D399;
          white-space: nowrap;
          overflow-x: auto;
          user-select: all;
        }
        .hd-copy-btn {
          flex-shrink: 0;
          height: 28px;
          padding: 0 12px;
          background: #1E293B;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff !important;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .hd-copy-btn:hover {
          background: #334155;
        }
        .hd-check-icon {
          color: #34D399;
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

