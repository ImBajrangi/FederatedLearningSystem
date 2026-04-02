import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, Activity, ShieldCheck } from 'lucide-react';
import type { Client } from '../hooks/useSimulation';

interface TrainingWorkspaceProps {
  clients: Client[];
}

export const TrainingWorkspace: React.FC<TrainingWorkspaceProps> = ({ clients }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Active Training Cluster</h2>
        <p className="text-xs text-muted font-mono uppercase tracking-widest mt-1">Real-time Node Telemetry & Consensus Status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {clients.map((client, idx) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card rounded-sm p-4 relative overflow-hidden group"
            style={{ borderLeft: `4px solid ${client.status === 'BLOCKED' ? 'var(--error)' : 'var(--primary)'}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-mono font-bold text-primary">{client.id}</div>
                <div className="text-sm font-bold text-white uppercase tracking-tight">{client.org}</div>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                client.status === 'ACTIVE' ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'
              }`}>
                {client.status}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted font-mono">
                  <Cpu size={12} />
                  <span>LOAD</span>
                </div>
                <div className="text-xs font-mono text-white">{(Math.random() * 40 + 10).toFixed(1)}%</div>
              </div>
              <div className="w-full bg-border/20 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.random() * 40 + 10}%` }}
                  className="h-full bg-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted font-mono">
                  <Activity size={12} />
                  <span>TRUST</span>
                </div>
                <div className={`text-xs font-mono ${client.reputation > 50 ? 'text-primary' : 'text-error'}`}>
                  {client.reputation}%
                </div>
              </div>
              
              <div className="pt-2 border-t border-border/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-muted font-mono">
                  <ShieldCheck size={10} />
                  <span>SHARES: {client.validCount}</span>
                </div>
                <div className="text-[10px] text-muted font-mono italic">
                  {client.isMalicious ? 'ANOMALY_PROBE' : 'SECURE_AGGR'}
                </div>
              </div>
            </div>

            {/* Decoration */}
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <HardDrive size={40} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
