import React from 'react';
import { motion } from 'framer-motion';
import { Database, BarChart3, ShieldCheck, HardDrive, Info } from 'lucide-react';

export const DatasetExplorer = () => {
  const shards = Array.from({ length: 8 }, (_, i) => ({
    id: `SHARD-${i.toString().padStart(3, '0')}`,
    size: Math.floor(Math.random() * 500 + 200),
    labels: ['Class A', 'Class B', 'Class C'],
    distribution: [Math.random() * 40, Math.random() * 30, Math.random() * 20]
  }));

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50">
      {/* 1. Integrated Page Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Dataset Distribution Explorer</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Secure Institutional Data Partitioning Registry
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-md border border-indigo-100">
             <Database size={14} className="text-indigo-600" />
             <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Total capacity: 12.4 TB</span>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
          
          {/* Global Analytics Section */}
          <section className="card p-8 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2.5 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-200">
                <BarChart3 className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Network label density</h3>
                <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Non-IID Distribution across federated shards</p>
              </div>
            </div>
            
            <div className="h-48 flex items-end justify-between gap-2 px-4 border-l-2 border-b-2 border-slate-100 pb-3">
              {Array.from({ length: 24 }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.random() * 80 + 10}%` }}
                  className="flex-1 bg-indigo-100 hover:bg-indigo-500 transition-all rounded-t-sm relative group cursor-pointer"
                >
                  <div className="absolute opacity-0 group-hover:opacity-100 -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded shadow-xl text-[10px] font-bold whitespace-nowrap z-40 border border-slate-700">
                    Density: {Math.floor(Math.random() * 100)}%
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            {/* Shard Registry List */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-1">
                <h4 className="label text-slate-400">Active institutional fragments</h4>
                <div className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded cursor-help flex items-center gap-1">
                   <Info size={10} /> Sync Status: Stable
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shards.map((shard) => (
                  <div key={shard.id} className="card p-6 hover:shadow-md transition-all group border-slate-200/60 transition-all">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                          <HardDrive size={16} className="text-slate-400 group-hover:text-indigo-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{shard.id}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-tighter">
                        {shard.size} MB
                      </span>
                    </div>
                    
                    <div className="space-y-2.5">
                      {shard.distribution.slice(0, 2).map((dist, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                            <span>Class {String.fromCharCode(65 + i)} Distribution</span>
                            <span className="text-indigo-600">{dist.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${dist * 2.5}%` }}
                              className="h-full bg-indigo-500/80 group-hover:bg-indigo-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Registry Info Panel */}
            <div className="space-y-8 sticky top-0">
              <div className="card p-8 border-indigo-200 border-2 bg-white shadow-indigo-100/20">
                <h4 className="text-xs font-bold text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-600" /> 
                  Infrastructure Policy
                </h4>
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <div className="label text-slate-400" style={{ fontSize: '9px' }}>Encryption layer</div>
                    <div className="text-[11px] font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded border border-slate-200 block w-full">
                      AES-256-GCM (Hardware Enclave)
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 pt-4 border-t border-slate-100">
                    <div className="label text-slate-400" style={{ fontSize: '9px' }}>Privacy mechanism</div>
                    <div className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded border border-indigo-100 block w-full">
                      DP-REPLACE-ONE (ε=1.2)
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed italic mt-4">
                     Multi-party computation (MPC) is enforced for all cross-institutional gradient alignment. Data never leaves the local firewall.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
