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
    <aside className="w-72 h-full flex flex-col overflow-hidden text-white" style={{ background: 'var(--bg-sidebar)' }}>
      {/* 1. Branding / Logo Area */}
      <div className="p-8 mb-4 border-b border-white/5 bg-slate-900/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-indigo-600 rounded-lg shadow-xl shadow-indigo-500/20">
            <ShieldAlert size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight uppercase leading-none">
              Federated
            </h1>
            <h2 className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase mt-1">
              Engine v3.1
            </h2>
          </div>
        </div>
      </div>

      <nav className="p-6 flex flex-col gap-2 shrink-0">
        {[
          { id: 'dashboard', label: 'Institutional Dashboard', icon: <LayoutDashboard size={18} /> },
          { id: 'training', label: 'Training Workspace', icon: <Activity size={18} /> },
          { id: 'dataset', label: 'Dataset Explorer', icon: <Database size={18} /> },
          { id: 'library', label: 'Model Architecture', icon: <Library size={18} /> }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`group flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all relative overflow-hidden font-bold tracking-tight ${
              currentView === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/10' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            {currentView === item.id && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute left-0 top-3 bottom-3 w-1.5 bg-white rounded-r-full"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span className={`relative z-10 transition-transform group-hover:scale-110 ${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}>
              {item.icon}
            </span>
            <span className="relative z-10 text-[11px] uppercase tracking-widest leading-none">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* 3. Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-32">
        <section>
          <div className="label mb-4 text-slate-500">System metrics</div>
          <MetricItem label="Nodes connected" value={clients.length} />
          <MetricItem label="Consensus rounds" value="06" />
          <MetricItem label="Adversarial ratio" value="25%" color="#f59e0b" />
        </section>

        <section className="pt-6 border-t border-white/5">
          <div className="label mb-4 text-slate-500">Live security tracking</div>
          <MetricItem label="Chain height" value={chainHeight} />
          <MetricItem label="Anomalies detected" value={rejectedCount} color="#ef4444" />
        </section>

        <section className="pt-6 border-t border-white/5 space-y-5">
          <div className="label text-slate-500">Credibility ledger</div>
          <div className="space-y-4">
            {clients.map(client => (
              <div key={client.id} className="group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                      {client.id}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-tighter">
                      {client.org}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[10px]" style={{ color: client.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>
                    {client.reputation}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full overflow-hidden" style={{ height: '3px' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${client.reputation}%` }}
                    className="h-full bg-indigo-600/50"
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Footer Actions */}
      <div className="p-4 border-t border-white/5 bg-slate-900/50 shrink-0">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors">
          <Settings size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
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
