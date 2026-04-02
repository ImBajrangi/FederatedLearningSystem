import React from 'react';
import { LayoutDashboard, Database, Activity, Library, Settings, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Client } from '../hooks/useSimulation';

type ViewType = 'dashboard' | 'training' | 'dataset' | 'library';

interface SidebarProps {
  clients: Client[];
  rejectedCount: number;
  chainHeight: number;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  clients, 
  rejectedCount, 
  chainHeight, 
  currentView, 
  onViewChange 
}) => {
  return (
    <aside className="w-80 h-full border-r border-white/5 flex flex-col overflow-y-auto" style={{ background: '#000000' }}>
      {/* Navigation */}
      <nav className="p-4 border-b border-white/5 flex flex-col gap-0.5">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
          { id: 'training', label: 'Training Workspace', icon: <Activity size={14} /> },
          { id: 'dataset', label: 'Dataset Explorer', icon: <Database size={14} /> },
          { id: 'library', label: 'Model Library', icon: <Library size={14} /> }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as any)}
            className={`group flex items-center gap-3 px-3 py-2 rounded-sm transition-all relative overflow-hidden ${
              currentView === item.id ? 'text-primary' : 'text-text-muted hover:text-white'
            }`}
          >
            {currentView === item.id && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 bg-white/[0.03] border-l-2 border-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span className={`relative z-10 transition-transform duration-200 ${currentView === item.id ? 'scale-105' : 'group-hover:translate-x-0.5'}`}>
              {item.icon}
            </span>
            <span className="relative z-10 font-bold uppercase tracking-widest text-[9px]">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* System Metrics */}
      <div className="p-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <h3 className="text-muted uppercase tracking-widest font-bold mb-4" style={{ fontSize: '10px' }}>
            System Metrics
          </h3>
          <MetricItem label="Clients Connected" value={clients.length} />
          <MetricItem label="Target Rounds" value="6" />
          <MetricItem label="Adversarial Nodes" value="25%" color="var(--warning)" />
        </section>

        <section>
          <h3 className="text-muted uppercase tracking-widest font-bold mb-4 flex items-center justify-between" style={{ fontSize: '10px' }}>
            Live Tracking
            <ShieldAlert size={12} style={{ color: 'var(--error)' }} />
          </h3>
          <MetricItem label="Chain Height" value={chainHeight} />
          <MetricItem label="Anomalies Found" value={rejectedCount} color="var(--error)" />
        </section>

        <section style={{ flex: 1 }}>
          <h3 className="text-muted uppercase tracking-widest font-bold mb-4" style={{ fontSize: '10px' }}>
            Credibility Ledger
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {clients.map(client => (
              <div key={client.id} style={{ cursor: 'default' }}>
                <div className="flex justify-between items-end mb-1" style={{ marginBottom: '6px' }}>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">
                      {client.id}
                    </span>
                    <span className="font-mono text-muted" style={{ fontSize: '9px' }}>
                      {client.org}
                    </span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '10px', color: client.status === 'ACTIVE' ? 'var(--primary)' : 'var(--error)' }}>
                    {client.reputation}
                  </span>
                </div>
                <div className="w-full" style={{ height: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(client.reputation / 200) * 100}%`,
                      background: client.status === 'ACTIVE' ? 'var(--primary)' : 'var(--error)',
                      transition: 'width 0.7s ease-out'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 border-t" style={{ marginTop: 'auto' }}>
        <button className="flex items-center gap-2 p-2 text-muted uppercase tracking-widest font-bold" style={{ fontSize: '10px', border: 'none', background: 'none', cursor: 'pointer' }}>
          <Settings size={14} />
          <span>System Settings</span>
        </button>
      </div>
    </aside>
  );
};


const MetricItem = ({ label, value, color = "var(--primary)" }: { label: string, value: string | number, color?: string }) => (
  <div className="flex justify-between items-center mb-3" style={{ marginBottom: '12px' }}>
    <span className="text-muted uppercase tracking-widest font-bold" style={{ fontSize: '10px' }}>{label}</span>
    <span className="font-mono font-bold text-sm" style={{ color }}>{value}</span>
  </div>
);
