import React from 'react';
import { Network, ShieldCheck, Activity } from 'lucide-react';

export const Header = ({ status }) => {
  return (
    <header className="h-16 px-8 border-b bg-white flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center">
          <Network className="text-indigo-600" size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800">
            Secure Federated Dashboard
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
            Institutional Research Node
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Protected by Differential Privacy (ε=1.2)
          </span>
        </div>
        
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-md border bg-white shadow-sm border-slate-200">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'Live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
              {status}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
