import React, { useRef, useEffect } from 'react';
import type { Block } from '../hooks/useSimulation';
import { Box, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlockchainRibbonProps {
  blockchain: Block[];
}

export const BlockchainRibbon: React.FC<BlockchainRibbonProps> = ({ blockchain }) => {
  const ribbonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ribbonRef.current) {
      ribbonRef.current.scrollLeft = ribbonRef.current.scrollWidth;
    }
  }, [blockchain]);

  return (
    <div 
      className="border-t flex flex-col"
      style={{ height: '176px', width: '100%', backgroundColor: '#050505' }}
    >
      <div 
        className="px-6 py-2 border-b flex items-center justify-between"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2">
          <Layers size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="font-mono font-bold uppercase tracking-widest" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Immutable Transaction Ledger
          </span>
        </div>
        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          Blocks: {blockchain.length}
        </span>
      </div>

      <div 
        ref={ribbonRef}
        className="flex-1 flex items-center gap-4 px-6 overflow-x-auto py-4 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {blockchain.map((block) => (
          <motion.div
            key={block.index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-sm shadow-lg"
            style={{ 
              minWidth: '180px', 
              padding: '16px', 
              borderColor: block.index === 0 ? 'rgba(19, 236, 73, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              background: block.index === 0 ? 'rgba(19, 236, 73, 0.05)' : 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold" style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                B-{block.index}
              </span>
              <Box size={14} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="font-mono text-muted uppercase block" style={{ fontSize: '9px' }}>
                Hash: {block.hash !== 'null' ? block.hash.slice(0, 14) + '...' : 'GENESIS'}
              </span>
              <div className="w-full rounded-full overflow-hidden" style={{ height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (block.transactions.length / 8) * 100)}%`,
                    background: 'rgba(19, 236, 73, 0.4)'
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-muted" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                {block.transactions.length} Verified TX
              </span>
              <div className="flex" style={{ marginLeft: '-4px' }}>
                {block.transactions.slice(0, 3).map((tx, idx) => (
                  <div 
                    key={idx} 
                    className="rounded-full"
                    style={{ 
                      width: '8px', 
                      height: '8px', 
                      border: '1px solid black',
                      backgroundColor: tx.status === 'GREEN' ? 'var(--primary)' : 'var(--error)',
                      marginLeft: '-2px'
                    }} 
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
