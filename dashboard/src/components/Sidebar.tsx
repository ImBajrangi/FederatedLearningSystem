import React from 'react';
import { LayoutDashboard, Database, Activity, Library, Settings, ShieldAlert } from 'lucide-react';
import type { Client } from '../hooks/useSimulation';

interface SidebarProps {
  clients: Client[];
  rejectedCount: number;
  chainHeight: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ clients, rejectedCount, chainHeight }) => {
  return (
    <aside className="w-80 h-full border-r flex flex-col overflow-y-auto" style={{ background: 'rgba(255,255,255,0.02)' }}>
      {/* Navigation */}
      <nav className="p-4 border-b" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
        <NavItem icon={<Activity size={18} />} label="Training Workspace" />
        <NavItem icon={<Database size={18} />} label="Dataset Explorer" />
        <NavItem icon={<Library size={18} />} label="Model Library" />
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

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button
    className="flex items-center gap-3 px-3 py-2 rounded-sm"
    style={{
      width: '100%',
      border: 'none',
      borderLeft: active ? '2px solid var(--primary)' : '2px solid transparent',
      background: active ? 'rgba(19, 236, 73, 0.1)' : 'transparent',
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s'
    }}
  >
    {icon}
    <span className="font-bold tracking-tight text-sm">{label}</span>
  </button>
);

const MetricItem = ({ label, value, color = "var(--primary)" }: { label: string, value: string | number, color?: string }) => (
  <div className="flex justify-between items-center mb-3" style={{ marginBottom: '12px' }}>
    <span className="text-muted uppercase tracking-widest font-bold" style={{ fontSize: '10px' }}>{label}</span>
    <span className="font-mono font-bold text-sm" style={{ color }}>{value}</span>
  </div>
);
