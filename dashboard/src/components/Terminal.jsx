import React, { useRef, useEffect } from 'react';

export const Terminal = ({ logs, onResize, isResizing, nodeRegistry = {} }) => {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={`flex flex-col h-full bg-slate-900 overflow-hidden border-t border-slate-800 shadow-2xl relative ${isResizing ? 'select-none' : ''}`}>
      {/* VS Code Style Resize Handle */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-50 cursor-ns-resize group"
        onMouseDown={(e) => {
          e.preventDefault();
          onResize();
        }}
      >
        <div className={`w-full h-[2px] transition-colors ${isResizing ? 'bg-primary shadow-[0_0_10px_var(--primary)]' : 'bg-transparent group-hover:bg-primary/40'}`} />
      </div>

      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0 select-none">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-1 bg-slate-900/50 rounded-sm">System Output Console</span>
         <div className="flex items-center gap-6 text-[9px] font-bold tracking-widest text-slate-500 uppercase">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               Live Bridge
            </div>
         </div>
      </div>

      {/* Node Registry Header */}
      <div className="px-5 py-3 bg-slate-900/80 border-b border-slate-800 flex flex-col gap-2 select-none">
         <div className="flex items-center text-[9px] font-bold uppercase tracking-widest text-slate-500 pb-1 border-b border-slate-800/50">
            <span className="w-24">Node_ID</span>
            <span className="w-24">Status</span>
            <span className="flex-1">Last_Model_Hash</span>
            <span className="w-12 text-right">Rep</span>
         </div>
         <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
            {Object.entries(nodeRegistry).length === 0 ? (
               <div className="text-[9px] italic text-slate-600 py-1">Awaiting node identification...</div>
            ) : (
               Object.entries(nodeRegistry).map(([id, info]) => (
                  <div key={id} className="flex items-center text-[10px] font-mono tracking-tight text-slate-300">
                     <span className="w-24 font-bold text-indigo-400">{id}</span>
                     <span className="w-24 flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${info.status === 'TRAINING' ? 'bg-amber-400 animate-pulse' : info.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {info.status}
                     </span>
                     <span className="flex-1 text-slate-500 font-light truncate pr-4">{info.hash || '----------------'}</span>
                     <span className="w-12 text-right text-emerald-500 opacity-60">1.0</span>
                  </div>
               ))
            )}
         </div>
      </div>
      
      <div
        ref={terminalRef}
        className="flex-1 font-mono p-4 overflow-y-auto custom-scrollbar-dark scroll-smooth text-[11px] leading-relaxed"
        style={{ backgroundColor: '#0f172a' }}
      >
        <div className="flex flex-col gap-1.5">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-slate-600 select-none shrink-0" style={{ fontSize: '9px' }}>
                {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-slate-100 break-all leading-tight" style={{ color: log.color === '#13ec49' ? '#34d399' : log.color === '#ef4444' ? '#f87171' : '#cbd5e1' }}>
                {log.msg}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-1">
             <span className="text-slate-600 select-none shrink-0" style={{ fontSize: '9px' }}>
                {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
             </span>
             <div className="flex items-center gap-2 text-indigo-400">
               <span className="font-bold">&gt;</span>
               <span className="w-2 h-4 bg-indigo-500 animate-pulse" />
             </div>
          </div>
        </div>
      </div>
       <style>{`
        .custom-scrollbar-dark::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};
