import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Cpu, ShieldCheck, Zap, Settings2, Lock, Share2, Server, Download, Save, PanelRightClose, PanelRightOpen } from 'lucide-react';

interface LayerNodeProps {
  type: string;
  name: string;
  active: boolean;
  onSelect: () => void;
  styleMode?: 'solid' | 'dashed';
}

const LayerNode: React.FC<LayerNodeProps> = ({ type, name, active, onSelect, styleMode = 'solid' }) => (
  <div className="flex flex-col items-center">
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      animate={{
        borderColor: active ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
        background: active ? 'rgba(19, 236, 73, 0.08)' : '#121212',
        boxShadow: active ? '0 0 30px rgba(19, 236, 73, 0.15)' : '0 0 0px rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`rounded-sm relative select-none`}
      style={{
        width: '280px',
        padding: '20px',
        cursor: 'pointer',
        border: '1px solid',
        borderStyle: styleMode,
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
        <span className="font-mono font-bold text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>
          {type}
        </span>
        {active && <Zap size={14} style={{ color: 'var(--primary)' }} className="animate-pulse" />}
      </div>
      <h4
        className="font-bold tracking-tight font-heading"
        style={{ fontSize: '15px', color: active ? 'white' : 'var(--text-muted)' }}
      >
        {name}
      </h4>

      {active && (
        <motion.div
          layoutId="node-glow"
          className="rounded-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            inset: '-1px',
            background: 'rgba(19, 236, 73, 0.1)',
            filter: 'blur(10px)',
            zIndex: -1
          }}
        />
      )}
    </motion.div>
    <div style={{ height: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '1px', height: '100%', backgroundColor: 'rgba(255,255,255,0.08)', position: 'relative' }}>
        <ArrowDown size={12} style={{ position: 'absolute', bottom: '-4px', left: '-5.5px', color: 'rgba(255,255,255,0.08)' }} />
      </div>
    </div>
  </div>
);

interface ArchitectureBuilderProps {
  onAction?: (msg: string) => void;
}

export const ArchitectureBuilder: React.FC<ArchitectureBuilderProps> = ({ onAction }) => {
  const [activeNode, setActiveNode] = useState('global');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const nodeDetails: Record<string, any> = {
    global: {
      title: 'Secure Aggregation Server',
      desc: 'Central coordination layer for cryptographic weight aggregation.',
      params: [
        { label: 'Security Model', value: 'Homomorphic Encryption' },
        { label: 'Min Peers', value: '3' },
        { label: 'Timeout', value: '5000ms' }
      ],
      icon: <Server size={18} />
    },
    blockchain: {
      title: 'Consensus Protocol',
      desc: 'Distributed ledger for reputation tracking and anomaly registry.',
      params: [
        { label: 'Protocol', value: 'Proof-of-Authority' },
        { label: 'Block Time', value: '2s' },
        { label: 'Redundancy', value: '3x' }
      ],
      icon: <Share2 size={18} />
    },
    security: {
      title: 'Smart Contract Validation',
      desc: 'Automated policy enforcement for model update verification.',
      params: [
        { label: 'Engine', value: 'EVM-Compatible' },
        { label: 'Z-Score Bound', value: '1.96' },
        { label: 'Penalty Rate', value: '-25%' }
      ],
      icon: <Lock size={18} />
    },
    aggregation: {
      title: 'Compute Cluster',
      desc: 'Edge-distributed hardware provisioned for local gradient calculation.',
      params: [
        { label: 'Device Archetype', value: 'NVIDIA JETSON' },
        { label: 'Quantization', value: 'INT8' },
        { label: 'Batch Size', value: '32' }
      ],
      icon: <Cpu size={18} />
    }
  };

  const current = nodeDetails[activeNode];

  return (
    <div className="flex-1 flex h-full overflow-hidden relative">
      {/* Sidebar Toggle Global Hint */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-[100] btn-primary p-3 rounded-sm shadow-2xl hover:scale-105 active:scale-95 transition-all"
          title="Show Details Panel"
          style={{ background: 'var(--primary)', color: 'black' }}
        >
          <PanelRightOpen size={20} />
        </button>
      )}

      {/* Main Workspace */}
      <div
        className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative"
        style={{ background: 'rgba(18,18,18,0.5)' }}
      >
        {/* Workspace Background Dots */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />

        {/* Action Header - NOW RELATIVE AND DYNAMIC */}
        <div
          className="flex justify-between items-center glass rounded-sm z-30 m-6 p-4 border"
          style={{
            background: 'rgba(10,10,10,0.8)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(255,255,255,0.05)'
          }}
        >
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-white uppercase tracking-widest" style={{ fontSize: '13px' }}>
              Architecture Workspace
            </h2>
            <span
              className="font-mono font-bold rounded-full"
              style={{
                padding: '2px 8px',
                backgroundColor: 'rgba(19, 236, 73, 0.1)',
                color: 'var(--primary)',
                fontSize: '9px',
                border: '1px solid rgba(19, 236, 73, 0.2)'
              }}
            >
              DRAFT-01
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onAction?.('Configuration manifest exported successfully.')}
              className="btn-secondary px-4 py-2 uppercase tracking-widest font-bold flex items-center gap-2" 
              style={{ fontSize: '10px' }}
            >
              <Download size={14} /> Export JSON
            </button>
            <button 
              onClick={() => onAction?.('Architectural blueprint synchronized to blockchain.')}
              className="btn-primary px-4 py-2 uppercase tracking-widest font-bold flex items-center gap-2" 
              style={{ fontSize: '10px' }}
            >
              <Save size={14} /> Save Blueprint
            </button>
          </div>
        </div>

        {/* Node Flow View */}
        <div className="flex-1 overflow-y-auto scroll-smooth relative z-10 custom-scrollbar pb-20">
          <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LayerNode
              type="Global Init"
              name="Secure Aggregation Server"
              active={activeNode === 'global'}
              onSelect={() => setActiveNode('global')}
            />
            <LayerNode
              type="Consensus Protocol"
              name="PoA Integrity Ledger"
              active={activeNode === 'blockchain'}
              onSelect={() => setActiveNode('blockchain')}
            />
            <LayerNode
              type="Integrity Policy"
              name="Smart Contract Validation"
              active={activeNode === 'security'}
              onSelect={() => setActiveNode('security')}
            />
            <LayerNode
              type="Compute Cluster"
              name="8 Peers Provisioned"
              active={activeNode === 'aggregation'}
              onSelect={() => setActiveNode('aggregation')}
              styleMode="dashed"
            />

            <div className="flex flex-col items-center" style={{ marginTop: '16px' }}>
              <div
                className="rounded-full"
                style={{
                  width: '48px',
                  height: '48px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'grid',
                  placeItems: 'center',
                  transform: 'translateZ(0)'
                }}
              >
                <ShieldCheck size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              <span className="font-mono text-muted uppercase mt-3 tracking-widest font-bold" style={{ fontSize: '10px' }}>
                Secure Endpoint
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex h-full"
          >
            <div className="h-full w-[380px] border-l glass overflow-hidden relative flex flex-col shadow-[rgba(0,0,0,0.5)_-20px_0px_50px]">
              {/* Close Handle Button */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute left-4 top-6 z-50 text-muted hover:text-primary transition-colors hover:scale-110 active:scale-95"
                title="Hide Sidebar"
              >
                <PanelRightClose size={20} />
              </button>

              <div className="flex-1 overflow-y-auto p-12 pt-16 custom-scrollbar">
                <motion.div
                  key={activeNode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-3 text-primary mb-4">
                    {current.icon}
                    <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] opacity-80">Selected Context</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white leading-tight mb-4 font-heading">{current.title}</h3>
                  <p className="text-sm text-muted leading-relaxed mb-10 border-b border-white/5 pb-8">{current.desc}</p>

                  <div className="space-y-10">
                    <div>
                      <div className="flex items-center gap-2 mb-6 text-white/50">
                        <Settings2 size={14} />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Configuration Ledger</span>
                      </div>
                      <div className="space-y-5">
                        {current.params.map((p: any, i: number) => (
                          <div key={i} className="flex flex-col gap-2 group">
                            <span className="text-[9px] text-muted uppercase font-bold tracking-[0.15em] transition-colors group-hover:text-primary/70">{p.label}</span>
                            <div className="bg-[#111] border border-white/5 px-4 py-3 rounded-sm text-xs font-mono text-white/90 flex items-center justify-between transition-all group-hover:border-primary/30 group-hover:bg-[#151515]">
                              {p.value}
                              <div className="w-1.5 h-3 bg-primary/10 rounded-full group-hover:bg-primary transition-all shadow-[0_0_10px_rgba(19,236,73,0)] group-hover:shadow-[0_0_12px_rgba(19,236,73,0.4)]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 glass rounded-sm bg-primary/[0.03] border-dashed border-primary/20 hover:border-primary/40 transition-colors">
                      <div className="text-[10px] text-primary font-mono font-bold uppercase mb-4 tracking-widest flex items-center gap-2">
                        <Zap size={12} /> Component Integrity
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '92%' }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-primary shadow-[0_0_10px_rgba(19,236,73,0.5)]"
                          />
                        </div>
                        <span className="text-[12px] font-mono font-bold text-primary">92%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
