import React, { useState } from 'react';
import { Network, ShieldCheck, Activity, Terminal, Copy, Check, X, ExternalLink, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = ({ status }) => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-detect host or default to production Space
  const hostUrl = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
    ? window.location.origin
    : 'https://mdark4025-cybronites.hf.space';

  const curlCommand = `curl -sSL ${hostUrl}/join.py | python3`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="shell-header glass-header flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary flex items-center justify-center text-white font-serif text-xl shadow-lg">FL</div>
          <div className="flex flex-col">
            <h1 className="type-l2 serif text-text-main leading-tight tracking-tight font-medium">
              AI Guardian <span className="text-accent underline decoration-accent/30 decoration-2 underline-offset-4 font-serif italic italic">Platform</span>
            </h1>
            <span className="type-label-bold opacity-30">INSTITUTIONAL FEDERATED LAB</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick Connect Node Button */}
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#364E68] text-white hover:bg-[#2B3E53] rounded text-[11px] font-semibold tracking-wide transition-all shadow-sm cursor-pointer"
          >
            <Terminal size={13} className="text-emerald-300" />
            <span>Connect Node</span>
          </button>

          <div className="flex items-center gap-3 px-4 py-1.5 bg-success/5 border border-success/20 rounded-sm">
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_12px_var(--success)] animate-pulse" />
            <span className="type-label-bold text-success">{status}</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-primary/5 border border-primary/20 rounded-sm group hover:border-accent/50 transition-colors">
            <ShieldCheck size={14} className="text-primary group-hover:text-accent transition-colors" />
            <span className="type-label-bold text-primary italic">Node Secured</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
            onClick={() => setShowConnectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-[#E2E6EC] rounded-lg shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E6EC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#364E68] text-emerald-400 flex items-center justify-center">
                    <Terminal size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">Connect Any Device Node</h3>
                    <p className="text-[11px] text-[#64748B]">Zero-file setup • Instant federated network enrollment</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="p-1 rounded hover:bg-slate-200 text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="text-xs text-[#334155] leading-relaxed">
                  Run this single command on <strong>any device</strong> (Mac, Linux, Windows, Colab). No local files needed:
                </div>

                {/* Command Snippet Box */}
                <div className="bg-[#090E1A] p-3.5 rounded-md border border-slate-800 flex items-center justify-between gap-3 font-mono text-xs">
                  <code className="text-emerald-400 overflow-x-auto whitespace-nowrap select-all">
                    {curlCommand}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Steps Explanation */}
                <div className="pt-2 space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-[#475569]">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                    <span><strong>Runs automatically:</strong> Auto-provisions lightweight dependencies (NumPy/Torch) on device.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#475569]">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                    <span><strong>Interactive Choice:</strong> Prompts you in terminal to use the platform model or choose your own custom Python script.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#475569]">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                    <span><strong>Realtime Sync:</strong> Your chosen model code and cryptographic SHA-256 fingerprint appear instantly in the Training Workspace.</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2E6EC] flex items-center justify-between text-[11px] text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <Cpu size={12} className="text-emerald-600" />
                  Supports Apple MPS, CUDA GPUs & CPU cores
                </span>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-1 bg-white border border-[#CBD5E1] rounded text-[#0F172A] font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
