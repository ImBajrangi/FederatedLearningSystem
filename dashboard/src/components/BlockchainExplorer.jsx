import React, { useRef, useEffect } from 'react';
import { Box, Layers, History, ShieldCheck, Activity, Archive, Landmark, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export const BlockchainRibbon = ({ blockchain }) => {
  const ribbonRef = useRef(null);

  useEffect(() => {
    if (ribbonRef.current) {
      ribbonRef.current.scrollLeft = ribbonRef.current.scrollWidth;
    }
  }, [blockchain]);

  return (
    <div className="flex flex-col grounded-dark h-full overflow-hidden relative">
      {/* Ribbon Header: Institutional Audit Ledger */}
      <div className="px-10 py-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <Landmark size={12} className="text-primary" />
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] font-mono leading-none">
            Audit Ledger
          </span>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Database size={13} className="text-primary/70" />
              <h3 className="type-l3 text-white">Blockchain Ledger</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="type-label text-emerald-400">Ledger Synchronized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ribbon Content Viewport */}
      <div
        ref={ribbonRef}
        className="flex-1 flex items-center gap-px overflow-x-auto bg-black scroll-smooth custom-scrollbar-ribbon"
      >
        {blockchain?.map((block) => (
          <motion.div
            key={`${block.index}-${block.hash}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`min-w-[200px] h-full px-6 py-4 flex flex-col justify-center gap-3 border-r border-white/5 transition-all relative group cursor-default ${block.index === 0 ? 'bg-primary/5' : ''
              }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/60 serif leading-none">
                {block.index === 0 ? 'Genesis' : `Block ${block.index.toString().padStart(4, '0')}`}
              </span>
              <div className={`w-1 h-1 rounded-full ${block.index === 0 ? 'bg-primary shadow-[0_0_8px_var(--primary-glow)]' : 'bg-white/10'}`} />
            </div>

            <div className="space-y-2">
              <div className="text-[8px] font-mono font-bold tracking-tighter text-white/20 truncate uppercase">
                {block.hash !== 'null' && block.hash.length > 10 ? block.hash.slice(0, 16) : '0x00...SEED'}
              </div>
              <div className="w-full h-[1px] bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-primary/30"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/10">
                {block.transactions.length} Update
              </span>
              <div className="flex gap-1">
                {block.transactions.slice(0, 3).map((tx, idx) => (
                  <div
                    key={idx}
                    className="w-1 h-1 bg-primary/20 border border-primary/40"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        .custom-scrollbar-ribbon::-webkit-scrollbar { height: 2px; }
        .custom-scrollbar-ribbon::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar-ribbon::-webkit-scrollbar-thumb { background: #222; }
      `}</style>
    </div>
  );
};
