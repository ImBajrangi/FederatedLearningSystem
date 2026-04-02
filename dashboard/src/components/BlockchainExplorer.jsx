import React, { useRef, useEffect } from 'react';
import { Box, Layers, History, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const BlockchainRibbon = ({ blockchain }) => {
  const ribbonRef = useRef(null);

  useEffect(() => {
    if (ribbonRef.current) {
      ribbonRef.current.scrollLeft = ribbonRef.current.scrollWidth;
    }
  }, [blockchain]);

  return (
    <div className="flex flex-col bg-slate-900 overflow-hidden shadow-2xl relative">
      {/* Ribbon Header Institutionalized */}
      <div className="px-10 py-3 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/20">
        <div className="flex items-center gap-3">
          <History size={16} className="text-indigo-400" />
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
            Audit Ledger (Immutability Layer)
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded border border-white/5 shadow-inner">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-widest">
               Protocol Integrity: SECURE
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">
            Chain height: {blockchain.length.toString().padStart(3, '0')}
          </span>
        </div>
      </div>

      {/* Ribbon Content Viewport */}
      <div
        ref={ribbonRef}
        className="flex items-center gap-8 px-10 overflow-x-auto py-8 scroll-smooth custom-scrollbar-ribbon"
      >
        {blockchain.map((block) => (
          <motion.div
            key={`${block.index}-${block.hash}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`min-w-[260px] rounded-xl p-6 flex flex-col gap-5 border transition-all relative group cursor-default ${
              block.index === 0 
                ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-500/30' 
                : 'bg-slate-800/50 border-white/5 hover:border-indigo-500/50 hover:bg-slate-800 transition-colors shadow-lg'
            }`}
          >
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <Box size={16} className={block.index === 0 ? 'text-white' : 'text-indigo-400'} />
                  <span className={`text-xs font-extrabold tracking-tight ${block.index === 0 ? 'text-white' : 'text-slate-100'}`}>
                    Block #{block.index.toString().padStart(3, '0')}
                  </span>
               </div>
               {block.index === 0 && (
                 <span className="text-[8px] font-extrabold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">Genesis Node</span>
               )}
            </div>

            <div className="space-y-2">
               <div className={`text-[9px] font-mono font-bold tracking-tighter ${block.index === 0 ? 'text-indigo-100' : 'text-slate-500'}`}>
                 HASH: {block.hash !== 'null' && block.hash.length > 10 ? block.hash.slice(0, 24) : '0x0000_SEED_PROTOCOL_GENESIS'}
               </div>
               <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden border border-white/5">
                 <div 
                   className={`h-full ${block.index === 0 ? 'bg-white' : 'bg-indigo-500'}`}
                   style={{ width: `${Math.max(10, Math.min(100, (block.transactions.length / 8) * 100))}%` }}
                 />
               </div>
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className={`text-[9px] font-extrabold uppercase tracking-widest ${block.index === 0 ? 'text-white/80' : 'text-slate-500'}`}>
                {block.transactions.length} Update Envelopes
              </span>
              <div className="flex -space-x-2">
                {block.transactions.slice(0, 5).map((tx, idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border-2 ${block.index === 0 ? 'border-indigo-600 shadow-sm' : 'border-slate-900 shadow-sm'}`}
                    style={{ backgroundColor: tx.status === 'GREEN' ? '#10b981' : '#ef4444' }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <style>{`
        .custom-scrollbar-ribbon::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar-ribbon::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar-ribbon::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar-ribbon::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};
