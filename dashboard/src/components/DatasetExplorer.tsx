import React from 'react';
import { motion } from 'framer-motion';
import { Database, Share2, Layers, BarChart3 } from 'lucide-react';

export const DatasetExplorer: React.FC = () => {
  const shards = Array.from({ length: 8 }, (_, i) => ({
    id: `SHARD-${i.toString().padStart(3, '0')}`,
    size: Math.floor(Math.random() * 500 + 200),
    labels: ['Class A', 'Class B', 'Class C'],
    distribution: [Math.random() * 40, Math.random() * 30, Math.random() * 20]
  }));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Dataset Distribution Explorer</h2>
        <p className="text-xs text-muted font-mono uppercase tracking-widest mt-1">Non-IID Sharding & Federated Data Partitioning Registry</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-primary" size={20} />
                <h3 className="text-sm font-bold text-white uppercase">Label Density Across Federation</h3>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2 px-4 border-l border-b border-border/20 py-2">
              {Array.from({ length: 24 }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.random() * 90 + 5}%` }}
                  className="flex-1 bg-primary/20 hover:bg-primary transition-colors rounded-t-sm relative group"
                >
                  <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 bg-surface px-2 py-1 rounded-sm text-[8px] font-mono whitespace-nowrap z-10 border border-border">
                    {Math.floor(Math.random() * 100)}%
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shards.map((shard) => (
              <div key={shard.id} className="glass rounded-sm p-4 border-l-2 border-primary/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-muted" />
                    <span className="text-xs font-mono font-bold text-white">{shard.id}</span>
                  </div>
                  <span className="text-[10px] text-muted font-mono">{shard.size} MB</span>
                </div>
                
                <div className="space-y-1">
                  {shard.distribution.map((dist, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-full bg-border/20 h-1 rounded-full">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${dist * 2.5}%` }}
                          className="h-full bg-primary/60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-sm p-6" style={{ border: '1px dashed rgba(19, 236, 73, 0.2)' }}>
            <h4 className="text-xs font-mono font-bold text-primary mb-4 uppercase tracking-widest">Shard Registry Metadata</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Share2 size={16} className="text-muted mt-0.5" />
                <div>
                  <div className="text-[10px] text-white font-bold font-mono">ENCRYPTION: AES-256-GCM</div>
                  <div className="text-[10px] text-muted font-mono leading-relaxed mt-1">Multi-party computation (MPC) based sharding active. Data remains local at all times.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers size={16} className="text-muted mt-0.5" />
                <div>
                  <div className="text-[10px] text-white font-bold font-mono">SAMPLING: DP-REPLACE-ONE</div>
                  <div className="text-[10px] text-muted font-mono leading-relaxed mt-1">Differential Privacy budget ε=1.2. Privacy budget rotation occurs every 24h.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
