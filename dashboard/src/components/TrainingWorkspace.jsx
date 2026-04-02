import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, Activity, ShieldCheck, Server, Globe } from 'lucide-react';

export const TrainingWorkspace = ({ clients }) => {
  return (
    <div className="flex flex-col gap-10">
      {/* 1. Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight uppercase">Active Training Cluster</h2>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-2">
            Real-time Institutional Node Telemetry & Consensus Matrix
          </p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
              <Server size={16} className="text-slate-400" />
              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">{clients.length} Active Nodes</span>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100 shadow-sm">
              <Globe size={16} className="text-emerald-600" />
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Nominal Status</span>
           </div>
        </div>
      </div>

      {/* 2. Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
        {clients.map((client, idx) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`data-card group transition-all ${
              client.status === 'BLOCKED' ? 'border-red-200 bg-red-50/20' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest">{client.id}</div>
                <div className="text-sm font-extrabold text-slate-700 mt-1">{client.org}</div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-sm border ${
                client.status === 'ACTIVE' 
                  ? 'bg-emerald-500 text-white border-emerald-600' 
                  : 'bg-red-500 text-white border-red-600'
              }`}>
                {client.status}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-indigo-400" />
                    <span>Processing Load</span>
                  </div>
                  <span className="text-slate-600 font-mono">{(Math.random() * 40 + 10).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.random() * 40 + 10}%` }}
                    className="h-full bg-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <Activity size={14} className="text-indigo-400" />
                  <span>Trust Score</span>
                </div>
                <div className={`text-xs font-extrabold font-mono ${client.reputation > 50 ? 'text-indigo-600' : 'text-red-600'}`}>
                  {client.reputation}%
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Valid: {client.validCount}</span>
                </div>
                <div className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                  client.isMalicious ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {client.isMalicious ? 'Anomalous' : 'Institutional'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
