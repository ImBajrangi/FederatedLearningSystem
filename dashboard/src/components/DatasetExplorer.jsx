import React from 'react';
import { Database, ShieldCheck, Share2, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export const DatasetExplorer = () => {
  const fragments = [
    { id: 'SHARD-001-A', org: 'MedCenter Alpha', size: '420', density: 92, status: 'VERIFIED', type: 'Clinical', utilization: 78 },
    { id: 'SHARD-002-B', org: 'FinGroup Beta', size: '850', density: 85, status: 'VERIFIED', type: 'Financial', utilization: 64 },
    { id: 'SHARD-003-G', org: 'GovService Gamma', size: '120', density: 98, status: 'VERIFIED', type: 'Public', utilization: 91 },
    { id: 'SHARD-004-D', org: 'EduTrust Delta', size: '310', density: 74, status: 'VERIFIED', type: 'Academic', utilization: 45 },
    { id: 'SHARD-005-E', org: 'TechOps Epsilon', size: '640', density: 88, status: 'VERIFIED', type: 'Operational', utilization: 82 },
    { id: 'SHARD-006-Z', org: 'Hospital Zeta', size: '550', density: 95, status: 'VERIFIED', type: 'Imaging', utilization: 88 },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Registry Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight uppercase">Dataset Distribution Explorer</h2>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-2">
            Multi-Institutional Data Fragment Sharding Registry
          </p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-lg border border-slate-200 shadow-sm">
             <Database size={16} className="text-indigo-400" />
             <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest leading-none">Total: 12.4 TB Sharded</span>
           </div>
        </div>
      </div>

      {/* Registry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
        {fragments.map((frag, idx) => (
          <motion.div
            key={frag.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="data-card group"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest mb-1">
                   {frag.type} node fragment
                </div>
                <h4 className="text-sm font-extrabold text-slate-800 truncate max-w-[180px]">
                  {frag.id}
                </h4>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                <ShieldCheck size={16} className="text-slate-400 group-hover:text-indigo-500" />
              </div>
            </div>

            <div className="space-y-6">
              {/* Data Density Visualization */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <span>Shard Density</span>
                  <span className="text-slate-600">{frag.density}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border">
                   <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: `${frag.density}%` }}
                     className="h-full bg-indigo-500 shadow-sm"
                   />
                </div>
              </div>

              {/* Fragment Meta Attributes */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div>
                   <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-tighter mb-1">Scale</div>
                   <div className="text-xs font-bold text-slate-700">{frag.size} MB</div>
                </div>
                <div>
                   <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-tighter mb-1">Utilization</div>
                   <div className="text-xs font-bold text-slate-700">{frag.utilization}%</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live Sync: STABLE
              </span>
              <button className="text-[9px] font-extrabold uppercase text-slate-400 hover:text-indigo-600 transition-colors">
                 Inspect Shard
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
