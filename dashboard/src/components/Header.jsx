import React from 'react';
import { Network, ShieldCheck, Activity } from 'lucide-react';

export const Header = ({ status }) => {
  return (
    <header className="shell-header flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="p-2.5 rounded-lg bg-indigo-600 shadow-xl shadow-indigo-500/20">
          <Network className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800 leading-none">
            Secure Federated Dashboard
          </h1>
          <p className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest mt-2">
            Institutional Research Node v3.1.2
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-10">
        <div className="hidden lg:flex items-center gap-3 px-6 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 shadow-inner">
          <ShieldCheck size={18} className="text-indigo-500" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap">
            Privacy Enforcement: Differential Privacy (ε=1.2)
          </span>
        </div>
        
        <div className="flex items-center gap-4 px-6 py-2.5 rounded-lg border bg-white shadow-sm border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${status === 'Live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-widest whitespace-nowrap">
              Status: {status}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
