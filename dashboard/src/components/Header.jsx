import React from 'react';
import { Network, ShieldCheck, Activity, GraduationCap } from 'lucide-react';

export const Header = ({ status }) => {
  return (
    <header className="shell-header flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="p-2 bg-primary/5 rounded-sm border border-primary/10">
          <GraduationCap className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-text-main leading-none serif">
             Academic Monitoring Console
          </h1>
          <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.25em] mt-1.5">
            Institutional Research Node v3.1.2
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-bg-main border border-border text-text-muted">
          <ShieldCheck size={14} className="text-primary" />
          <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
            Privacy Enforcement: DP Layer
          </span>
        </div>
        
        <div className="flex items-center gap-4 px-4 py-1.5 bg-bg-main border border-border">
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-1.5 rounded-sm ${status === 'Live' ? 'bg-primary animate-pulse' : 'bg-border'}`} />
            <span className="text-[9px] font-bold text-text-main uppercase tracking-widest whitespace-nowrap">
              {status === 'Live' ? 'Node Online' : 'Node Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
