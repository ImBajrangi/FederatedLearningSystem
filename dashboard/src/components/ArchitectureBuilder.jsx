import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  AlertTriangle,
  Move
} from 'lucide-react';

const LayerNode = ({ type, name, active, onSelect, metadata, position, onDrag }) => (
  <motion.div
    drag
    dragMomentum={false}
    onDrag={onDrag}
    onClick={onSelect}
    initial={position}
    animate={position}
    className="absolute z-10 select-none"
    style={{ x: position.x, y: position.y }}
  >
    <div className="flex flex-col items-center">
      {/* Connector Top Pin */}
      <div className="w-2.5 h-2.5 border border-border bg-white rounded-full mb-1 shadow-sm shrink-0" />
      
      <div 
        className={`relative w-[220px] border-[1.5px] bg-white shadow-sm cursor-grab active:cursor-grabbing transition-all ${
          active 
            ? 'border-primary shadow-md ring-4 ring-primary/5' 
            : 'border-border hover:border-text-muted/50'
        }`}
      >
        {/* Node Header */}
        <div className={`px-2.5 py-1.5 border-b flex justify-between items-center ${active ? 'bg-primary/5 border-primary/20' : 'bg-bg-main/30 border-border'}`}>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-primary' : 'text-text-muted'}`}>
            {type}
          </span>
          <Move size={10} className={active ? 'text-primary opacity-50' : 'text-border'} />
        </div>

        {/* Node Body */}
        <div className="p-3 space-y-2.5">
          <h4 className={`text-[11px] font-bold uppercase tracking-tight leading-loose break-words ${active ? 'text-text-main' : 'text-text-muted'}`}>
            {name}
          </h4>
          
          {metadata && (
            <div className="space-y-1">
              {metadata.map((m, i) => (
                <div key={i} className="flex justify-between items-center text-[8px] font-mono leading-none">
                  <span className="text-text-muted/60">{m.label}:</span>
                  <span className={`font-bold ${active ? 'text-primary' : 'text-text-muted'}`}>{m.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Output Handle Indicator */}
          <div className="mt-1 pt-1 border-t border-border/10 flex justify-between items-center">
              <span className="text-[12px] text-text-muted/30">→</span>
              <span className={`text-[9px] font-mono px-1 py-0.5 bg-bg-main border border-border/40 ${active ? 'text-primary' : 'text-text-muted'}`}>
                (None, 26, 26, 32)
              </span>
          </div>
        </div>

        {active && (
           <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-white animate-pulse" />
        )}
      </div>

      {/* Connector Bottom Pin */}
      <div className="w-2.5 h-2.5 border border-border bg-white rounded-full mt-1 shadow-sm shrink-0" />
    </div>
  </motion.div>
);

// Connection Line Component for Reactive 2D Flow
const ConnectionLine = ({ from, to }) => {
  if (!from || !to) return null;

  // Calculate midpoints for the cubic bezier curve
  const startX = from.x + 110; // Center of node (220px/2)
  const startY = from.y + 115; // Bottom of node
  const endX = to.x + 110;
  const endY = to.y; // Top of node

  const cp1y = startY + (endY - startY) / 2;
  const cp2y = startY + (endY - startY) / 2;

  const d = `M ${startX} ${startY} C ${startX} ${cp1y}, ${endX} ${cp2y}, ${endX} ${endY}`;

  return (
    <motion.path
      d={d}
      stroke="#364E68"
      strokeWidth="1.5"
      fill="none"
      initial={{ pathLength: 0, opacity: 0.1 }}
      animate={{ pathLength: 1, opacity: 0.2 }}
      transition={{ duration: 1 }}
    />
  );
};

export const ArchitectureBuilder = ({ onAction }) => {
  const [activeNode, setActiveNode] = useState('global');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const canvasRef = useRef(null);

  // Initial 2D Positions (simulating specialized blueprint layout)
  const [positions, setPositions] = useState({
    global: { x: 400, y: 50 },
    blockchain: { x: 400, y: 250 },
    security: { x: 400, y: 450 },
    aggregation: { x: 400, y: 650 }
  });

  const nodeDetails = useMemo(() => ({
    global: {
      title: 'Aggregation Hub',
      type: 'Sequential System',
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
  }), []);

  const current = nodeDetails[activeNode];

  const handleDrag = (id, info) => {
    setPositions(prev => ({
      ...prev,
      [id]: {
        x: prev[id].x + info.delta.x,
        y: prev[id].y + info.delta.y
      }
    }));
  };

  return (
    <div className="flex relative h-full bg-white selection:bg-primary/10 overflow-hidden">
      {/* 1. Left Component Palette */}
      <aside className="w-[280px] border-r border-border bg-bg-surface flex flex-col shrink-0 min-h-0">
          <div className="p-6 border-b border-border shrink-0">
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
          
         <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar space-y-10 min-h-0 bg-bg-sidebar">
             {/* Core Layers */}
             <div>
                <div className="flex items-center justify-between mb-4 cursor-pointer group">
                   <span className="text-[10px] font-bold text-text-main uppercase tracking-widest">Core Layers</span>
                   <ChevronDown size={14} className="text-text-muted group-hover:text-text-main transition-colors" />
                </div>
                <div className="space-y-2">
                   {['Dense', 'Activation', 'Flatten', 'Input', 'Reshape', 'Permute', 'RepeatVector', 'Lambda'].map((name) => (
                      <div key={name} className="p-3 border border-border bg-white text-[11px] font-bold text-text-muted uppercase tracking-tight flex items-center gap-3 cursor-move hover:border-primary hover:text-primary transition-all shadow-sm">
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
                   {['Conv2D', 'Conv1D', 'MaxPooling2D', 'AveragePooling', 'Conv3D', 'Conv2DTranspose', 'DepthwiseConv2D', 'Cropping2D'].map((name) => (
                      <div key={name} className="p-3 border border-border bg-white text-[11px] font-bold text-text-muted uppercase tracking-tight flex items-center gap-3 cursor-move hover:border-primary hover:text-primary transition-all shadow-sm">
                         <div className="w-4 h-4 flex items-center justify-center opacity-40"><Box size={14} /></div>
                         {name}
                      </div>
                   ))}
                </div>
             </div>
         </div>
      </aside>

      {/* 2. Main Canvas Area (Free-Form 2D Space) */}
      <main className="flex-1 relative bg-grid overflow-hidden flex flex-col bg-bg-main" ref={canvasRef}>
         {/* Canvas Header Hub */}
         <div className="absolute top-8 left-10 flex items-center gap-6 z-20">
            <div className="px-5 py-2.5 border border-border bg-white shadow-sm flex items-center gap-3">
               <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                   <span className="type-label">Blueprint 04 // active</span>
               </div>
            </div>
            <button className="px-5 py-2.5 border border-border bg-white shadow-sm text-[9px] font-bold uppercase tracking-widest hover:bg-bg-main transition-all">
               Auto-Align Systems
            </button>
         </div>

         {/* The 2D Canvas Workspace */}
         <div className="flex-1 relative overflow-auto custom-scrollbar p-32">
            <div className="relative min-w-[2000px] min-h-[2000px]">
               {/* 2D Reactive Connections Layer */}
               <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
                  <ConnectionLine from={positions.global} to={positions.blockchain} />
                  <ConnectionLine from={positions.blockchain} to={positions.security} />
                  <ConnectionLine from={positions.security} to={positions.aggregation} />
               </svg>

               {/* Institutional Shards (Nodes) */}
               {Object.keys(nodeDetails).map((key) => (
                  <LayerNode
                     key={key}
                     type={nodeDetails[key].type}
                     name={nodeDetails[key].title}
                     metadata={nodeDetails[key].metadata}
                     active={activeNode === key}
                     position={positions[key]}
                     onSelect={() => setActiveNode(key)}
                     onDrag={(_, info) => handleDrag(key, info)}
                  />
               ))}
            </div>
         </div>

         {/* Floating Institutional Badge */}
         <div className="absolute bottom-10 left-10 z-20">
            <div className="px-6 py-2.5 border border-border bg-white/90 backdrop-blur-sm flex items-center gap-3 shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer">
               <ShieldCheck size={14} className="text-primary/40" />
               <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-[0.3em] font-mono">Architecture Policy Verified</span>
            </div>
         </div>
      </main>

      {/* 3. Layer Inspector Panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <aside className="w-[400px] border-l border-border bg-bg-surface flex flex-col z-40 overflow-hidden shadow-2xl min-h-0 bg-white">
            {/* Inspector Header area */}
            <div className="p-8 border-b border-border bg-bg-main/30 shrink-0">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-primary">
                     <Settings size={15} className="opacity-70" />
                     <span className="type-label">Module Inspector</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-bg-main rounded-sm text-text-muted transition-all">
                     <PanelRightClose size={18} />
                  </button>
               </div>
               
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-white border border-border text-primary shadow-sm hover:shadow-md transition-shadow">
                        {current.icon}
                     </div>
                     <div>
                        <h2 className="type-l2 serif text-text-main pr-4">{current.title}</h2>
                        <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">{current.type}</span>
                     </div>
                  </div>
                  <p className="text-[11px] font-medium text-text-muted leading-relaxed italic border-l-2 border-primary/10 pl-4 pr-2">
                     {current.desc}
                  </p>
               </div>
            </div>

            {/* Scrollable parameters Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 bg-white">
               <motion.div
                 key={activeNode}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="p-8 space-y-12 pb-32"
               >
                  {/* Hyperparameters Matrix */}
                  <div className="space-y-8">
                     <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-main pb-3 border-b border-border/80">Operational Matrix</h3>
                     <div className="space-y-7">
                        {current.params.map((p, i) => (
                           <div key={i}>
                              <label className="block text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 pl-1">{p.label}</label>
                              <div className="relative group">
                                 <input 
                                    readOnly
                                    value={p.value}
                                    className="w-full bg-white border border-border px-4 py-3.5 text-[10px] font-bold font-mono text-text-main focus:border-primary transition-all shadow-sm hover:border-primary/30"
                                 />
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20"><Settings2 size={11} /></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Mathematical Formulation */}
                  <div className="space-y-8">
                     <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-main pb-3 border-b border-border/80">Calculus Formulation</h3>
                     <div className="bg-bg-main border border-border p-6 flex flex-col items-center justify-center min-h-[130px] shadow-sm group">
                        <div className="text-[12px] font-mono text-primary font-bold text-center leading-relaxed select-all w-full">
                           {current.math}
                        </div>
                        <div className="mt-5 pt-5 border-t border-border/40 w-full text-center">
                           <div className="text-[10px] font-mono text-text-muted italic opacity-70 leading-relaxed uppercase tracking-tight">
                              {current.formula}
                           </div>
                        </div>
                     </div>
                     
                     <div className="p-5 bg-primary/[0.03] border border-primary/10 flex items-start gap-4">
                        <Info size={14} className="text-primary mt-0.5 shrink-0" />
                        <p className="text-[10px] leading-relaxed text-text-main font-bold">
                           The output shape is calculated as <span className="font-mono font-bold text-primary">floor((input_size - kernel + 2*padding) / stride) + 1</span>.
                        </p>
                     </div>
                  </div>
               </motion.div>
            </div>
            
            {/* Static Action Footer */}
            <div className="p-8 border-t border-border bg-bg-surface shrink-0 z-10 shadow-inner-sm">
               <button className="w-full bg-primary text-white h-12 uppercase tracking-[0.3em] text-[10px] font-extrabold hover:bg-primary/90 transition-all shadow-lg active:scale-[0.98]">
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
