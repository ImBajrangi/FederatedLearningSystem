import React from 'react';
import { Beaker, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  status: 'Ready' | 'Live' | 'Standby';
}

export const Header: React.FC<HeaderProps> = ({ status }) => {
  return (
    <header 
      className="glass border-b px-6 flex items-center justify-between sticky top-0 z-50"
      style={{ height: '64px' }}
    >
      <div className="flex items-center gap-3">
        <Beaker className="text-primary" size={24} />
        <h1 className="text-xl font-bold tracking-tight text-white">
          Model Architecture Builder
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest" style={{ display: 'none' /* hidden on small */ }}>
          <ShieldCheck size={16} />
          <span>Research: BCFL-SecureAgg v2.0</span>
        </div>
        
        <div 
          className="flex items-center gap-2 px-3 py-1 rounded-sm" 
          style={{ background: 'var(--terminal-bg)', border: '1px solid var(--border)' }}
        >
          <div 
            className={`rounded-full ${status === 'Live' ? 'animate-pulse-dot' : ''}`} 
            style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: status === 'Live' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: status === 'Live' ? '0 0 8px var(--primary)' : 'none'
            }} 
          />
          <span className="font-mono font-bold uppercase" style={{ fontSize: '10px' }}>
            {status}
          </span>
        </div>
      </div>
    </header>
  );
};
