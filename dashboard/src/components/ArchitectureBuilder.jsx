import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Cpu, ShieldCheck, Zap, Settings2, Lock, Share2, Server, Download, Save, PanelRightClose, PanelRightOpen, Box, Info } from 'lucide-react';

const LayerNode = ({ type, name, active, onSelect, styleMode = 'solid' }) => (
  <div className="flex flex-col items-center">
    <motion.div
      whileHover={{ y: -4, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`card relative select-none w-[320px] p-6 cursor-pointer transition-all border-2 ${
        active 
          ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-100' 
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
      style={{ borderStyle: styleMode }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[9px] font-bold uppercase tracking-widest ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
          {type}
        </span>
        {active && <Zap size={14} className="text-indigo-600 animate-pulse" />}
      </div>
      <h4 className={`text-sm font-bold tracking-tight ${active ? 'text-slate-900' : 'text-slate-500'}`}>
        {name}
      </h4>

      {active && (
        <motion.div
          layoutId="node-arrow"
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full"
        />
      )}
    </motion.div>
    <div className="h-10 flex flex-col items-center justify-center">
      <div className="w-0.5 h-full bg-slate-200 relative">
        <ArrowDown size={14} className="absolute -bottom-1 -left-[6px] text-slate-200" />
      </div>
    </div>
  </div>
);

export const ArchitectureBuilder = ({ onAction }) => {
  const [activeNode, setActiveNode] = useState('global');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const nodeDetails = {
    global: {
      title: 'Aggregation Server',
      desc: 'Central orchestration layer for institutional weight aggregation.',
      params: [
        { label: 'Security Model', value: 'Homomorphic Encryption' },
        { label: 'Minimum Peers', value: '03' },
        { label: 'Network Timeout', value: '5000ms' }
      ],
      icon: <Server size={20} />
    },
    blockchain: {
      title: 'Consensus engine',
      desc: 'Permissioned ledger for reputation tracking and anomaly registry.',
      params: [
        { label: 'Protocol', value: 'Proof-of-Authority' },
        { label: 'Block Interval', value: '2.0s' },
        { label: 'Node Redundancy', value: 'High (3x)' }
      ],
      icon: <Share2 size={20} />
    },
    security: {
      title: 'Policy enforcement',
      desc: 'Automated contract validation for institutional update verification.',
      params: [
        { label: 'Logic Runtime', value: 'EVM-Standard' },
        { label: 'Statistical Bound', value: '1.96σ' },
        { label: 'Violation Penalty', value: '-25% Rep' }
      ],
      icon: <Lock size={20} />
    },
    aggregation: {
      title: 'Institutional Cluster',
      desc: 'Edge-distributed infrastructure provisioned for local computation.',
      params: [
        { label: 'Device Profile', value: 'Enterprise GPU' },
        { label: 'Compute Level', value: 'FP16 / INT8' },
        { label: 'Parallel Workers', value: '32' }
      ],
      icon: <Cpu size={20} />
    }
  };

  const current = nodeDetails[activeNode];

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden bg-slate-50 relative">
      {/* Sidebar Toggle */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute right-0 top-0 bottom-0 w-8 bg-white border-l flex items-center justify-center hover:bg-slate-50 transition-colors z-50 shadow-xl"
        >
          <PanelRightOpen size={18} className="text-slate-400" />
        </button>
      )}

      {/* Main Schematic Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative border-r bg-slate-50/50">
        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Local Toolbar */}
        <div className="flex justify-between items-center bg-white border-b m-8 p-6 rounded-lg shadow-sm z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
              Architectural Design
            </h2>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 border border-slate-200 uppercase tracking-tighter">
               Draft v1.0.4
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onAction?.('Architecture manifest exported.')}
              className="btn btn-outline px-4 py-2"
            >
              <Download size={16} /> <span className="font-bold text-[11px] uppercase tracking-wider">Export JSON</span>
            </button>
            <button
              onClick={() => onAction?.('Blueprint synced to institutional ledger.')}
              className="btn btn-primary px-6 py-2 shadow-lg shadow-indigo-500/20"
            >
              <Save size={16} /> <span className="font-bold text-[11px] uppercase tracking-wider">Commit Design</span>
            </button>
          </div>
        </div>

        {/* Schematic Flow */}
        <div className="flex-1 overflow-y-auto p-12 relative z-10 custom-scrollbar pb-32">
          <div className="flex flex-col items-center max-w-2xl mx-auto">
            <LayerNode
              type="Network gateway"
              name="SecAgg Central Server"
              active={activeNode === 'global'}
              onSelect={() => setActiveNode('global')}
            />
            <LayerNode
              type="Trust layer"
              name="Distributed consensus"
              active={activeNode === 'blockchain'}
              onSelect={() => setActiveNode('blockchain')}
            />
            <LayerNode
              type="Integrity logic"
              name="Automated validation"
              active={activeNode === 'security'}
              onSelect={() => setActiveNode('security')}
            />
            <LayerNode
              type="Compute edge"
              name="Institutional cluster nodes"
              active={activeNode === 'aggregation'}
              onSelect={() => setActiveNode('aggregation')}
              styleMode="dashed"
            />

            <div className="flex flex-col items-center mt-4">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                <ShieldCheck size={20} className="text-emerald-500" />
              </div>
              <span className="label text-slate-400 mt-4 leading-none" style={{ fontSize: '9px' }}>Institutional security endpoint reached</span>
            </div>
          </div>
        </div>
      </div>

      {/* Property Inspector */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            className="w-[380px] h-full bg-white border-l shadow-2xl flex flex-col z-40"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
               <div className="flex items-center gap-2">
                 <Settings2 size={16} className="text-slate-400" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Property Inspector</span>
               </div>
               <button onClick={() => setIsSidebarOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                  <PanelRightClose size={18} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <motion.div
                key={activeNode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div>
                  <div className="flex items-center gap-3 text-indigo-600 mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      {current.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Active component</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-3">{current.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed pb-8 border-b">{current.desc}</p>
                </div>

                <div className="space-y-6">
                  <div className="label text-slate-400 mb-4">Functional parameters</div>
                  <div className="space-y-4">
                    {current.params.map((p, i) => (
                      <div key={i} className="group">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-hover:text-indigo-600">
                           {p.label}
                        </div>
                        <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-between group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                           {p.value}
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-4">
                   <div className="flex items-center gap-2">
                     <Info size={14} className="text-indigo-500" />
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Policy compliance</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="h-2 flex-1 bg-white rounded-full overflow-hidden border">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: '94%' }}
                           className="h-full bg-indigo-500"
                         />
                      </div>
                      <span className="text-xs font-bold text-indigo-600">94%</span>
                   </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
