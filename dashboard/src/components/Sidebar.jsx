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
  PieChart
} from 'lucide-react';

const MetricItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-border group">
    <div className="flex flex-col">
      <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">{label}</span>
      <span className="text-xs font-bold text-text-main tabular-nums">{value}</span>
    </div>
  </div>
);

export const Sidebar = ({ currentView, setView, clients }) => {
  return (
    <aside className="shell-sidebar">
      {/* Sidebar Navigation */}
      <div className="sidebar-nav-scroll custom-scrollbar">
        <div className="mb-10 px-12">
           <span className="text-[10px] font-bold text-text-main uppercase tracking-[0.25em] serif">Coursework</span>
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
            onClick={() => setView('dataset')}
            className={`nav-item ${currentView === 'dataset' ? 'active' : ''}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mr-4">03</span>
            Shard Registry
          </button>

          <button 
            onClick={() => setView('library')}
            className={`nav-item ${currentView === 'library' ? 'active' : ''}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mr-4">04</span>
            Model Library
          </button>
        </div>

        <div className="mt-16 px-12 mb-8">
           <span className="text-[10px] font-bold text-text-main uppercase tracking-[0.25em] serif">Statistics</span>
        </div>

        <div className="px-12 space-y-2 pb-20">
          <MetricItem 
            label="Node Count" 
            value={clients.length} 
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
      <div className="p-12 border-t border-border mt-auto">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen size={14} className="text-primary" />
          <span className="text-[10px] font-bold text-text-main uppercase tracking-widest serif">Research Node</span>
        </div>
        <div className="flex flex-col gap-1">
           <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Session ID:</span>
           <span className="text-[10px] font-bold text-primary font-mono select-all">BC-7724</span>
        </div>
      </div>
    </aside>
  );
};
