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
    <div className="flex flex-col bg-slate-900 overflow-hidden shadow-2xl">
      {/* Ribbon Header */}
      <div className="px-8 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <History size={16} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            Immutable Audit Ledger
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-md">
            <ShieldCheck size={12} className="text-indigo-400" />
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">
               Integrity: Verified
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
            Height: {blockchain.length}
          </span>
        </div>
      </div>

      {/* Ribbon Content */}
      <div
        ref={ribbonRef}
        className="flex-1 flex items-center gap-6 px-8 overflow-x-auto py-6 scroll-smooth custom-scrollbar-ribbon"
      >
        {blockchain.map((block) => (
          <motion.div
            key={block.index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`min-w-[220px] rounded-lg p-5 flex flex-col gap-4 border transition-all ${
              block.index === 0 
                ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20' 
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <Box size={14} className={block.index === 0 ? 'text-white/80' : 'text-slate-500'} />
                  <span className={`text-xs font-bold ${block.index === 0 ? 'text-white' : 'text-slate-200'}`}>
                    Block #{block.index}
                  </span>
               </div>
               {block.index === 0 && (
                 <span className="text-[8px] font-bold bg-white/20 text-white px-2 py-0.5 rounded uppercase">Genesis</span>
               )}
            </div>

            <div className="space-y-1.5">
               <div className={`text-[9px] font-mono tracking-tighter ${block.index === 0 ? 'text-indigo-100/60' : 'text-slate-500'}`}>
                 Hash: {block.hash !== 'null' && block.hash.length > 10 ? block.hash.slice(0, 18) + '...' : '0x0000_GENESIS'}
               </div>
               <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden">
                 <div 
                   className={`h-full ${block.index === 0 ? 'bg-white/40' : 'bg-indigo-500/50'}`}
                   style={{ width: `${Math.min(100, (block.transactions.length / 8) * 100)}%` }}
                 />
               </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`text-[9px] font-bold uppercase tracking-tight ${block.index === 0 ? 'text-white/70' : 'text-slate-400'}`}>
                {block.transactions.length} Contributions
              </span>
              <div className="flex -space-x-1.5">
                {block.transactions.slice(0, 4).map((tx, idx) => (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full border-2 ${block.index === 0 ? 'border-indigo-600' : 'border-slate-800'}`}
                    style={{ backgroundColor: tx.status === 'GREEN' ? '#10b981' : '#ef4444' }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <style>{`
        .custom-scrollbar-ribbon::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar-ribbon::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-ribbon::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};
