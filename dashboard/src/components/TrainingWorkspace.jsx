import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Activity, ShieldCheck, Server, Globe, Zap, Network, Settings2, Code, Terminal as TerminalIcon } from 'lucide-react';
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

export const TrainingWorkspace = ({ clients, logs = [], accuracyHistory = [] }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* 1. Module Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
           <div className="flex items-center gap-3 text-primary mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Module 04</span>
              <span className="w-8 h-px bg-primary/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Chapter 4: Neural Networks</span>
           </div>
           <h2 className="text-3xl font-bold text-text-main serif">Training Workspace</h2>
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
                    <Settings2 size={14} className="text-primary" />
                    <span className="text-[11px] font-bold text-text-main uppercase tracking-widest serif">Hyperparameters</span>
                 </div>
                 <button className="text-[9px] font-bold text-primary uppercase tracking-widest hover:underline">Reset to defaults</button>
              </div>
              <div className="grid grid-cols-3 gap-8">
                 <ConfigInput label="Learning Rate" value="0.010" />
                 <ConfigInput label="Batch Size" value="64" />
                 <ConfigInput label="Epochs" value="100" />
              </div>
           </div>

           {/* Model Architecture View */}
           <div className="academic-card flex flex-col !p-0 overflow-hidden min-h-[400px]">
              <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-bg-main">
                 <div className="flex items-center gap-3">
                    <Code size={14} className="text-primary" />
                    <span className="text-[11px] font-bold text-text-main uppercase tracking-widest serif">Model Architecture</span>
                    <span className="px-2 py-0.5 bg-border text-[9px] font-mono text-text-muted border border-border">model.py</span>
                 </div>
              </div>
              <div className="flex-1 overflow-auto bg-white p-8 font-mono text-xs leading-relaxed selection:bg-primary/10">
                 <pre className="text-text-main opacity-80">
                   <span className="text-blue-600">import</span> torch<br/>
                   <span className="text-blue-600">import</span> torch.nn <span className="text-blue-600">as</span> nn<br/><br/>
                   <span className="text-purple-600">class</span> <span className="text-blue-900">SimpleMLP</span>(nn.Module):<br/>
                   &nbsp;&nbsp;<span className="text-blue-600">def</span> <span className="text-blue-900">__init__</span>(self, input_size):<br/>
                   &nbsp;&nbsp;&nbsp;&nbsp;super().__init__()<br/>
                   &nbsp;&nbsp;&nbsp;&nbsp;self.fc1 = nn.Linear(input_size, 128)<br/>
                   &nbsp;&nbsp;&nbsp;&nbsp;self.relu = nn.ReLU()<br/>
                   &nbsp;&nbsp;&nbsp;&nbsp;self.fc2 = nn.Linear(128, 10)<br/><br/>
                   &nbsp;&nbsp;<span className="text-blue-600">def</span> <span className="text-blue-900">forward</span>(self, x):<br/>
                   &nbsp;&nbsp;&nbsp;&nbsp;out = self.fc1(x)<br/>
                   &nbsp;&nbsp;&nbsp;&nbsp;out = self.relu(out)<br/>
                   &nbsp;&nbsp;&nbsp;&nbsp;out = self.fc2(out)<br/>
                   &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-600">return</span> out
                 </pre>
              </div>
           </div>
        </div>

        {/* Right Column: Metrics & Console */}
        <div className="flex-1 flex flex-col gap-8">
           {/* Training Metrics Chart */}
           <div className="academic-card flex flex-col !p-0 min-h-[350px]">
              <div className="flex items-center justify-between px-8 py-4 border-b border-border">
                 <div className="flex items-center gap-3">
                    <Activity size={14} className="text-primary" />
                    <span className="text-[11px] font-bold text-text-main uppercase tracking-widest serif">Training Metrics</span>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-0.5 bg-primary" />
                       <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Training Loss</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-0.5 bg-accent" />
                       <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Validation Loss</span>
                    </div>
                 </div>
              </div>
              <div className="flex-1 p-10 bg-white">
                 <MetricsChart data={accuracyHistory} />
              </div>
           </div>

            {/* Console Output (Grounded Dark) */}
           <div className="flex flex-col grounded-dark overflow-hidden transition-all min-h-[350px]">
              <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.02]">
                 <div className="flex items-center gap-3">
                    <TerminalIcon size={12} className="text-primary/70" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] font-mono">Console Output</span>
                 </div>
                 <button className="text-[9px] font-bold text-white/50 uppercase tracking-widest hover:text-white transition-colors font-mono px-3 py-1 border border-white/10 hover:bg-white/5 bg-transparent">Clear</button>
              </div>
              <div className="flex-1 overflow-auto p-8 font-mono text-[11px] leading-6 text-white/60 custom-scrollbar-terminal">
                 {logs.map((log, i) => (
                   <div key={i} className="flex gap-4">
                     <span className="text-white/20 shrink-0 select-none">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                     <span className={log.includes('COMPLETE') ? 'text-primary' : log.includes('ERR') ? 'text-error' : ''}>
                        {log}
                     </span>
                   </div>
                 ))}
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
