import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, Activity, ShieldCheck, Server, Globe } from 'lucide-react';

export const TrainingWorkspace = ({ clients }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50">
      {/* 1. Page Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Active Training Cluster</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Real-time Institutional Node Telemetry & Consensus Matrix
            </p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200">
                <Server size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{clients.length} Active Nodes</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-md border border-emerald-100">
                <Globe size={14} className="text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Sync: Nominal</span>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Client Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto pb-32">
          {clients.map((client, idx) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`card p-6 relative overflow-hidden group transition-all ${
                client.status === 'BLOCKED' ? 'border-red-200 bg-red-50/20' : 'hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{client.id}</div>
                  <div className="text-sm font-extrabold text-slate-700 mt-0.5">{client.org}</div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm border ${
                  client.status === 'ACTIVE' 
                    ? 'bg-emerald-500 text-white border-emerald-600' 
                    : 'bg-red-500 text-white border-red-600'
                }`}>
                  {client.status}
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <div className="flex items-center gap-1.5">
                      <Cpu size={12} />
                      <span>Processing load</span>
                    </div>
                    <span className="text-slate-600">{(Math.random() * 40 + 10).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.random() * 40 + 10}%` }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <Activity size={12} />
                    <span>Trust score</span>
                  </div>
                  <div className={`text-xs font-bold ${client.reputation > 50 ? 'text-indigo-600' : 'text-red-600'}`}>
                    {client.reputation}%
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                    <ShieldCheck size={14} className="text-indigo-400" />
                    <span>Shares: {client.validCount}</span>
                  </div>
                  <div className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    client.isMalicious ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {client.isMalicious ? 'Anomalous' : 'Institutional'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
