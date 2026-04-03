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
  Link,
  Trash2,
  BookOpen
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
  onDelete,
  isConnecting 
}) => (
  <motion.div
    drag
    dragMomentum={false}
    onDragEnd={(e, info) => onDragEnd(id, info)}
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
        className={`relative w-[210px] border-[1.5px] bg-white shadow-sm cursor-grab active:cursor-grabbing transition-all ${
          active 
            ? 'border-primary shadow-md ring-4 ring-primary/5' 
            : 'border-border hover:border-text-muted/50'
        }`}
      >
        {/* Node Header */}
        <div className={`px-2.5 py-1.5 border-b flex justify-between items-center ${active ? 'bg-primary/5 border-primary/20' : 'bg-bg-main/30 border-border'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-extrabold uppercase tracking-[0.15em] ${active ? 'text-primary' : 'text-text-muted/60'}`}>
               {type}
            </span>
          </div>
          {active && onDelete && (
             <button 
               onClick={(e) => { e.stopPropagation(); onDelete(id); }}
               className="p-1 hover:text-red-500 transition-colors"
             >
                <Trash2 size={10} />
             </button>
          )}
        </div>

        {/* Node Body */}
        <div className="p-4 space-y-2.5">
          <h4 className={`text-[10px] font-bold uppercase tracking-tight leading-none break-words ${active ? 'text-text-main' : 'text-text-muted'}`}>
            {name}
          </h4>
          
          {metadata && metadata.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {metadata.map((m, i) => (
                <div key={i} className="flex justify-between items-center text-[8px] font-mono leading-none">
                  <span className="text-text-muted/50 uppercase tracking-tighter">{m.label}:</span>
                  <span className={`font-bold tabular-nums ${active ? 'text-primary' : 'text-text-muted/80'}`}>{m.value}</span>
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

// CONNECTION LINE (Bezier Curve)
const ConnectionLine = ({ from, to, onDelete }) => {
  if (!from || !to) return null;

  const startX = from.x + 105; 
  const startY = from.y + 110; 
  const endX = to.x + 105;
  const endY = to.y; 

  const cp1y = startY + (endY - startY) / 2;
  const cp2y = startY + (endY - startY) / 2;
  const d = `M ${startX} ${startY} C ${startX} ${cp1y}, ${endX} ${cp2y}, ${endX} ${endY}`;

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
  const [isConnecting, setIsConnecting] = useState(null); 
  const [isCompiling, setIsCompiling] = useState(false);
  
  const [positions, setPositions] = useState({
    global: { x: 400, y: 50 },
    blockchain: { x: 200, y: 250 },
    security: { x: 600, y: 250 },
    aggregation: { x: 400, y: 450 }
  });

  const [nodes, setNodes] = useState({
    global: { title: 'Aggregation Hub', type: 'Core', metadata: [{ label: 'I/O', value: 'Unified' }] },
    blockchain: { title: 'Audit Ledger', type: 'Consensus', metadata: [{ label: 'Ledger', value: 'Active' }] },
    security: { title: 'Compliance Shard', type: 'Secure', metadata: [{ label: 'Privacy', value: 'DP' }] },
    aggregation: { title: 'Training Node', type: 'Compute', metadata: [{ label: 'GFLOPs', value: '1.2k' }] }
  });

  const [edges, setEdges] = useState([
    { id: 'edge-1', from: 'global', to: 'blockchain' },
    { id: 'edge-2', from: 'global', to: 'security' },
    { id: 'edge-3', from: 'blockchain', to: 'aggregation' },
    { id: 'edge-4', from: 'security', to: 'aggregation' }
  ]);

  const [search, setSearch] = useState('');

  // LIBTEMPLATES / PRESETS
  const libraryTemplates = useMemo(() => ([
    {
      id: 'mnist-mlp',
      name: 'MNIST-MLP Base',
      nodes: {
        'in': { title: 'Input [28x28]', type: 'Inference', metadata: [{ label: 'Dim', value: '784' }] },
        'h1': { title: 'Hidden Layer 1', type: 'Dense', metadata: [{ label: 'Nodes', value: '128' }] },
        'h2': { title: 'Hidden Layer 2', type: 'Dense', metadata: [{ label: 'Nodes', value: '64' }] },
        'out': { title: 'Classifier', type: 'Dropout', metadata: [{ label: 'Outputs', value: '10' }] }
      },
      edges: [
        { id: 'l1', from: 'in', to: 'h1' },
        { id: 'l2', from: 'h1', to: 'h2' },
        { id: 'l3', from: 'h2', to: 'out' }
      ],
      layout: {
        'in': { x: 100, y: 100 },
        'h1': { x: 100, y: 280 },
        'h2': { x: 100, y: 460 },
        'out': { x: 100, y: 640 }
      }
    },
    {
        id: 'secure-resnet',
        name: 'Secure-ResNet Shard',
        nodes: {
          'r_in': { title: 'Res-Block V1', type: 'Core', metadata: [{ label: 'Filters', value: '64' }] },
          'r_sec': { title: 'TEE Encryption', type: 'Secure', metadata: [{ label: 'Level', value: 'Hardened' }] },
          'r_agg': { title: 'Aggregator', type: 'Sequential', metadata: [{ label: 'Strategy', value: 'FedAvg' }] }
        },
        edges: [
          { id: 'rl1', from: 'r_in', to: 'r_sec' },
          { id: 'rl2', from: 'r_sec', to: 'r_agg' }
        ],
        layout: {
          'r_in': { x: 400, y: 100 },
          'r_sec': { x: 400, y: 280 },
          'r_agg': { x: 400, y: 460 }
        }
      }
  ]), []);

  const addNodeFromPalette = (name, type) => {
    const id = `node-${Date.now()}`;
    const x = 300 + Math.random() * 50;
    const y = 200 + Math.random() * 50;
    
    setPositions(prev => ({ ...prev, [id]: { x, y } }));
    setNodes(prev => ({
        ...prev,
        [id]: { title: name, type: type || 'Dense', metadata: [{ label: 'Alloc', value: 'Auto' }] }
    }));
    setActiveNode(id);
    if(onAction) onAction(`Initialized ${name} shard.`);
  };

  const applyTemplate = (template) => {
    setPositions(template.layout);
    setNodes(template.nodes);
    setEdges(template.edges);
    setActiveNode(Object.keys(template.nodes)[0]);
    if(onAction) onAction(`Loaded Library Template: ${template.name}`);
  };

  const deleteNode = (id) => {
    if (['global', 'aggregation', 'blockchain', 'security'].includes(id)) {
        if(onAction) onAction(`Cannot delete core system node: ${id}`, 'error');
        return;
    }
    setNodes(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
    });
    setPositions(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
    });
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    setActiveNode('global');
  };

  const compileModel = () => {
    setIsCompiling(true);
    setTimeout(() => {
        setIsCompiling(false);
        if(onAction) onAction('Architecture Compiled & Deployed to Cluster Shards.', 'success');
    }, 2000);
  };

  const handleDragEnd = (id, info) => {
    setPositions(prev => ({
        ...prev,
        [id]: { x: prev[id].x + info.delta.x, y: prev[id].y + info.delta.y }
    }));
  };

  const handlePortClick = (id, type) => {
    if (!isConnecting) {
      if (type === 'output') setIsConnecting({ from: id });
      else setIsConnecting({ to: id });
    } else {
      if (type === 'input' && isConnecting.from && isConnecting.from !== id) {
        const newEdge = { id: `edge-${Date.now()}`, from: isConnecting.from, to: id };
        setEdges([...edges, newEdge]);
        setIsConnecting(null);
      } else if (type === 'output' && isConnecting.to && isConnecting.to !== id) {
        const newEdge = { id: `edge-${Date.now()}`, from: id, to: isConnecting.to };
        setEdges([...edges, newEdge]);
        setIsConnecting(null);
      } else {
        setIsConnecting(null); 
      }
    }
  };

  const current = nodes[activeNode] || nodes['global'];

  return (
    <div className="flex relative h-full bg-white overflow-hidden" style={{ minHeight: 'calc(100vh - 64px)', height: '100%' }}>
      {/* 1. Left Component Library Panel */}
      <aside className="w-[300px] border-r border-border bg-bg-surface flex flex-col shrink-0 min-h-0 z-10 bg-white shadow-xl">
          <div className="p-8 border-b border-border shrink-0 bg-white">
             <div className="flex items-center gap-3 mb-6">
                <BookOpen size={14} className="text-primary" />
                <h3 className="type-label text-text-main font-bold tracking-widest uppercase">Model Library</h3>
             </div>
             <div className="relative group">
                <input 
                   type="text" 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search library..." 
                   className="w-full bg-bg-main border border-border pl-4 pr-10 py-3 text-[10px] uppercase font-extrabold tracking-widest focus:outline-none focus:border-primary transition-all font-sans"
                />
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted opacity-40" />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar space-y-10 min-h-0">
              {/* Presets Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.25em]">Model Presets</span>
                </div>
                <div className="space-y-2">
                    {libraryTemplates.map(t => (
                        <button 
                            key={t.id}
                            onClick={() => applyTemplate(t)}
                            className="w-full p-4 border border-border bg-slate-50/50 hover:bg-white hover:border-primary transition-all flex flex-col items-start gap-1 group text-left"
                        >
                            <span className="text-[10px] font-bold text-text-main uppercase group-hover:text-primary">{t.name}</span>
                            <span className="text-[8px] text-text-muted uppercase tracking-tighter opacity-60">Nodes: {Object.keys(t.nodes).length} | Verified Architecture</span>
                        </button>
                    ))}
                </div>
              </div>

              {/* Components Section */}
              {Object.entries({
                 "Neural Topology": ['Dense', 'Convolutional', 'Recurrent', 'Activation'],
                 "Compliance Shards": ['Input', 'Security', 'Aggregation', 'Gateway'],
                 "Secure Storage": ['Blockchain', 'TEE-Vault', 'HSM-Node']
              }).map(([cat, items]) => (
                 <div key={cat} className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.25em]">{cat}</span>
                     </div>
                     <div className="grid grid-cols-1 gap-2">
                        {items.filter(name => name.toLowerCase().includes(search.toLowerCase())).map((name) => (
                           <button 
                             key={name} 
                             onClick={() => addNodeFromPalette(name, name)}
                             className="p-3 border border-border bg-white text-[9px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-3 cursor-pointer hover:border-primary hover:text-primary hover:bg-primary/[0.02] transition-all shadow-sm active:scale-95"
                           >
                              <Layers size={11} className="opacity-40" />
                              {name}
                           </button>
                        ))}
                     </div>
                 </div>
              ))}
          </div>
      </aside>

      {/* 2. Main Canvas Area (Focus Area) */}
      <main className="flex-1 relative bg-grid overflow-hidden bg-bg-main cursor-crosshair">
         {/* Canvas Controls Header */}
         <div className="absolute top-8 left-10 flex items-center gap-6 z-30 pointer-events-none">
            <div className="px-6 py-3 border border-border bg-white shadow-xl flex items-center gap-4 pointer-events-auto">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] uppercase font-extrabold tracking-[0.3em] text-text-main opacity-80">Forge Status: Ready</span>
            </div>
            {isConnecting && (
               <div className="px-6 py-3 bg-primary text-white text-[9px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-3 pointer-events-auto animate-pulse">
                  <Link size={12} /> Pending Connection...
               </div>
            )}
         </div>

         {/* The Zoomable Workspace */}
         <div className="w-full h-full overflow-auto custom-scrollbar" onClick={() => setIsConnecting(null)}>
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

               {/* Nodes Layer */}
               {Object.keys(positions).map((key) => (
                  <LayerNode
                     key={key}
                     id={key}
                     type={nodes[key]?.type}
                     name={nodes[key]?.title}
                     metadata={nodes[key]?.metadata}
                     active={activeNode === key}
                     position={positions[key]}
                     isConnecting={isConnecting}
                     onSelect={() => setActiveNode(key)}
                     onDragEnd={handleDragEnd}
                     onPortClick={handlePortClick}
                     onDelete={deleteNode}
                  />
               ))}
            </motion.div>
         </div>

         {/* Floating Zoom UI */}
         <div className="absolute bottom-10 left-10 flex items-center gap-2 z-50">
            <div className="flex bg-white border border-border shadow-2xl p-1 shrink-0">
                <button onClick={() => setViewScale(s => Math.max(0.4, s - 0.1))} className="p-3 hover:bg-slate-50 text-text-muted transition-all border-r border-border">
                   <Minus size={14} />
                </button>
                <div className="px-4 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-text-main min-w-[40px] text-center">{Math.round(viewScale * 100)}%</span>
                </div>
                <button onClick={() => setViewScale(s => Math.min(1.5, s + 0.1))} className="p-3 hover:bg-slate-50 text-text-muted transition-all border-l border-border">
                   <Plus size={14} />
                </button>
            </div>
         </div>
      </main>

      {/* 3. Layer Inspector Panel (Right) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <aside className="w-[420px] border-l border-border bg-bg-surface flex flex-col z-40 overflow-hidden shadow-2xl min-h-0 bg-white">
            <div className="p-10 border-b border-border bg-bg-main/30 shrink-0">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3 text-primary">
                     <Settings2 size={16} />
                     <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]">Module Inspector</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-bg-main rounded-sm text-text-muted transition-all">
                     <PanelRightClose size={20} />
                  </button>
               </div>
               
               <div className="flex items-center gap-6">
                  <div className="p-5 bg-white border border-border text-primary shadow-sm rounded-sm">
                     <Layers size={20} />
                  </div>
                  <div className="space-y-1.5 flex-1 overflow-hidden">
                     <h2 className="text-xl serif text-text-main font-medium tracking-tight truncate">{current?.title}</h2>
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-[1px] bg-primary/40" />
                        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em]">{current?.type} MODULE</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 p-10 space-y-12 pb-32">
                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-text-muted/60">Operational Configuration</span>
                      <div className="h-px flex-1 bg-border/40" />
                   </div>
                   
                   <div className="space-y-8">
                        {current?.metadata?.map((p, i) => (
                           <div key={i} className="group">
                              <label className="block text-[9px] font-bold text-text-muted uppercase tracking-[0.25em] mb-3">{p.label}</label>
                              <div className="relative">
                                 <div className="absolute inset-y-0 left-0 w-[3px] bg-primary/20 group-hover:bg-primary transition-colors" />
                                 <input 
                                    readOnly 
                                    value={p.value} 
                                    className="w-full bg-slate-50/50 border border-border/50 pl-6 py-4 text-[12px] font-bold font-mono text-text-main focus:outline-none" 
                                 />
                              </div>
                           </div>
                        ))}
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-text-muted/60">Calculus Basis</span>
                      <div className="h-px flex-1 bg-border/40" />
                   </div>
                   <div className="bg-slate-900 border-none p-10 rounded-sm flex flex-col items-center justify-center min-h-[160px] shadow-2xl relative overflow-hidden">
                      <div className="absolute top-4 left-4 opacity-10 text-primary"><Activity size={32} /></div>
                      <div className="text-[14px] font-mono text-primary font-bold text-center leading-relaxed">
                         {current?.type === 'Dense' ? 'W^T x + b' : current?.type === 'Convolutional' ? 'f * g' : 'L = sum(w_i x_i)'}
                      </div>
                      <div className="mt-6 text-[8px] font-mono text-white/30 uppercase tracking-widest italic">Verification via Homomorphic Proof</div>
                   </div>
                </div>
            </div>
            
            <div className="p-10 border-t border-border bg-white shrink-0 z-10">
               <button 
                 onClick={compileModel}
                 disabled={isCompiling}
                 className={`w-full h-14 uppercase tracking-[0.3em] text-[11px] font-black transition-all shadow-2xl flex items-center justify-center gap-4 ${
                   isCompiling 
                     ? 'bg-slate-100 text-text-muted cursor-not-allowed' 
                     : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
                 }`}
               >
                  {isCompiling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                      COMPILING NET...
                    </>
                  ) : (
                    <>
                      <Zap size={16} fill="white" />
                      COMPILE NET SHARD
                    </>
                  )}
               </button>
               <div className="mt-4 text-center">
                  <span className="text-[8px] font-bold text-text-muted/40 uppercase tracking-[0.2em] font-sans">v4.2 Compiler Stable // Institutional Target</span>
               </div>
            </div>
          </aside>
        )}
      </AnimatePresence>
    </div>
  );
};
