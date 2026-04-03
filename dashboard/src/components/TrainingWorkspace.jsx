import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Activity, ShieldCheck, Server, Globe, Zap, Network, Settings2, Code, Database, Terminal as TerminalIcon } from 'lucide-react';
import { MetricsChart } from './MetricsChart';
import { Terminal } from './Terminal';

const ConfigInput = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2.5">
    <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">{label}</label>
    <div className="border border-border p-3 flex items-center justify-center bg-white shadow-sm h-11">
      <span className="text-xs font-mono font-bold text-text-main tabular-nums tracking-wider">{value}</span>
    </div>
  </div>
);

export const TrainingWorkspace = ({ clients, logs = [], accuracyHistory = [], lossHistory = [], hyperparams, roundHistory = [], modelArchitecture }) => {
   const defaultHyperparams = {
      learning_rate: 0.01,
      batch_size: 32,
      epochs: 1
   };
   
   const hp = hyperparams || defaultHyperparams;
  return (
    <div className="flex-1 p-10 flex flex-col gap-4 section-fade">
      {/* 1. Module Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
           <div className="flex items-center gap-2 text-primary mb-2">
              <span className="type-label">Module 04</span>
              <span className="w-6 h-px bg-primary/20" />
              <span className="type-label text-text-muted opacity-70">Chapter 4: Neural Networks</span>
           </div>
           <h2 className="type-l1 serif text-text-main">Training Workspace</h2>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">GPU: Ready</span>
           </div>
           <button className="btn btn-primary h-10 px-8 flex items-center gap-2 group">
              <span className="uppercase tracking-widest text-[10px] font-bold">Run Training</span>
              <div className="w-4 h-px bg-white/30 group-hover:w-6 transition-all" />
           </button>
        </div>
      </div>

      {/* 2. Structured 50/50 Split (Flow Layout) */}
      <div className="flex gap-8">
        {/* Left Column: Configuration & Model */}
        <div className="flex-1 flex flex-col gap-8">
           {/* Hyperparameters Card */}
           <div className="academic-card !p-8">
               <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                     <Settings2 size={13} className="text-primary/70" />
                     <span className="type-l3 text-text-main">Hyperparameters</span>
                  </div>
                  <button className="type-label text-primary hover:underline">Reset to defaults</button>
               </div>
              <div className="grid grid-cols-3 gap-8">
                 <ConfigInput label="Learning Rate" value={hp.learning_rate.toFixed(3)} />
                 <ConfigInput label="Batch Size" value={hp.batch_size.toString()} />
                 <ConfigInput label="Epochs" value={hp.epochs.toString()} />
              </div>
           </div>

           {/* Institutional Parameter Audit Ledger */}
           <div className="academic-card !p-0 overflow-hidden shadow-sm border-primary/10">
              <div className="px-8 py-5 border-b border-border bg-slate-50/50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Database size={12} className="text-primary/70" />
                    <span className="type-l3 text-text-main">Institutional Parameter Audit Ledger</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="type-label text-text-muted opacity-60 uppercase tracking-widest shrink-0">Live Audit Sync</span>
                 </div>
              </div>
              <div className="max-h-[320px] overflow-auto custom-scrollbar">
                 <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                       <tr className="border-b border-border shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          <th className="px-8 py-3 type-label text-text-muted/60 font-bold uppercase tracking-widest">Rnd</th>
                          <th className="px-4 py-3 type-label text-text-muted/60 font-bold uppercase tracking-widest">Node_ID</th>
                          <th className="px-4 py-3 type-label text-text-muted/60 font-bold uppercase tracking-widest">LR</th>
                          <th className="px-4 py-3 type-label text-text-muted/60 font-bold uppercase tracking-widest">Batch</th>
                          <th className="px-4 py-3 type-label text-text-muted/60 font-bold uppercase tracking-widest text-right">Acc %</th>
                          <th className="px-8 py-3 type-label text-text-muted/60 font-bold uppercase tracking-widest text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                       {roundHistory.length === 0 ? (
                          <tr>
                             <td colSpan="6" className="px-8 py-16 text-center text-[10px] uppercase tracking-[0.25em] text-text-muted/30 font-medium">
                                Awaiting initial orchestration cycle...
                             </td>
                          </tr>
                       ) : (
                          [...roundHistory].reverse().map((row, idx) => (
                             <tr key={idx} className="hover:bg-primary/[0.02] transition-colors group">
                                <td className="px-8 py-4 font-mono text-[10px] text-text-main font-bold tabular-nums">#{row.round.toString().padStart(2, '0')}</td>
                                <td className="px-4 py-4">
                                   <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-text-main font-mono">{row.client}</span>
                                      <span className="text-[8px] text-text-muted/50 uppercase tracking-widest leading-tight">Secure_Node_v{idx + 1}</span>
                                   </div>
                                </td>
                                <td className="px-4 py-4 font-mono text-[10px] text-text-muted tabular-nums">{row.lr.toFixed(3)}</td>
                                <td className="px-4 py-4 font-mono text-[10px] text-text-muted tabular-nums">{row.batch}</td>
                                <td className="px-4 py-4 text-right font-mono text-[10px] text-emerald-600 font-bold tabular-nums">{(row.acc * 100).toFixed(1)}%</td>
                                <td className="px-8 py-4 text-right">
                                   <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[2px] text-[8px] font-bold uppercase tracking-widest">
                                      <ShieldCheck size={8} />
                                      <span>Verified</span>
                                   </div>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Model Architecture View */}
           <div className="academic-card flex flex-col !p-0 overflow-hidden min-h-[400px]">
               <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-bg-main">
                  <div className="flex items-center gap-3">
                     <Code size={13} className="text-primary/70" />
                     <span className="type-l3 text-text-main">Model Architecture</span>
                     <span className="px-2 py-0.5 bg-border type-label text-text-muted tracking-widest uppercase">model.py</span>
                  </div>
               </div>
              <div className="flex-1 overflow-auto bg-white p-8 font-mono text-[10px] leading-relaxed selection:bg-primary/10 transition-all">
                 <pre className="text-text-main opacity-80 whitespace-pre scroll-smooth">
                    {modelArchitecture}
                 </pre>
              </div>
           </div>
        </div>

        {/* Right Column: Metrics & Console */}
        <div className="flex-1 flex flex-col gap-8">
           {/* Training Metrics Chart */}
           <div className="academic-card flex flex-col !p-0 min-h-[420px]">
               <div className="flex items-center justify-between px-8 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                     <Activity size={13} className="text-primary/70" />
                     <span className="type-l3 text-text-main">Training Metrics</span>
                  </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-0.5 bg-primary" />
                       <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Accuracy</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-0.5 bg-error" />
                       <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Loss</span>
                    </div>
                 </div>
              </div>
              <div className="flex-1 p-10 bg-white">
                 <MetricsChart data={accuracyHistory} lossData={lossHistory} />
              </div>
           </div>

            {/* Console Output (Grounded Dark) */}
           <div className="flex flex-col grounded-dark overflow-hidden transition-all min-h-[350px]">
               <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                     <TerminalIcon size={11} className="text-primary/50" />
                     <span className="type-label text-white/40">Console Output</span>
                  </div>
                  <button className="type-label text-white/50 hover:text-white transition-colors border border-white/10 px-3 py-1 bg-transparent hover:bg-white/5">Clear</button>
               </div>
              <div className="flex-1 overflow-auto p-8 font-mono text-[11px] leading-6 text-white/60 custom-scrollbar-terminal">
                 {logs.map((log, i) => {
                    const logObj = typeof log === 'object' ? log : { msg: log };
                    const isComplete = logObj.msg.includes('COMPLETE') || logObj.msg.includes('FINISHED');
                    const isError = logObj.msg.includes('ERR') || logObj.msg.includes('CRITICAL');
                    return (
                      <div key={i} className="flex gap-4">
                        <span className="text-white/20 shrink-0 select-none">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                        <span className={isComplete ? 'text-primary' : isError ? 'text-error' : ''}>
                           {logObj.msg}
                        </span>
                      </div>
                    );
                 })}
                 <div className="flex gap-4 items-center">
                    <span className="text-white/20 shrink-0 select-none">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    <span className="w-1.5 h-3 bg-primary animate-pulse" />
                    <span className="text-white/80">Awaiting execution command...</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar-terminal::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-terminal::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar-terminal::-webkit-scrollbar-thumb { background: #222; }
      `}</style>
    </div>
  );
};
