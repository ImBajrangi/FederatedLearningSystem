import React, { useRef, useEffect } from 'react';

export const Terminal = ({ logs }) => {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden rounded-md border border-slate-800 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Output Console</span>
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
