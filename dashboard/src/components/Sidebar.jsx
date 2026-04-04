import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  ShieldCheck, 
  Terminal, 
  Activity, 
  Layers,
  History,
  Workflow,
  Cpu,
  BookOpen,
  PieChart,
  Server
} from 'lucide-react';

const MetricItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-border group">
    <div className="flex flex-col">
      <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">{label}</span>
      <span className="text-xs font-bold text-text-main tabular-nums">{value}</span>
    </div>
  </div>
);

export const Sidebar = ({ currentView, setView, clients = [], nodeRegistry = {}, rejectedCount = 0, blockchain = [], width, onResize }) => {
  const activeCount = clients.filter(c => c.status === 'ACTIVE' || c.status === 'BUSY').length;
  const yieldValue = blockchain && blockchain.length > 1 
    ? (100 - (rejectedCount / (blockchain.length - 1) * 100)).toFixed(1)
    : "100.0";
  const powerValue = (activeCount * 0.4 + 0.2).toFixed(1);

  return (
    <aside className="shell-sidebar flex flex-col h-full bg-white border-r border-border" style={{ width: width || 280, flexShrink: 0, position: 'relative' }}>
      {/* VS Code style resize handle on right edge */}
      <div
        onMouseDown={onResize}
        style={{
          position: 'absolute', top: 0, right: -3, bottom: 0, width: 6,
          cursor: 'col-resize', zIndex: 100,
        }}
      >
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 2, width: 2,
          background: 'transparent', transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#3b82f6'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        />
      </div>
      {/* Sidebar Navigation */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
         <div className="p-10 border-b border-border bg-bg-main/50">
           <span className="type-label text-text-main">Coursework</span>
         </div>
        
        <div className="flex flex-col">
          <button 
            onClick={() => setView('dashboard')}
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mr-4">01</span>
            Academic Progress
          </button>
          
          <button 
            onClick={() => setView('training')}
            className={`nav-item ${currentView === 'training' ? 'active' : ''}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mr-4">02</span>
            Training Cluster
          </button>

          <button 
            onClick={() => setView('datasets')}
            className={`nav-item ${currentView === 'datasets' ? 'active' : ''}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mr-4">03</span>
            Shard Registry
          </button>

          <button 
            onClick={() => setView('architecture')}
            className={`nav-item ${currentView === 'architecture' ? 'active' : ''}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mr-4">04</span>
            Model Library
          </button>

          <button 
            onClick={() => setView('laboratory')}
            className={`nav-item ${currentView === 'laboratory' ? 'active' : ''}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mr-4">05</span>
            Code Laboratory
          </button>
        </div>

         <div className="p-10 border-b border-border border-t bg-bg-main/50">
           <span className="type-label text-text-main">Statistics</span>
         </div>

        <div className="p-10 space-y-4 pb-48">
          <MetricItem 
            label="Node Count" 
            value={Object.keys(nodeRegistry).length || clients.length || 0} 
          />
          <MetricItem 
            label="Verification Yield" 
            value={`${yieldValue}%`} 
          />
          <MetricItem 
            label="Computing Power" 
            value={`${powerValue} GB/s`} 
          />
        </div>
      </div>

      {/* Footer Branding Area: Institutional Pinned Bar */}
      <div className="p-10 bg-white flex flex-col gap-4 border-t border-border shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-text-main rounded-sm shadow-sm ring-1 ring-black/5">
            <Server size={14} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="type-label text-black font-bold">Research Node</span>
            <span className="type-label text-emerald-600 font-bold opacity-100 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
