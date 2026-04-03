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

export const Sidebar = ({ currentView, setView, clients, width, onResize }) => {
  return (
    <aside className="shell-sidebar" style={{ width: width || 280, flexShrink: 0, position: 'relative' }}>
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
      <div className="sidebar-nav-scroll custom-scrollbar">
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
        </div>

         <div className="p-10 border-b border-border border-t bg-bg-main/50 mt-auto">
           <span className="type-label text-text-main">Statistics</span>
         </div>

        <div className="px-12 space-y-2 pb-20">
          <MetricItem 
            label="Node Count" 
            value={clients?.length || 0} 
          />
          <MetricItem 
            label="Verification Yield" 
            value="98.2%" 
          />
          <MetricItem 
            label="Computing Power" 
            value="1.2 GB/s" 
          />
        </div>
      </div>

      {/* Footer Branding Area */}
        <div className="p-10 bg-bg-main/80 flex flex-col gap-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-sm shadow-sm">
              <Server size={14} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="type-label text-text-main">Research Node</span>
              <span className="type-label text-emerald-600 opacity-80">Online</span>
            </div>
          </div>
        </div>
    </aside>
  );
};
