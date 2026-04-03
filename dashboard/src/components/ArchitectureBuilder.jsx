import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  Move,
  Plus,
  Minus,
  Maximize,
  X,
  Link
} from 'lucide-react';

// NODE COMPONENT (Draggable with Connection Ports)
const LayerNode = ({ 
  id, 
  type, 
  name, 
  active, 
  onSelect, 
  metadata, 
  position, 
  onDragEnd, 
  onPortClick,
  isConnecting 
}) => (
  <motion.div
    drag
    dragMomentum={false}
    onDragEnd={onDragEnd}
    onClick={onSelect}
    initial={position}
    animate={position}
    className="absolute z-10 select-none group"
    style={{ x: position.x, y: position.y }}
  >
    <div className="flex flex-col items-center">
      {/* Input Port (Top Pin) */}
      <button 
        onClick={(e) => { e.stopPropagation(); onPortClick(id, 'input'); }}
        className={`w-4 h-4 border-2 rounded-full mb-1 shadow-sm shrink-0 flex items-center justify-center transition-all ${
          isConnecting && isConnecting.to === id ? 'bg-primary border-primary scale-125' : 'bg-white border-border hover:border-primary'
        }`}
      >
        <div className="w-1 h-1 bg-border group-hover:bg-primary rounded-full" />
      </button>
      
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
        <div className="p-3 space-y-2">
          <h4 className={`text-[11px] font-bold uppercase tracking-tight leading-loose break-words ${active ? 'text-text-main' : 'text-text-muted'}`}>
            {name}
          </h4>
          
          {metadata && (
            <div className="space-y-1 opacity-80">
              {metadata.map((m, i) => (
                <div key={i} className="flex justify-between items-center text-[8px] font-mono leading-none">
                  <span className="text-text-muted/60">{m.label}:</span>
                  <span className={`font-bold ${active ? 'text-primary' : 'text-text-muted'}`}>{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {active && (
           <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-white" />
        )}
      </div>

      {/* Output Port (Bottom Pin) */}
      <button 
        onClick={(e) => { e.stopPropagation(); onPortClick(id, 'output'); }}
        className={`w-4 h-4 border-2 rounded-full mt-1 shadow-sm shrink-0 flex items-center justify-center transition-all ${
          isConnecting && isConnecting.from === id ? 'bg-primary border-primary scale-125' : 'bg-white border-border hover:border-primary'
        }`}
      >
        <div className="w-1 h-1 bg-border group-hover:bg-primary rounded-full" />
      </button>
    </div>
  </motion.div>
);

// CONNECTION LINE (Bezier Curve with Pruning Control)
const ConnectionLine = ({ from, to, onDelete }) => {
  if (!from || !to) return null;

  const startX = from.x + 110; 
  const startY = from.y + 115; // Output Pin
  const endX = to.x + 110;
  const endY = to.y; // Input Pin

  const cp1y = startY + (endY - startY) / 2;
  const cp2y = startY + (endY - startY) / 2;
  const d = `M ${startX} ${startY} C ${startX} ${cp1y}, ${endX} ${cp2y}, ${endX} ${endY}`;

  // Center of the path for the 'X' button
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  return (
    <g className="group cursor-default">
      <motion.path
        d={d}
        stroke="#364E68"
        strokeWidth="2"
        fill="none"
        strokeOpacity="0.2"
        className="group-hover:stroke-primary group-hover:stroke-opacity-100 transition-all"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
      />
      <foreignObject x={midX - 10} y={midY - 10} width="20" height="20" className="opacity-0 group-hover:opacity-100 transition-opacity">
         <button 
            onClick={onDelete}
            className="w-5 h-5 bg-white border border-border rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-colors"
         >
            <X size={10} />
         </button>
      </foreignObject>
    </g>
  );
};

export const ArchitectureBuilder = ({ onAction }) => {
  const [activeNode, setActiveNode] = useState('global');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewScale, setViewScale] = useState(0.8);
  const [isConnecting, setIsConnecting] = useState(null); // { from, type }
  
  const [positions, setPositions] = useState({
    global: { x: 400, y: 50 },
    blockchain: { x: 200, y: 250 },
    security: { x: 600, y: 250 },
    aggregation: { x: 400, y: 450 }
  });

  const [edges, setEdges] = useState([
    { id: 'edge-1', from: 'global', to: 'blockchain' },
    { id: 'edge-2', from: 'global', to: 'security' },
    { id: 'edge-3', from: 'blockchain', to: 'aggregation' },
    { id: 'edge-4', from: 'security', to: 'aggregation' }
  ]);

  const nodeDetails = useMemo(() => ({
    global: { title: 'Aggregation Hub', type: 'Sequential System', desc: 'Central orchestration layer focused on the secure aggregation of localized weighting vectors.', math: 'W_{agg} = \\sum_{i=1}^n \\alpha_i W_i', formula: 'S(i, j) = (I * K)(i, j)', params: [{ label: 'Security Model', value: 'Homomorphic Encryption' }, { label: 'Network Timeout', value: '5000ms' }], metadata: [{ label: 'filters', value: '32' }], icon: <Server size={18} /> },
    blockchain: { title: 'Audit Ledger', type: 'Consensus Layer', desc: 'Immutable permissioned consensus mechanism providing identity verification.', math: '\\mathcal{L} \\gets \\mathcal{L} \\cup \\{ B_k \\}', formula: 'H(B_k) = SHA256(...)', params: [{ label: 'Consensus', value: 'Proof-of-Authority' }], metadata: [{ label: 'finality', value: 'instant' }], icon: <Workflow size={18} /> },
    security: { title: 'Compliance Node', type: 'Policy Logic', desc: 'Real-time policy enforcement engine utilizing differentially private noise calibration.', math: '\\mathcal{M}(d) = f(d) + \\mathcal{N}(0, \\sigma^2)', formula: 'DP(ε, δ)', params: [{ label: 'DP Epsilon', value: 'ε=1.2' }], metadata: [{ label: 'noise_scale', value: 'Laplacian' }], icon: <Lock size={18} /> },
    aggregation: { title: 'Compute Edge', type: 'Execution Shard', desc: 'Decentralized institutional clusters executing local SGD iterations.', math: '\\nabla_{\\theta} J(\\theta) \\approx \\dots', formula: 'θ_{t+1} = θ_t - η · ∇J(θ_t)', params: [{ label: 'Hardware', value: 'NVIDIA H100' }], metadata: [{ label: 'batch_size', value: '256' }], icon: <Cpu size={18} /> }
  }), []);

  const current = nodeDetails[activeNode];

  // COLLISION AUDIT & SNAPPING
  const GRID_SIZE = 20;
  const NODE_WIDTH = 220;
  const NODE_HEIGHT = 180;

  const handleDragEnd = (id, info) => {
    setPositions(prev => {
      const newX = Math.round((prev[id].x + info.delta.x) / GRID_SIZE) * GRID_SIZE;
      const newY = Math.round((prev[id].y + info.delta.y) / GRID_SIZE) * GRID_SIZE;

      // Check for overlapping with any other node
      const hasCollision = Object.entries(prev).some(([key, pos]) => {
        if (key === id) return false;
        const dx = Math.abs(newX - pos.x);
        const dy = Math.abs(newY - pos.y);
        return dx < NODE_WIDTH + 40 && dy < NODE_HEIGHT + 40;
      });

      if (hasCollision) {
        // Simple push-back logic if collision detected
        return { ...prev };
      }

      return {
        ...prev,
        [id]: { x: newX, y: newY }
      };
    });
  };

  const handlePortClick = (id, type) => {
    if (!isConnecting) {
      if (type === 'output') setIsConnecting({ from: id });
      else setIsConnecting({ to: id });
    } else {
      if (type === 'input' && isConnecting.from && isConnecting.from !== id) {
        // Finalize Edge
        const newEdge = { id: `edge-${Date.now()}`, from: isConnecting.from, to: id };
        setEdges([...edges, newEdge]);
        setIsConnecting(null);
      } else if (type === 'output' && isConnecting.to && isConnecting.to !== id) {
        const newEdge = { id: `edge-${Date.now()}`, from: id, to: isConnecting.to };
        setEdges([...edges, newEdge]);
        setIsConnecting(null);
      } else {
        setIsConnecting(null); // Cancel
      }
    }
  };

  return (
    <div className="flex relative h-full bg-white selection:bg-primary/10 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      {/* ZOOM CONTROLS (Floating Institutional Hub) */}
      <div className="absolute bottom-10 right-10 flex flex-col gap-2 z-50">
          <div className="p-1 px-4 bg-white/90 border border-border shadow-xl backdrop-blur-md flex flex-col gap-1">
             <span className="text-[10px] font-bold text-text-muted text-center py-2 opacity-40 uppercase tracking-widest">{Math.round(viewScale * 100)}% scale</span>
             <div className="flex gap-1 border-t border-border/40 pt-1">
                <button onClick={() => setViewScale(s => Math.max(0.4, s - 0.1))} className="p-2 hover:bg-bg-main text-text-muted transition-all">
                   <Minus size={14} />
                </button>
                <button onClick={() => setViewScale(0.8)} className="p-2 hover:bg-bg-main text-primary transition-all">
                   <Maximize size={14} />
                </button>
                <button onClick={() => setViewScale(s => Math.min(1.5, s + 0.1))} className="p-2 hover:bg-bg-main text-text-muted transition-all">
                   <Plus size={14} />
                </button>
             </div>
          </div>
      </div>

      {/* 1. Left Component Palette */}
      <aside className="w-[280px] border-r border-border bg-bg-surface flex flex-col shrink-0 min-h-0 z-10 bg-white">
          <div className="p-6 border-b border-border shrink-0 bg-white">
             <h3 className="type-label text-text-muted mb-4 opacity-70">Architecture Forge</h3>
             <div className="relative group">
                <input 
                   type="text" 
                   placeholder="Filter shards..." 
                   className="w-full bg-bg-main border border-border pl-4 pr-10 py-2.5 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-primary/50 transition-all font-sans"
                />
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted opacity-40" />
             </div>
          </div>
          
         <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar space-y-10 min-h-0">
             {Object.entries({
                "Inference Components": ['Core', 'Dense', 'Recurrent', 'Activation'],
                "Network Topology": ['Input', 'Output', 'Reshape', 'Dropout'],
                "Secure Layers": ['Homomorphic', 'DP-Optimized', 'TEE-Box']
             }).map(([cat, items]) => (
                <div key={cat}>
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[9px] font-extrabold text-text-main uppercase tracking-widest opacity-60 underline underline-offset-4 decoration-primary/20">{cat}</span>
                    </div>
                    <div className="space-y-2">
                       {items.map((name) => (
                          <div key={name} className="p-3 border border-border bg-white text-[10px] font-bold text-text-muted uppercase tracking-tight flex items-center gap-3 cursor-move hover:border-primary hover:text-primary transition-all shadow-sm active:shadow-inner-sm">
                             <div className="w-4 h-4 flex items-center justify-center opacity-30"><Layers size={13} /></div>
                             {name}
                          </div>
                       ))}
                    </div>
                </div>
             ))}
         </div>
      </aside>

      {/* 2. Main Canvas Area (Zoomable 2D Space) */}
      <main className="flex-1 relative bg-grid overflow-hidden bg-bg-main" onClick={() => setIsConnecting(null)}>
         {/* Canvas Controls Header */}
         <div className="absolute top-8 left-10 flex items-center gap-6 z-20">
            <div className="px-5 py-2.5 border border-border bg-white shadow-md flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="type-label tracking-[0.2em] opacity-60">Architecture Workspace v2.5 // Blueprint Live</span>
            </div>
            {isConnecting && (
               <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="px-5 py-2.5 bg-primary text-white text-[9px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-3">
                  <Link size={12} /> Pending Data Flow Connection...
               </motion.div>
            )}
         </div>

         {/* The Zoomable Workspace */}
         <div className="w-full h-full overflow-auto custom-scrollbar">
            <motion.div 
               className="relative min-w-[3000px] min-h-[3000px]"
               animate={{ scale: viewScale }}
               transition={{ type: 'spring', damping: 25, stiffness: 120 }}
               style={{ transformOrigin: '0 0' }}
            >
               {/* Connections Layer */}
               <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible">
                  {edges.map(edge => (
                     <ConnectionLine 
                        key={edge.id}
                        from={positions[edge.from]} 
                        to={positions[edge.to]} 
                        onDelete={() => setEdges(edges.filter(e => e.id !== edge.id))}
                     />
                  ))}
               </svg>

               {/* Institutional Shards (Nodes) */}
               {Object.keys(positions).map((key) => (
                  <LayerNode
                     key={key}
                     id={key}
                     type={nodeDetails[key].type}
                     name={nodeDetails[key].title}
                     metadata={nodeDetails[key].metadata}
                     active={activeNode === key}
                     position={positions[key]}
                     isConnecting={isConnecting}
                     onSelect={() => setActiveNode(key)}
                     onDragEnd={(_, info) => handleDragEnd(key, info)}
                     onPortClick={handlePortClick}
                  />
               ))}
            </motion.div>
         </div>

         {/* Integrity Badge */}
         <div className="absolute bottom-10 left-10 z-20 pointer-events-none">
            <div className="px-6 py-2.5 border border-border bg-white/90 backdrop-blur-sm flex items-center gap-3 shadow-xl">
               <ShieldCheck size={14} className="text-primary/40" />
               <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-[0.3em] font-mono">Structural Compliance Verified</span>
            </div>
         </div>
      </main>

      {/* 3. Layer Inspector Panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <aside className="w-[400px] border-l border-border bg-bg-surface flex flex-col z-40 overflow-hidden shadow-2xl min-h-0 bg-white">
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
                     <div className="p-3 bg-white border border-border text-primary shadow-sm">
                        {current.icon}
                     </div>
                     <div>
                        <h2 className="type-l2 serif text-text-main pr-4">{current.title}</h2>
                        <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">{current.type}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
               <motion.div key={activeNode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-12 pb-32">
                  <div className="space-y-8">
                     <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-main pb-3 border-b border-border/80">Operational Matrix</h3>
                     <div className="space-y-7">
                        {current.params.map((p, i) => (
                           <div key={i}>
                              <label className="block text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 pl-1">{p.label}</label>
                              <div className="relative group">
                                 <input readOnly value={p.value} className="w-full bg-white border border-border px-4 py-3.5 text-[10px] font-bold font-mono text-text-main" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-8">
                     <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-main pb-3 border-b border-border/80">Calculus Formulation</h3>
                     <div className="bg-bg-main border border-border p-6 flex flex-col items-center justify-center min-h-[130px] shadow-sm">
                        <div className="text-[12px] font-mono text-primary font-bold text-center">{current.math}</div>
                     </div>
                  </div>
               </motion.div>
            </div>
            
            <div className="p-8 border-t border-border bg-bg-surface shrink-0 z-10 shadow-inner-sm">
               <button className="w-full bg-primary text-white h-12 uppercase tracking-[0.2em] text-[10px] font-extrabold hover:bg-primary/90 transition-all shadow-lg active:scale-[0.98]">
                  Compile Net Shard
               </button>
            </div>
          </aside>
        )}
      </AnimatePresence>
    </div>
  );
};
