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
  Code,
  Layers,
  ChevronDown,
  Search,
  Settings,
  AlertTriangle
} from 'lucide-react';

const LayerNode = ({ type, name, active, onSelect, metadata }) => (
  <div className="flex flex-col items-center w-full relative">
    {/* Connector Top */}
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 border border-border bg-white rounded-full z-20 shadow-sm" />
    
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`relative z-10 w-[240px] border-[1.5px] bg-white shadow-sm cursor-pointer transition-all ${
        active 
          ? 'border-primary shadow-md ring-4 ring-primary/5' 
          : 'border-border hover:border-text-muted/50'
      }`}
    >
      {/* Node Header */}
      <div className={`px-3 py-1.5 border-b flex justify-between items-center ${active ? 'bg-primary/5 border-primary/20' : 'bg-bg-main/30 border-border'}`}>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-primary' : 'text-text-muted'}`}>
          {type}
        </span>
        {active ? <Settings size={12} className="text-primary" /> : <div className="w-1.5 h-1.5 rounded-full bg-border" />}
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-3">
        <h4 className={`text-xs font-bold uppercase tracking-tight leading-snug ${active ? 'text-text-main' : 'text-text-muted'}`}>
          {name}
        </h4>
        
        {metadata && (
          <div className="space-y-1">
            {metadata.map((m, i) => (
              <div key={i} className="flex justify-between items-center text-[9px] font-mono text-mono-sm">
                <span className="text-text-muted/60">{m.label}:</span>
                <span className={`font-bold ${active ? 'text-primary' : 'text-text-muted'}`}>{m.value}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Output Shape Indicator */}
        <div className="mt-2 pt-2 border-t border-border/40 flex justify-between items-center">
            <span className="text-[14px] text-text-muted/40">→</span>
            <span className={`text-[10px] font-mono px-1 py-0.5 bg-bg-main border border-border/60 ${active ? 'text-primary' : 'text-text-muted'}`}>
              (None, 26, 26, 32)
            </span>
        </div>
      </div>
    </motion.div>
    
    {/* Connector Bottom */}
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 border border-border bg-white rounded-full z-20 shadow-sm" />
    
    {/* Connection Flow Spine */}
    <div className="h-16 flex flex-col items-center justify-center relative">
      <div className={`w-[1px] h-full ${active ? 'bg-primary/40' : 'bg-border/60'} relative transition-colors duration-500`}>
        {active && (
           <motion.div 
             initial={{ top: 0 }}
             animate={{ top: '100%' }}
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             className="absolute w-full h-12 bg-gradient-to-b from-transparent via-primary/60 to-transparent"
           />
        )}
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
      type: 'Sequential Model',
      desc: 'Central orchestration layer focused on the secure aggregation of localized weighting vectors.',
      math: 'W_{agg} = \\sum_{i=1}^n \\alpha_i W_i',
      formula: 'S(i, j) = (I * K)(i, j) = Σ Σ I(i+m, j+n) K(m, n)',
      params: [
        { label: 'Security Model', value: 'Homomorphic Encryption' },
        { label: 'Network Timeout', value: '5000ms' },
        { label: 'Aggregation Algo', value: 'FedAvg-Secure' }
      ],
      metadata: [
        { label: 'filters', value: '32' },
        { label: 'kernel_size', value: '(3, 3)' }
      ],
      icon: <Server size={18} />
    },
    blockchain: {
      title: 'Audit Ledger',
      type: 'Consensus Layer',
      desc: 'Immutable permissioned consensus mechanism providing identity verification and reputational proofs.',
      math: '\\mathcal{L} \\gets \\mathcal{L} \\cup \\{ B_k \\}',
      formula: 'H(B_k) = SHA256(PreHash || Root || Data)',
      params: [
        { label: 'Consensus', value: 'Proof-of-Authority' },
        { label: 'Block Interval', value: '2.0s' },
        { label: 'Encryption', value: 'ECDSA-Secp256k1' }
      ],
      metadata: [
        { label: 'difficulty', value: 'N/A' },
        { label: 'finality', value: 'instant' }
      ],
      icon: <Workflow size={18} />
    },
    security: {
      title: 'Compliance Node',
      type: 'Policy Logic',
      desc: 'Real-time policy enforcement engine utilizing differentially private noise calibration.',
      math: '\\mathcal{M}(d) = f(d) + \\mathcal{N}(0, \\sigma^2)',
      formula: 'DP(ε, δ) : P(M(d) ∈ S) ≤ e^ε P(M(d\') ∈ S) + δ',
      params: [
        { label: 'DP Epsilon', value: 'ε=1.2' },
        { label: 'Anomaly Bound', value: '1.96σ' },
        { label: 'Validation Mode', value: 'Strict' }
      ],
      metadata: [
        { label: 'noise_scale', value: 'Laplacian' },
        { label: 'budget_limit', value: '100' }
      ],
      icon: <Lock size={18} />
    },
    aggregation: {
      title: 'Compute Edge',
      type: 'Execution Shard',
      desc: 'Decentralized institutional clusters executing local stochastic gradient descent iterations.',
      math: '\\nabla_{\\theta} J(\\theta) \\approx \\frac{1}{m} \\sum \\nabla \\ell(f(x_i), y_i)',
      formula: 'θ_{t+1} = θ_t - η · ∇J(θ_t)',
      params: [
        { label: 'Hardware', value: 'NVIDIA H100 Cluster' },
        { label: 'Quantization', value: 'INT8 / BF16' },
        { label: 'Node Capacity', value: 'High Density' }
      ],
      metadata: [
        { label: 'batch_size', value: '256' },
        { label: 'learning_rate', value: '1e-4' }
      ],
      icon: <Cpu size={18} />
    }
  };

  const current = nodeDetails[activeNode];

  return (
    <div className="flex relative h-full bg-white selection:bg-primary/10 overflow-hidden">
      {/* 1. Left Component Palette (Professional Sidebar) */}
      <aside className="w-[300px] border-r border-border bg-bg-surface flex flex-col shrink-0">
          <div className="p-6 border-b border-border">
             <h3 className="type-label text-text-muted mb-4 opacity-70">Layer Palette</h3>
             <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                <input 
                   type="text" 
                   placeholder="Search components..." 
                   className="w-full bg-bg-main border border-border pl-10 pr-4 py-2 text-[10px] uppercase font-bold tracking-widest placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 transition-all font-sans"
                />
             </div>
          </div>
          
         <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-8">
             {/* Core Layers */}
             <div>
                <div className="flex items-center justify-between mb-4 cursor-pointer group">
                   <span className="text-[10px] font-bold text-text-main uppercase tracking-widest">Core Layers</span>
                   <ChevronDown size={14} className="text-text-muted group-hover:text-text-main transition-colors" />
                </div>
                <div className="space-y-2">
                   {['Dense', 'Activation', 'Flatten', 'Input'].map((name) => (
                      <div key={name} className="p-3 border border-border bg-white text-[11px] font-bold text-text-muted uppercase tracking-tight flex items-center gap-3 cursor-move hover:border-primary hover:text-primary transition-all">
                         <div className="w-4 h-4 flex items-center justify-center opacity-40"><Layers size={14} /></div>
                         {name}
                      </div>
                   ))}
                </div>
             </div>

             {/* Convolutional */}
             <div>
                <div className="flex items-center justify-between mb-4 cursor-pointer group">
                   <span className="text-[10px] font-bold text-text-main uppercase tracking-widest">Convolutional</span>
                   <ChevronDown size={14} className="text-text-muted group-hover:text-text-main transition-colors" />
                </div>
                <div className="space-y-2">
                   {['Conv2D', 'Conv1D', 'MaxPooling2D', 'AveragePooling'].map((name) => (
                      <div key={name} className="p-3 border border-border bg-white text-[11px] font-bold text-text-muted uppercase tracking-tight flex items-center gap-3 cursor-move hover:border-primary hover:text-primary transition-all">
                         <div className="w-4 h-4 flex items-center justify-center opacity-40"><Box size={14} /></div>
                         {name}
                      </div>
                   ))}
                </div>
             </div>
         </div>
      </aside>

      {/* 2. Main Canvas Area (Grid Based) */}
      <main className="flex-1 relative bg-grid overflow-auto flex flex-col items-center py-16 custom-scrollbar">
         {/* Academic Connection Spine */}
         <div className="absolute w-[1px] bg-border/60 top-16 bottom-16 left-1/2 -translate-x-1/2 z-0" />

         <div className="max-w-2xl mx-auto space-y-0 flex flex-col items-center">
            {Object.entries(nodeDetails).map(([key, node]) => (
               <LayerNode
                  key={key}
                  type={node.type}
                  name={node.title}
                  metadata={node.metadata}
                  active={activeNode === key}
                  onSelect={() => setActiveNode(key)}
               />
            ))}

            {/* Placeholder for expansion */}
            <motion.div 
               whileHover={{ scale: 1.02 }}
               className="w-[240px] h-12 border-2 border-dashed border-border bg-bg-main/20 mt-8 flex items-center justify-center group cursor-pointer transition-all"
            >
               <span className="text-[10px] font-bold text-text-muted/40 uppercase tracking-widest group-hover:text-primary transition-colors flex items-center gap-2">
                  <ChevronRight size={14} /> Drop component to extend
               </span>
            </motion.div>
         </div>

         {/* Integrity Badge */}
         <div className="fixed bottom-10 flex flex-col items-center space-y-4">
            <div className="px-6 py-2 border border-border bg-white/80 backdrop-blur-sm flex items-center gap-3 shadow-sm">
               <ShieldCheck size={14} className="text-primary/40" />
               <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">Architecture Policy Verified</span>
            </div>
         </div>
      </main>

      {/* 3. Layer Inspector Panel (High Density) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <aside className="w-[400px] border-l border-border bg-bg-surface flex flex-col z-40 overflow-hidden shadow-2xl">
            {/* Inspector Header */}
            <div className="p-8 border-b border-border bg-bg-main/30">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-primary">
                     <span className="type-label">Module Inspector</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-bg-main rounded-sm text-text-muted transition-all">
                     <PanelRightClose size={18} />
                  </button>
               </div>
               
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-white border border-border text-primary shadow-sm">
                        {current.icon}
                     </div>
                     <div>
                        <h2 className="type-l2 serif text-text-main pr-4">{current.title}</h2>
                        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{current.type}</span>
                     </div>
                  </div>
                  <p className="text-[12px] font-medium text-text-muted leading-relaxed italic border-l-2 border-primary/10 pl-4">
                     {current.desc}
                  </p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <motion.div
                 key={activeNode}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="p-8 space-y-12"
               >
                  {/* Hyperparameters */}
                  <div className="space-y-6">
                     <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-main pb-3 border-b border-border/60">Operational Matrix</h3>
                     <div className="space-y-6">
                        {current.params.map((p, i) => (
                           <div key={i}>
                              <label className="block text-[9px] font-bold text-text-muted uppercase tracking-widest mb-2">{p.label}</label>
                              <div className="relative group">
                                 <input 
                                    readOnly
                                    value={p.value}
                                    className="w-full bg-white border border-border px-4 py-3 text-[11px] font-bold font-mono text-text-main focus:border-primary transition-all shadow-inner-sm"
                                 />
                                 <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20"><Settings2 size={12} /></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Mathematical Formulation */}
                  <div className="space-y-6">
                     <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-main pb-3 border-b border-border/60">Calculus Formulation</h3>
                     <div className="bg-bg-main border border-border p-6 flex flex-col items-center justify-center min-h-[120px] shadow-sm group">
                        <div className="text-[13px] font-mono text-primary font-bold text-center leading-relaxed select-all">
                           {current.math}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border w-full text-center">
                           <div className="text-[11px] font-mono text-text-muted italic opacity-60">
                              {current.formula}
                           </div>
                        </div>
                     </div>
                     
                     <div className="p-4 bg-primary/5 border border-primary/10 flex items-start gap-3">
                        <Info size={14} className="text-primary mt-0.5 shrink-0" />
                        <p className="text-[10px] leading-relaxed text-text-main font-medium">
                           The output shape is calculated as <span className="font-mono font-bold text-primary">floor((input_size - kernel + 2*padding) / stride) + 1</span>.
                        </p>
                     </div>
                  </div>
               </motion.div>
            </div>
            
            {/* Action Footer */}
            <div className="p-8 border-t border-border bg-bg-surface shrink-0">
               <button className="w-full bg-primary text-white h-12 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-primary/90 transition-all shadow-lg active:scale-[0.98]">
                  Compile Institutional Net
               </button>
            </div>
          </aside>
        )}
      </AnimatePresence>

      {/* Re-open Sidebar Button */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-20 bg-white border border-border border-r-0 flex items-center justify-center hover:bg-bg-main transition-all z-40 shadow-xl"
        >
          <PanelRightOpen size={16} className="text-primary" />
        </button>
      )}
    </div>
  );
};
