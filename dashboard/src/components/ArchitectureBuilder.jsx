import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDown, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Settings2, 
  Lock, 
  Share2, 
  Server, 
  Download, 
  Save, 
  PanelRightClose, 
  PanelRightOpen, 
  Box, 
  Terminal,
  Activity,
  Workflow,
  ChevronRight,
  Info,
  Code
} from 'lucide-react';

const LayerNode = ({ type, name, active, onSelect }) => (
  <div className="flex flex-col items-center w-full relative">
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative select-none w-full max-w-[320px] p-6 cursor-pointer transition-all border ${
        active 
          ? 'border-primary bg-white shadow-sm' 
          : 'border-border bg-white hover:border-text-muted/30'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${active ? 'text-primary' : 'text-text-muted'}`}>
          {type}
        </span>
        {active && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
      </div>
      <h4 className={`text-sm font-bold tracking-tight ${active ? 'text-text-main' : 'text-text-muted'} leading-snug serif uppercase`}>
        {name}
      </h4>
    </motion.div>
    
    <div className="h-12 flex flex-col items-center justify-center">
      <div className={`w-px h-full bg-border relative`}>
        <ArrowDown size={12} className="absolute -bottom-1 -left-[5.5px] text-border" />
      </div>
    </div>
  </div>
);

export const ArchitectureBuilder = ({ onAction }) => {
  const [activeNode, setActiveNode] = useState('global');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const nodeDetails = {
    global: {
      title: 'Aggregation Hub',
      desc: 'Central orchestration layer focused on the secure aggregation of localized weighting vectors.',
      math: 'W_{agg} = \\sum_{i=1}^n \\alpha_i W_i',
      params: [
        { label: 'Security Model', value: 'Homomorphic Encryption' },
        { label: 'Network Timeout', value: '5000ms' },
        { label: 'Aggregation Algo', value: 'FedAvg-Secure' }
      ],
      icon: <Server size={18} />
    },
    blockchain: {
      title: 'Audit Ledger',
      desc: 'Immutable permissioned consensus mechanism providing identity verification and reputational proofs.',
      math: '\\mathcal{L} \\gets \\mathcal{L} \\cup \\{ B_k \\}',
      params: [
        { label: 'Consensus', value: 'Proof-of-Authority' },
        { label: 'Block Interval', value: '2.0s' },
        { label: 'Encryption', value: 'ECDSA-Secp256k1' }
      ],
      icon: <Workflow size={18} />
    },
    security: {
      title: 'Compliance Node',
      desc: 'Real-time policy enforcement engine utilizing differentially private noise calibration.',
      math: '\\mathcal{M}(d) = f(d) + \\mathcal{N}(0, \\sigma^2)',
      params: [
        { label: 'DP Epsilon', value: 'ε=1.2' },
        { label: 'Anomaly Bound', value: '1.96σ' },
        { label: 'Validation Mode', value: 'Strict' }
      ],
      icon: <Lock size={18} />
    },
    aggregation: {
      title: 'Compute Edge',
      desc: 'Decentralized institutional clusters executing local stochastic gradient descent iterations.',
      math: '\\nabla_{\\theta} J(\\theta) \\approx \\frac{1}{m} \\sum \\nabla \\ell(f(x_i), y_i)',
      params: [
        { label: 'Hardware', value: 'NVIDIA H100 Cluster' },
        { label: 'Quantization', value: 'INT8 / BF16' },
        { label: 'Node Capacity', value: 'High Density' }
      ],
      icon: <Cpu size={18} />
    }
  };

  const current = nodeDetails[activeNode];

  return (
    <div className="flex relative">
      {/* 1. Left Component Palette (Textbook style list) */}
      <div className="w-[280px] border-r border-border bg-bg-surface flex flex-col shrink-0">
         <div className="p-10 border-b border-border bg-bg-main/50">
            <span className="text-[10px] font-bold text-text-main uppercase tracking-[0.3em] serif">Components</span>
         </div>
         <div className="flex-1 overflow-y-auto py-8">
            <div className="px-10 mb-8">
               <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Protocol Layers</span>
            </div>
            {['Input Gateway', 'Identity Provider', 'Auth Service', 'Relay Node'].map((item, i) => (
              <div key={i} className="px-10 py-3 flex items-center justify-between group cursor-pointer hover:bg-bg-main transition-colors">
                 <span className="text-xs font-medium text-text-muted group-hover:text-primary transition-colors">{item}</span>
                 <div className="w-1.5 h-1.5 rounded-full border border-border group-hover:bg-primary/20 transition-all" />
              </div>
            ))}
            
            <div className="px-10 mt-12 mb-8">
               <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Compute Units</span>
            </div>
            {['GPU Cluster', 'TPU Node', 'FPGA Edge', 'CPU Worker'].map((item, i) => (
              <div key={i} className="px-10 py-3 flex items-center justify-between group cursor-pointer hover:bg-bg-main transition-colors">
                 <span className="text-xs font-medium text-text-muted group-hover:text-primary transition-colors">{item}</span>
                 <div className="w-1.5 h-1.5 rounded-full border border-border group-hover:bg-primary/20 transition-all" />
              </div>
            ))}
         </div>
      </div>

      {/* 2. Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-main relative min-h-[800px]">
        <div className="h-16 shrink-0 flex items-center justify-between border-b border-border px-10 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 text-text-muted">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] serif italic">Architecture Canvas v1.2</span>
          </div>
          <div className="flex items-center gap-4">
             <button className="text-[10px] font-bold text-text-muted uppercase tracking-widest hover:text-primary transition-colors">Clear Grid</button>
             <div className="w-px h-4 bg-border" />
             <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Auto-Arrange</button>
          </div>
        </div>

        <div className="flex-1 p-16 relative z-10 custom-scrollbar">
          <div className="flex flex-col items-center max-w-2xl mx-auto">
            <LayerNode
              type="System Gateway"
              name="Aggregation Hub"
              active={activeNode === 'global'}
              onSelect={() => setActiveNode('global')}
            />
            <LayerNode
              type="Consensus Layer"
              name="Audit Ledger"
              active={activeNode === 'blockchain'}
              onSelect={() => setActiveNode('blockchain')}
            />
            <LayerNode
              type="Policy Logic"
              name="Compliance Node"
              active={activeNode === 'security'}
              onSelect={() => setActiveNode('security')}
            />
            <LayerNode
              type="Compute Cluster"
              name="Execution Edge"
              active={activeNode === 'aggregation'}
              onSelect={() => setActiveNode('aggregation')}
            />

            <div className="flex flex-col items-center mt-6">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-white shadow-sm">
                <ShieldCheck size={20} className="text-primary/40" />
              </div>
              <span className="text-[9px] uppercase font-bold text-text-muted mt-8 tracking-[0.3em] font-mono">
                Institutional Integrity verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Layer Inspector Panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            className="w-[400px] border-l border-border bg-bg-surface flex flex-col z-40 min-h-[800px]"
          >
            <div className="flex items-center justify-between px-10 py-6 border-b border-border shrink-0 bg-bg-main/30">
               <div className="flex items-center gap-4 text-primary">
                 <Settings2 size={16} />
                 <span className="text-[11px] font-bold uppercase tracking-[0.2em] serif">Layer Inspector</span>
               </div>
               <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-bg-main rounded-sm text-text-muted transition-all">
                  <PanelRightClose size={18} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <motion.div
                key={activeNode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-16"
              >
                <div className="space-y-8">
                  <div className="flex items-center gap-4 text-primary/40 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Protocol Node</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <h3 className="text-3xl font-bold text-text-main serif leading-tight">{current.title}</h3>
                  <p className="text-sm font-medium text-text-muted leading-relaxed italic">{current.desc}</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <Code size={13} className="text-primary/70 mb-[1px]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-main">Mathematical Formulation</span>
                  </div>
                  <div className="bg-white border border-border flex items-center justify-center min-h-[120px] shadow-inner-sm relative group overflow-hidden">
                     <div className="absolute inset-0 bg-bg-main opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" />
                     <span className="text-base font-mono text-primary font-bold tabular-nums select-all relative z-10 px-8 text-center leading-relaxed">
                        {current.math}
                     </span>
                  </div>
                  <div className="flex items-center gap-3 text-text-muted/60 pl-1">
                     <Info size={11} className="shrink-0" />
                     <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Formulation auto-updates with parameters</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="text-[10px] text-text-main font-bold uppercase tracking-[0.15em] pb-3 border-b border-border">Operational Parameters</div>
                  <div className="space-y-8">
                    {current.params.map((p, i) => (
                      <div key={i} className="group">
                        <div className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest mb-3 group-hover:text-primary transition-colors pl-1">
                           {p.label}
                        </div>
                        <div className="bg-white border border-border px-5 py-3.5 text-xs font-bold text-text-main flex items-center justify-between group-hover:border-primary/40 transition-all shadow-sm">
                           <span className="tabular-nums">{p.value}</span>
                           <div className="w-1 h-1 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Action Footer */}
            <div className="p-10 border-t border-border bg-bg-main/20">
               <button className="btn btn-primary w-full h-11 uppercase tracking-[0.2em] text-[10px] font-bold">
                  Update Configuration
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Re-open Sidebar Button */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-20 bg-white border border-border border-r-0 flex items-center justify-center hover:bg-bg-main transition-all z-40"
        >
          <PanelRightOpen size={16} className="text-primary" />
        </button>
      )}
    </div>
  );
};
