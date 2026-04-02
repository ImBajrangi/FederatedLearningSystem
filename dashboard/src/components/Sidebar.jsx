import React from 'react';
import { LayoutDashboard, Database, Activity, Library, Settings, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar = ({ 
  clients, 
  rejectedCount, 
  chainHeight, 
  currentView, 
  onViewChange 
}) => {
  return (
    <aside className="shell-sidebar">
      {/* 1. Branding Area */}
      <div className="p-8 border-b border-white/5 bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-lg shadow-xl shadow-indigo-500/30">
            <ShieldAlert size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight uppercase leading-none">
              Federated
            </h1>
            <h2 className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mt-2">
              Engine v3.1.2
            </h2>
          </div>
        </div>
      </div>

      {/* 2. Navigation Container (Scrollable) */}
      <nav className="sidebar-nav-scroll custom-scrollbar">
        {[
          { id: 'dashboard', label: 'Institutional Dashboard', icon: <LayoutDashboard size={18} /> },
          { id: 'training', label: 'Training Workspace', icon: <Activity size={18} /> },
          { id: 'dataset', label: 'Dataset Explorer', icon: <Database size={18} /> },
          { id: 'library', label: 'Model Architecture', icon: <Library size={18} /> }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
          >
            <span className="icon">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 3. Telemetry & Ledger (Independent Scrollable Area) */}
      <div className="sidebar-telemetry custom-scrollbar">
        <section className="mb-10">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-6">System Telemetry</div>
          <MetricItem label="Nodes connected" value={clients.length} />
          <MetricItem label="Consensus rounds" value="06" />
          <MetricItem label="Adversarial ratio" value="25%" color="#f59e0b" />
        </section>

        <section className="pt-8 border-t border-white/5 mb-10">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-6">Security Tracking</div>
          <MetricItem label="Chain integrity" value={`${chainHeight} blocks`} />
          <MetricItem label="Anomalies detected" value={rejectedCount} color="#ef4444" />
        </section>

        <section className="pt-8 border-t border-white/5 space-y-6">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Institutional Ledger</div>
          <div className="space-y-6">
            {clients.map(client => (
              <div key={client.id} className="group">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-slate-200 group-hover:text-indigo-400 transition-colors">
                      {client.id}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                      {client.org}
                    </span>
                  </div>
                  <span className="font-mono font-extrabold text-[10px]" style={{ color: client.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>
                    {client.reputation}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full overflow-hidden h-[4px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${client.reputation}%` }}
                    className="h-full bg-indigo-500/60 group-hover:bg-indigo-500 transition-colors"
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Sidebar Footer */}
      <div className="p-6 border-t border-white/5 bg-slate-900/50 shrink-0">
        <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full font-bold">
          <Settings size={18} />
          <span className="text-[10px] uppercase tracking-widest">Protocol Settings</span>
        </button>
      </div>
    </aside>
  );
};

const MetricItem = ({ label, value, color = "#6366f1" }) => (
  <div className="flex justify-between items-center mb-4">
    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{label}</span>
    <span className="font-mono font-bold text-xs" style={{ color }}>{value}</span>
  </div>
);
