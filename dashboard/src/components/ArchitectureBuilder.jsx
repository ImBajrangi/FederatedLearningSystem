import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Cpu, ShieldCheck, Zap, Settings2, Lock, Share2, Server, Download, Save, PanelRightClose, PanelRightOpen, Box, Info } from 'lucide-react';

const LayerNode = ({ type, name, active, onSelect, styleMode = 'solid' }) => (
  <div className="flex flex-col items-center w-full">
    <motion.div
      whileHover={{ y: -4, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`data-card relative select-none w-full max-w-[340px] p-6 cursor-pointer transition-all border-2 ${
        active 
          ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-100' 
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
      style={{ borderStyle: styleMode }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[9px] font-extrabold uppercase tracking-widest ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
          {type}
        </span>
        {active && <Zap size={14} className="text-indigo-600 animate-pulse" />}
      </div>
      <h4 className={`text-sm font-extrabold tracking-tight ${active ? 'text-slate-900' : 'text-slate-500'} leading-snug`}>
        {name}
      </h4>

      {active && (
        <motion.div
          layoutId="node-arrow"
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-500 rounded-full shadow-sm"
        />
      )}
    </motion.div>
    <div className="h-12 flex flex-col items-center justify-center">
      <div className="w-0.5 h-full bg-slate-200 relative">
        <ArrowDown size={14} className="absolute -bottom-1 -left-[6px] text-slate-300" />
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
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Schematic Layout Header */}
      <div className="flex justify-between items-center bg-white border-b p-8 z-30 shadow-sm border-t-0">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight uppercase">System Architecture Builder</h2>
          <p className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest mt-2">
            Institutional Network Blueprint Designer
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => onAction?.('Architecture manifest exported.')}
            className="btn btn-outline h-10 px-6 group"
          >
            <Download size={16} /> 
            <span>Export Manifest</span>
          </button>
          <button
            onClick={() => onAction?.('Blueprint synced to institutional ledger.')}
            className="btn btn-primary h-10 px-10 shadow-lg"
          >
            <Save size={16} /> 
            <span>Commit Architecture</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden bg-slate-50 relative">
        {/* Background Grid Layer */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#4f46e5 1.5px, transparent 1.5px)',
            backgroundSize: '32px 32px'
          }}
        />

        {/* Sidebar Toggle (Visible when closed) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-24 bg-white border border-r-0 rounded-l-xl flex items-center justify-center hover:bg-slate-50 transition-all z-40 shadow-xl border-slate-200"
          >
            <PanelRightOpen size={20} className="text-indigo-600" />
          </button>
        )}

        {/* Schematic Flow Area */}
        <div className="flex-1 overflow-y-auto p-16 relative z-10 custom-scrollbar pb-64">
          <div className="flex flex-col items-center max-w-2xl mx-auto">
            <LayerNode
              type="Institutional Gateway"
              name="SecAgg Aggregation Hub"
              active={activeNode === 'global'}
              onSelect={() => setActiveNode('global')}
            />
            <LayerNode
              type="Immutability Layer"
              name="Proof-of-Authority Consensus"
              active={activeNode === 'blockchain'}
              onSelect={() => setActiveNode('blockchain')}
            />
            <LayerNode
              type="Policy Logic"
              name="Institutional Smart Contracts"
              active={activeNode === 'security'}
              onSelect={() => setActiveNode('security')}
            />
            <LayerNode
              type="Execution Edge"
              name="High-Performance Cluster"
              active={activeNode === 'aggregation'}
              onSelect={() => setActiveNode('aggregation')}
              styleMode="dashed"
            />

            <div className="flex flex-col items-center mt-10">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-indigo-100 shadow-xl flex items-center justify-center">
                <ShieldCheck size={28} className="text-emerald-500" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-6 tracking-widest bg-slate-50 px-4 py-2 rounded-full border">
                Institutional Security Target Reached
              </span>
            </div>
          </div>
        </div>

        {/* Property Inspector (Integrated Panel) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              className="w-[420px] h-full bg-white border-l shadow-2xl flex flex-col z-40"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b shrink-0 bg-slate-50/50">
                 <div className="flex items-center gap-3">
                   <Settings2 size={18} className="text-indigo-600" />
                   <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Global Parameters</span>
                 </div>
                 <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                    <PanelRightClose size={20} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <motion.div
                  key={activeNode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-12"
                >
                  <div>
                    <div className="flex items-center gap-4 text-indigo-600 mb-6">
                      <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
                        {current.icon}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-1">Architecture Node</span>
                        <span className="text-xs font-bold text-indigo-600 uppercase">Status: VALIDATED</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none mb-4">{current.title}</h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed pb-8 border-b border-slate-100 italic">{current.desc}</p>
                  </div>

                  <div className="space-y-8">
                    <div className="label text-slate-400 font-extrabold tracking-widest">Functional Matrix</div>
                    <div className="space-y-6">
                      {current.params.map((p, i) => (
                        <div key={i} className="group">
                          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 transition-colors group-hover:text-indigo-600">
                             {p.label}
                          </div>
                          <div className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl text-xs font-extrabold text-slate-700 flex items-center justify-between group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all shadow-inner">
                             {p.value}
                             <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors shadow-sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-slate-900 rounded-2xl space-y-6 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Box size={80} className="text-white" />
                     </div>
                     <div className="flex items-center gap-3 relative z-10">
                       <ShieldCheck size={18} className="text-emerald-400" />
                       <span className="text-[11px] font-extrabold text-white uppercase tracking-widest">Policy Compliance Matrix</span>
                     </div>
                     <div className="flex items-center gap-5 relative z-10">
                        <div className="h-2.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: '94%' }}
                             className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                           />
                        </div>
                        <span className="text-sm font-extrabold text-emerald-400 font-mono">94.0%</span>
                     </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
