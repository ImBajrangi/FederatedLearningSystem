import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Play, ShieldCheck, Terminal, Save, Zap, AlertCircle, RefreshCw, Cpu, Database } from 'lucide-react';

const DEFAULT_MODEL_CODE = `import torch
import torch.nn as nn
import torch.nn.functional as F

class MNISTNet(nn.Module):
    """
    Institutional Model Architecture
    Define your layers and forward pass below.
    """
    def __init__(self):
        super(MNISTNet, self).__init__()
        self.conv1 = nn.Conv2d(1, 10, kernel_size=5)
        self.conv2 = nn.Conv2d(10, 20, kernel_size=5)
        self.fc1 = nn.Linear(320, 50)
        self.fc2 = nn.Linear(50, 10)

    def forward(self, x):
        x = F.relu(F.max_pool2d(self.conv1(x), 2))
        x = F.relu(F.max_pool2d(self.conv2(x), 2))
        x = x.view(-1, 320)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return F.log_softmax(x, dim=1)
`;

export const Laboratory = ({ onAction }) => {
  const [code, setCode] = useState(DEFAULT_MODEL_CODE);
  const [status, setStatus] = useState('IDLE'); // IDLE, COMPILING, READY, ERROR, DEPLOYING
  const [logs, setLogs] = useState([]);
  const [errorLine, setErrorLine] = useState(null);
  const textAreaRef = useRef(null);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  };

  const handleCompile = async () => {
    setStatus('COMPILING');
    addLog('Initiating backend compilation protocol...', 'info');
    setErrorLine(null);

    try {
      const response = await fetch('/v1/laboratory/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await response.json();

      if (data.success) {
        setStatus('READY');
        addLog('Compilation successful. Architecture verified.', 'success');
      } else {
        setStatus('ERROR');
        const line = data.line || null;
        setErrorLine(line);

        // Detailed Compiler Feedback
        const errorType = data.type || 'Error';
        const errorMsg = data.error || 'Unknown syntax exception';
        const column = data.column ? ` (Col: ${data.column})` : '';

        addLog(`[${errorType}] Line ${line || '?'}${column}: ${errorMsg}`, 'error');
        addLog(`System Diagnostic: Execution halted due to architectural misalignment.`, 'error');
      }
    } catch (err) {
      setStatus('ERROR');
      addLog('FATAL: Could not connect to Institutional Compiler Service.', 'error');
      addLog(`Debug Info: ${err.message}`, 'error');
    }
  };

  const handleDeploy = async () => {
    if (status !== 'READY') {
      onAction('Code must be compiled before deployment.', 'error');
      return;
    }

    setStatus('DEPLOYING');
    addLog('Executing hot-swap deployment...', 'info');

    try {
      const response = await fetch('/v1/laboratory/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await response.json();

      if (data.success) {
        setStatus('IDLE');
        addLog('Global model hot-swapped. Synchronizing federation...', 'success');
        onAction('Model Architecture Updated Successfully', 'success');
      } else {
        setStatus('ERROR');
        addLog(`Deployment Failed: ${data.error}`, 'error');
      }
    } catch (err) {
      setStatus('ERROR');
      addLog('Deployment service unavailable.', 'error');
    }
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 25) }, (_, i) => i + 1);

  return (
    <div className="flex-1 flex flex-col h-full bg-white section-fade overflow-hidden">
      {/* Header Bar */}
      <div className="h-16 border-b border-border flex items-center justify-between px-8 bg-bg-main/30">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-text-main rounded-sm shadow-sm">
            <Code size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-text-main uppercase tracking-widest">Research Laboratory</h2>
            <span className="text-[10px] text-text-muted uppercase font-mono tracking-tighter">Interpreter & Compiler v1.2</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCompile}
            disabled={status === 'COMPILING' || status === 'DEPLOYING'}
            className={`h-9 px-6 flex items-center gap-3 border transition-all uppercase tracking-widest text-[9px] font-bold ${status === 'READY' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white border-border text-text-main hover:bg-bg-main'
              }`}
          >
            {status === 'COMPILING' ? <RefreshCw size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
            {status === 'READY' ? 'Architecture Verified' : 'Run Verification'}
          </button>

          <button
            onClick={handleDeploy}
            disabled={status !== 'READY' || status === 'DEPLOYING'}
            className={`h-9 px-6 flex items-center gap-3 bg-text-main text-white shadow-sm transition-all uppercase tracking-widest text-[9px] font-bold active:scale-95 disabled:opacity-30 disabled:grayscale`}
          >
            <Zap size={12} fill="currentColor" />
            Initiate Training
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* IDE Section */}
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden bg-white">
          <div className="flex-1 relative flex overflow-hidden">
            {/* Line Numbers gutter */}
            <div className="w-14 bg-bg-main border-r border-border flex flex-col items-end py-6 pr-4 select-none z-0">
              {lineNumbers.map(num => (
                <div
                  key={num}
                  className={`text-[10px] font-mono leading-6 ${errorLine === num ? 'text-red-600 font-bold' : 'text-text-muted/40'}`}
                >
                  {num}
                </div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              ref={textAreaRef}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (status === 'READY') setStatus('IDLE');
              }}
              spellCheck={false}
              className="flex-1 bg-white p-6 font-mono text-[12px] leading-6 text-black resize-none outline-none caret-blue-600 custom-scrollbar-ide z-10"
              style={{ fontWeight: 500 }}
            />
          </div>
        </div>

        {/* Sidebar Panel: Console & Specs */}
        <div className="w-96 flex flex-col bg-bg-main/20">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Status Panel */}
            <div className="p-8 border-b border-border">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4 block">Interpreter State</span>
              <div className={`p-4 border rounded-sm flex items-center gap-4 transition-all ${status === 'ERROR' ? 'border-red-200 bg-red-50' :
                  status === 'READY' ? 'border-emerald-200 bg-emerald-50' :
                    'border-border bg-white shadow-sm'
                }`}>
                {status === 'ERROR' ? <AlertCircle size={14} className="text-red-600" /> : <Terminal size={14} className="text-text-main/50" />}
                <span className={`text-[10px] font-bold uppercase tracking-widest ${status === 'ERROR' ? 'text-red-600' : status === 'READY' ? 'text-emerald-700' : 'text-text-main'
                  }`}>
                  {status === 'IDLE' ? 'System Awaiting Input' :
                    status === 'COMPILING' ? 'Validating Layers...' :
                      status === 'READY' ? 'Architecture Valid' :
                        status === 'ERROR' ? 'Syntax Exception' : 'Deploying...'}
                </span>
              </div>
            </div>

            {/* Console Output */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-8 py-4 border-b border-border flex items-center justify-between bg-white/50">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Lab Console</span>
                <button onClick={() => setLogs([])} className="text-[9px] text-text-muted hover:text-text-main uppercase font-bold tracking-widest">Clear</button>
              </div>
              <div className="flex-1 overflow-auto p-8 font-mono text-[10px] leading-6 space-y-2 custom-scrollbar-terminal bg-white/30">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-text-muted/30 shrink-0 select-none">[{log.time}]</span>
                    <span className={log.type === 'error' ? 'text-red-600 font-bold' : log.type === 'success' ? 'text-emerald-700 font-bold' : 'text-text-main/70'}>
                      {log.msg}
                    </span>
                  </div>
                ))}
                {logs.length === 0 && <div className="text-text-muted/30 italic">Awaiting local interaction...</div>}
              </div>
            </div>
          </div>

          {/* Hardware Specs */}
          <div className="p-8 border-t border-border bg-white">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Comp Environment</div>
                <div className="text-[10px] font-bold text-text-main font-mono">PyTorch 2.1.0</div>
              </div>
              <div className="space-y-1">
                <div className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Hardware Target</div>
                <div className="text-[10px] font-bold text-emerald-600 font-mono">CUDA v11.8</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar-ide::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-ide::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-ide::-webkit-scrollbar-thumb { background: #222; }
        .custom-scrollbar-ide { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};
