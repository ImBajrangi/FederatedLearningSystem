import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Cpu, ShieldCheck, Zap } from 'lucide-react';

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
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`rounded-sm transition-all duration-300 relative`}
      style={{
        width: '280px',
        padding: '16px',
        cursor: 'pointer',
        border: '1px solid',
        borderColor: active ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
        borderStyle: styleMode,
        background: active ? 'rgba(19, 236, 73, 0.05)' : '#121212',
        boxShadow: active ? '0 0 20px rgba(19, 236, 73, 0.1)' : 'none'
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
        <span className="font-mono font-bold text-muted uppercase tracking-widest" style={{ fontSize: '9px' }}>
          {type}
        </span>
        {active && <Zap size={14} style={{ color: 'var(--primary)' }} className="animate-pulse" />}
      </div>
      <h4
        className="font-bold tracking-tight"
        style={{ fontSize: '14px', color: active ? 'white' : 'var(--text-muted)' }}
      >
        {name}
      </h4>

      {active && (
        <motion.div
          layoutId="node-glow"
          className="rounded-sm"
          style={{
            position: 'absolute',
            inset: '-2px',
            background: 'rgba(19, 236, 73, 0.1)',
            filter: 'blur(8px)',
            zIndex: -1
          }}
        />
      )}
    </motion.div>
    <div style={{ height: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '1px', height: '100%', backgroundColor: 'rgba(255,255,255,0.1)', position: 'relative' }}>
        <ArrowDown size={10} style={{ position: 'absolute', bottom: '-4px', left: '-4.5px', color: 'rgba(255,255,255,0.1)' }} />
      </div>
    </div>
  </div>
);

export const ArchitectureBuilder: React.FC = () => {
  const [activeNode, setActiveNode] = useState('global');

  return (
    <div
      className="flex-1 overflow-y-auto scroll-smooth relative"
      style={{ background: 'rgba(18,18,18,0.5)' }}
    >
      {/* Visual Workspace Background */}
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

      <div style={{ position: 'relative', zIndex: 10, padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            className="rounded-full flex items-center justify-center"
            style={{
              width: '48px',
              height: '48px',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ShieldCheck size={20} style={{ color: 'var(--text-muted)' }} />
          </div>
          <span className="font-mono text-muted uppercase mt-3 tracking-widest font-bold" style={{ fontSize: '10px', marginTop: '12px' }}>
            Secure Endpoint
          </span>
        </div>
      </div>

      {/* Floating Toolbar */}
      <div
        className="flex justify-between items-center glass rounded-sm shadow-2xl"
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          right: '24px',
          padding: '16px',
          background: 'rgba(10,10,10,0.8)'
        }}
      >
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-white uppercase tracking-widest" style={{ fontSize: '14px' }}>
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
          <button className="btn-secondary px-4 py-2 uppercase tracking-widest font-bold" style={{ fontSize: '10px' }}>
            Export Config
          </button>
          <button className="btn-primary px-4 py-2 uppercase tracking-widest font-bold flex items-center gap-2" style={{ fontSize: '10px' }}>
            Save Blueprint <Cpu size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
