import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Play, ShieldCheck, Terminal, Zap,
  AlertCircle, RefreshCw, Download, BarChart2,
  Activity, Settings, CheckCircle2, StopCircle, Cpu, Box
} from 'lucide-react';
import { API_BASE_URL } from '../hooks/useSecureFederated';

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

export const Laboratory = ({ onAction, labState, onExecuteCommand }) => {
  const [code, setCode] = useState(DEFAULT_MODEL_CODE);
  const [status, setStatus] = useState('IDLE');
  const [logs, setLogs] = useState([]);
  const [errorLine, setErrorLine] = useState(null);
  const textAreaRef = useRef(null);
  const gutterRef = useRef(null);

  const [epochs, setEpochs] = useState(5);
  const [lr, setLr] = useState(0.001);
  const [batchSize, setBatchSize] = useState(32);
  const [envData, setEnvData] = useState(null);
  const [isEnvLoading, setIsEnvLoading] = useState(false);
  const [detectedDeps, setDetectedDeps] = useState([]);
  const [neededParams, setNeededParams] = useState(['epochs', 'lr', 'batch_size']); // Default to all
  const [isInspecting, setIsInspecting] = useState(false);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  };

  // Sync scroll between gutter and textarea
  useEffect(() => {
    const textarea = textAreaRef.current;
    const gutter = gutterRef.current;
    if (!textarea || !gutter) return;
    const handleScroll = () => { gutter.scrollTop = textarea.scrollTop; };
    textarea.addEventListener('scroll', handleScroll);
    return () => textarea.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    if (!labState) return;
    if (labState.status === 'TRAINING') {
      setStatus('TRAINING');
      setProgress(labState.progress);
    } else if (labState.status === 'COMPLETE') {
      setStatus('COMPLETE');
      setProgress(100);
    } else if (labState.status === 'ERROR') {
      setStatus('ERROR');
      addLog(`Backend Error: ${labState.error}`, 'error');
    }
  }, [labState]);

  const fetchEnvironment = async () => {
    setIsEnvLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/laboratory/environment`);
      const data = await response.json();
      setEnvData(data);
    } catch (err) {
      console.error("Failed to fetch environment:", err);
    } finally {
      setIsEnvLoading(false);
    }
  };

  const inspectDependencies = async () => {
    if (!code.trim()) {
      setDetectedDeps([]);
      return;
    }
    setIsInspecting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/laboratory/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      if (data.success) {
        setDetectedDeps(data.dependencies);
        if (data.parameters && data.parameters.length > 0) {
          setNeededParams(data.parameters);
        } else if (code.trim()) {
          // If code exists but no params found, might be hardcoded
          setNeededParams([]);
        }
      }
    } catch (err) {
      console.error("Dependency inspection failed:", err);
    } finally {
      setIsInspecting(false);
    }
  };

  useEffect(() => {
    fetchEnvironment();
    const interval = setInterval(fetchEnvironment, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Debounced inspection
  useEffect(() => {
    const timer = setTimeout(inspectDependencies, 800);
    return () => clearTimeout(timer);
  }, [code]);

  const handlePurgeSandbox = async () => {
    if (!window.confirm("🧺 LIQUIDATE RESOURCE? This will delete all installed libraries in the sandbox to reclaim disk space. You will need to wait for a warm-up on next execution.")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/laboratory/purge`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        addLog("Sandbox resources liquidated successfully.", "warning");
        fetchEnvironment(); // Refresh env status
      } else {
        addLog(data.error || "Purge failed.", "error");
      }
    } catch (err) {
      addLog("Failed to connect to liquidation engine.", "error");
    }
  };

  const handleCompile = async () => {
    setStatus('COMPILING');
    addLog('Initiating backend compilation protocol...', 'info');
    setErrorLine(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/laboratory/validate`, {
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
        setErrorLine(data.line || null);
        addLog(`[${data.type || 'Error'}] Line ${data.line || '?'}: ${data.error}`, 'error');
      }
    } catch (err) {
      setStatus('ERROR');
      addLog('FATAL: Could not connect to Institutional Compiler Service.', 'error');
    }
  };

  const handleTrain = async () => {
    if (status !== 'READY' && status !== 'COMPLETE' && status !== 'IDLE') {
      onAction('Code must be verified before training.', 'error');
      return;
    }
    setStatus('TRAINING');
    addLog(`Starting training (Epochs: ${epochs}, LR: ${lr}, Batch: ${batchSize})...`, 'info');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/laboratory/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, hyperparams: { epochs, lr, batch_size: batchSize } })
      });
      const data = await response.json();
      if (!data.success) {
        setStatus('ERROR');
        addLog(`Failed to start training: ${data.message}`, 'error');
      }
    } catch (err) {
      setStatus('ERROR');
      addLog('Training service unreachable.', 'error');
    }
  };

  const handleAbort = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/laboratory/abort`, { method: 'POST' });
      setStatus('IDLE');
      addLog('Training abort signal sent.', 'warning');
    } catch (err) {
      addLog('Failed to abort training session.', 'error');
    }
  };

  const handleDownload = (format) => {
    window.open(`${API_BASE_URL}/api/v1/laboratory/download/${format}`, '_blank');
    addLog(`Initiating ${format.toUpperCase()} model download...`, 'info');
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 30) }, (_, i) => i + 1);
  const progress = labState?.progress || 0;

  const statusColor = status === 'READY' || status === 'COMPLETE' ? 'var(--success)'
    : status === 'ERROR' ? 'var(--error)'
      : status === 'TRAINING' ? 'var(--accent)'
        : 'var(--text-muted)';

  const statusLabel = {
    IDLE: 'Awaiting Input',
    COMPILING: 'Validating...',
    READY: 'Architecture Verified',
    TRAINING: labState?.mode === 'SCRIPT' ? 'Executing standalone script...' : `Training — Epoch ${labState?.epoch || 0}/${epochs}`,
    COMPLETE: labState?.mode === 'SCRIPT' ? 'Execution Complete' : 'Federated Training Complete',
    ERROR: 'Exception Raised'
  }[status] || status;

  return (
    <div className="lab-root">
      {/* ─── Compact Header Bar ─── */}
      <div className="lab-header">
        <div className="lab-header-left">
          <div className="lab-icon-box">
            <Code size={16} strokeWidth={2.5} />
          </div>
          <div className="lab-header-titles">
            <h2 className="lab-title">Research Laboratory</h2>
            <span className="lab-subtitle">Interpreter &amp; Compiler v1.5</span>
          </div>
          <div className="lab-status-pill" style={{ '--pill-color': statusColor }}>
            {status === 'COMPILING' || status === 'TRAINING' ? (
              <RefreshCw size={10} className="lab-spin" />
            ) : status === 'READY' || status === 'COMPLETE' ? (
              <CheckCircle2 size={10} />
            ) : status === 'ERROR' ? (
              <AlertCircle size={10} />
            ) : (
              <Cpu size={10} />
            )}
            <span>{statusLabel}</span>
          </div>
        </div>

        <div className="lab-header-actions">
          <button
            onClick={handleCompile}
            disabled={status === 'COMPILING' || status === 'TRAINING'}
            className={`lab-btn lab-btn-outline ${(status === 'READY' || status === 'COMPLETE') ? 'lab-btn-verified' : ''}`}
          >
            <ShieldCheck size={14} />
            <span>{status === 'READY' || status === 'COMPLETE' ? 'Verified' : 'Verify Code'}</span>
          </button>

          <button
            onClick={status === 'TRAINING' ? handleAbort : handleTrain}
            disabled={status === 'COMPILING'}
            className={`lab-btn ${status === 'TRAINING' ? 'lab-btn-danger' : 'lab-btn-primary'}`}
          >
            {status === 'TRAINING' ? <StopCircle size={14} /> : <Zap size={14} />}
            <span>{status === 'TRAINING' ? 'Abort' : 'Train Model'}</span>
          </button>
        </div>
      </div>

      {/* ─── Progress Strip (only during training/complete) ─── */}
      <AnimatePresence>
        {(status === 'TRAINING' || status === 'COMPLETE') && (
          <motion.div
            className="lab-progress-strip"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="lab-progress-bar-track">
              <motion.div
                className="lab-progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <div className="lab-progress-stats">
              {labState?.mode !== 'SCRIPT' && (
                <>
                  <div className="lab-stat">
                    <span className="lab-stat-label">Epoch</span>
                    <span className="lab-stat-value">{labState?.epoch || 0}/{epochs}</span>
                  </div>
                  <div className="lab-stat">
                    <span className="lab-stat-label">Loss</span>
                    <span className="lab-stat-value lab-stat-loss">{(labState?.loss || 0).toFixed(4)}</span>
                  </div>
                  <div className="lab-stat">
                    <span className="lab-stat-label">Accuracy</span>
                    <span className="lab-stat-value lab-stat-acc">{((labState?.accuracy || 0) * 100).toFixed(2)}%</span>
                  </div>
                </>
              )}
              <div className="lab-stat">
                <span className="lab-stat-label">Progress</span>
                <span className="lab-stat-value">{progress.toFixed(0)}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Workspace ─── */}
      <div className="lab-workspace">
        {/* === Code Editor === */}
        <div className="lab-editor-panel">
          <div className="lab-editor-wrap">
            {/* Gutter */}
            <div className="lab-gutter" ref={gutterRef}>
              {lineNumbers.map(num => (
                <div
                  key={num}
                  className={`lab-gutter-line ${errorLine === num ? 'lab-gutter-error' : ''}`}
                >
                  {num}
                </div>
              ))}
            </div>
            {/* Textarea */}
            <textarea
              ref={textAreaRef}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (status === 'READY' || status === 'COMPLETE') setStatus('IDLE');
              }}
              spellCheck={false}
              className="lab-textarea"
            />
          </div>
        </div>

        {/* === Right Panel === */}
        <div className="lab-sidebar">
          {/* ⚙️ Training Parameters (Adaptive) */}
          <div className="lab-panel">
            <div className="lab-panel-header flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Settings size={14} className="text-primary" />
                <span>Training Parameters</span>
              </div>
            </div>
            
            <div className="p-5 space-y-6">
              <div className={`lab-param-group transition-opacity ${neededParams.includes('epochs') ? 'opacity-100' : 'opacity-40'}`}>
                <div className="flex justify-between items-center mb-4">
                  <label className="lab-param-label">Target Epochs</label>
                  <div className="flex items-center gap-2">
                    {neededParams.includes('epochs') ? (
                      <span className="text-[7px] bg-primary/10 text-primary px-1 font-bold">LIVE_SYNC</span>
                    ) : (
                      <span className="text-[7px] bg-gray-500/10 text-gray-500 px-1 font-bold">IGNORING_UI</span>
                    )}
                    <span className="lab-param-value">{epochs}</span>
                  </div>
                </div>
                <input
                  type="range" min="1" max="50" value={epochs}
                  onChange={(e) => setEpochs(parseInt(e.target.value))}
                  className="lab-range"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`lab-param-group transition-opacity ${neededParams.includes('lr') ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="lab-param-label">Learning Rate</label>
                    {neededParams.includes('lr') && <div className="w-1 h-1 rounded-full bg-primary" />}
                  </div>
                  <input
                    type="number" step="0.0001" value={lr}
                    onChange={(e) => setLr(parseFloat(e.target.value))}
                    className="lab-input"
                  />
                </div>
                <div className={`lab-param-group transition-opacity ${neededParams.includes('batch_size') ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="lab-param-label">Batch Size</label>
                    {neededParams.includes('batch_size') && <div className="w-1 h-1 rounded-full bg-primary" />}
                  </div>
                  <select
                    value={batchSize} onChange={(e) => setBatchSize(parseInt(e.target.value))}
                    className="lab-select"
                  >
                    <option value={16}>16</option>
                    <option value={32}>32</option>
                    <option value={64}>64</option>
                    <option value={128}>128</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 🧪 Environment Monitor (Stitch System) */}
          <div className="lab-panel lab-env-panel">
            <div className="lab-panel-header flex justify-between items-center group">
              <div className="flex items-center gap-2">
                <Box size={14} className="text-primary" />
                <span>Sandbox Environment</span>
              </div>
              <button 
                onClick={fetchEnvironment} 
                title="Refresh Environment"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <RefreshCw size={10} className={isEnvLoading ? 'lab-spin' : ''} />
              </button>
            </div>
            <div className="p-4 bg-dark-grounding/20 border-t border-border/5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Sandbox Health</span>
                  <span className={`text-[11px] font-mono ${envData ? 'text-primary' : 'text-gray-500'}`}>
                    {envData ? 'INITIALIZED_STABLE' : 'NOT_INITIALIZED / PURGED'}
                  </span>
                </div>
                {envData && (
                  <button 
                    onClick={handlePurgeSandbox}
                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-[9px] font-mono uppercase transition-all"
                  >
                    Purge_Storage
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={fetchEnvironment}
                  disabled={isEnvLoading}
                  className="flex-1 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={10} className={isEnvLoading ? 'lab-spin' : ''} />
                  {isEnvLoading ? 'SCANNING...' : 'Refresh_Health'}
                </button>
              </div>
            </div>
            <div className="lab-panel-body">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-primary font-bold tracking-widest uppercase">STATUS</span>
                    <span className="text-[11px] font-mono text-white">{envData?.status || 'AWAITING_INIT...'}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] text-[#444] font-bold tracking-widest uppercase">PYTHON</span>
                    <span className="text-[11px] font-mono text-white">{envData?.python || '...'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[8px] text-[#444] font-bold tracking-widest mb-1">INSTALLED_PACKAGES</span>
                  <div className="max-h-[140px] overflow-y-auto pr-2 space-y-1">
                    {envData?.packages?.slice(0, 10).map((pkg, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-[#050505] border border-[#111]">
                        <span className="text-[10px] text-primary font-mono">{pkg.name}</span>
                        <span className="text-[10px] text-[#444] font-mono">{pkg.version}</span>
                      </div>
                    ))}
                    {(envData?.packages?.length > 10) && (
                      <div className="text-[8px] text-[#333] text-center italic py-1">
                        + {envData.packages.length - 10} MORE NODES
                      </div>
                    )}
                    {(!envData?.packages || envData.packages.length === 0) && (
                       <div className="text-[9px] text-[#333] italic py-4 text-center">INITIALIZING_VENV...</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[8px] text-[#444] font-bold tracking-widest mb-1">DETECTED_DEPENDENCIES</span>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {detectedDeps.length > 0 ? (
                      detectedDeps.map((dep, idx) => {
                        const isInstalled = envData?.packages?.some(p => p.name.toLowerCase() === dep.toLowerCase());
                        return (
                          <div 
                            key={idx} 
                            onClick={!isInstalled ? () => onExecuteCommand(`!pip install ${dep}`) : undefined}
                            className={`flex items-center gap-1.5 px-2 py-1 border text-[9px] font-mono cursor-pointer transition-all ${
                              isInstalled 
                                ? 'bg-primary/10 border-primary/20 text-primary' 
                                : 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
                            }`}
                            title={isInstalled ? 'Library Available' : 'Click to Auto-Install'}
                          >
                            <div className={`w-1 h-1 rounded-full ${isInstalled ? 'bg-primary' : 'bg-red-500 animate-pulse'}`} />
                            {dep}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-[9px] text-[#333] italic">NO_IMPORTS_DETECTED</span>
                    )}
                  </div>
                  {detectedDeps.some(dep => !envData?.packages?.some(p => p.name.toLowerCase() === dep.toLowerCase())) && (
                    <button 
                      onClick={() => {
                        const missing = detectedDeps.filter(dep => !envData?.packages?.some(p => p.name.toLowerCase() === dep.toLowerCase()));
                        onExecuteCommand(`!pip install ${missing.join(' ')}`);
                      }}
                      className="text-[8px] text-red-500 font-bold hover:underline text-left"
                    >
                      [→] INSTALL_ALL_MISSING_MODULES
                    </button>
                  )}
                </div>

                <div className="p-3 bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={10} className="text-primary" />
                    <span className="text-[9px] font-bold text-primary italic tracking-tight">VENV_IS_ACTIVE</span>
                  </div>
                  <p className="text-[9px] leading-relaxed text-[#666]">
                    Use <span className="text-primary font-bold">!pip install [package]</span> to install libraries directly into the sandbox.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Model Download Panel ─── */}
          <AnimatePresence>
            {status === 'COMPLETE' && (
              <motion.div
                className="lab-panel lab-download-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="lab-panel-header lab-panel-header-success">
                  <CheckCircle2 size={14} />
                  <span>Model Assets Ready</span>
                </div>
                <div className="lab-panel-body lab-download-body">
                  <button className="lab-download-btn" onClick={() => handleDownload('pt')}>
                    <Download size={14} />
                    <span>Download Weights (.pt)</span>
                  </button>
                  <button className="lab-download-btn" onClick={() => handleDownload('onnx')}>
                    <BarChart2 size={14} />
                    <span>Export Model (.onnx)</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Compiler Console ─── */}
          <div className="lab-panel lab-console-panel">
            <div className="lab-panel-header">
              <Terminal size={14} />
              <span>Compiler Console</span>
              <button onClick={() => setLogs([])} className="lab-clear-btn">Clear</button>
            </div>
            <div className="lab-console-body">
              {logs.map((log, i) => (
                <div key={i} className="lab-log-line">
                  <span className="lab-log-time">[{log.time}]</span>
                  <span className={`lab-log-msg ${log.type === 'error' ? 'lab-log-error' : log.type === 'success' ? 'lab-log-success' : log.type === 'warning' ? 'lab-log-warn' : ''}`}>
                    {log.msg}
                  </span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="lab-console-empty">Awaiting researcher interaction...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════
           LABORATORY SCOPED STYLES
           Uses project design tokens from :root
        ═══════════════════════════════════════════════════════════ */

        .lab-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          background: var(--bg-surface);
          font-family: var(--font-sans);
        }

        /* ─── Header ─── */
        .lab-header {
          height: 56px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-surface);
        }
        .lab-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lab-icon-box {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          background: var(--primary);
          color: #fff;
        }
        .lab-header-titles {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .lab-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-main);
        }
        .lab-subtitle {
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        .lab-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 12px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--pill-color);
          background: color-mix(in srgb, var(--pill-color) 8%, transparent);
          border: 1px solid color-mix(in srgb, var(--pill-color) 20%, transparent);
          margin-left: 12px;
        }
        .lab-spin { animation: lab-spin-anim 1s linear infinite; }
        @keyframes lab-spin-anim { to { transform: rotate(360deg); } }

        .lab-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ─── Buttons ─── */
        .lab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 36px;
          padding: 0 20px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: var(--font-sans);
        }
        .lab-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .lab-btn-outline {
          background: var(--bg-surface);
          color: var(--text-main);
          border: 1px solid var(--border);
        }
        .lab-btn-outline:hover:not(:disabled) {
          border-color: var(--primary);
          color: var(--primary);
        }
        .lab-btn-verified {
          background: #f0fdf4;
          border-color: var(--success) !important;
          color: var(--success) !important;
        }
        .lab-btn-primary {
          background: var(--primary);
          color: #fff;
        }
        .lab-btn-primary:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .lab-btn-primary:active:not(:disabled) {
          transform: scale(0.97);
        }
        .lab-btn-danger {
          background: var(--error);
          color: #fff;
        }
        .lab-btn-danger:hover:not(:disabled) {
          opacity: 0.9;
        }

        /* ─── Progress Strip ─── */
        .lab-progress-strip {
          flex-shrink: 0;
          border-bottom: 1px solid var(--border);
          background: var(--bg-main);
          padding: 10px 24px;
          display: flex;
          align-items: center;
          gap: 24px;
          overflow: hidden;
        }
        .lab-progress-bar-track {
          flex: 1;
          height: 4px;
          background: var(--border);
          overflow: hidden;
        }
        .lab-progress-bar-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.5s ease;
        }
        .lab-progress-stats {
          display: flex;
          gap: 20px;
          flex-shrink: 0;
        }
        .lab-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 60px;
        }
        .lab-stat-label {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }
        .lab-stat-value {
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-mono);
          color: var(--text-main);
        }
        .lab-stat-loss { color: var(--error); }
        .lab-stat-acc { color: var(--success); }

        /* ─── Main Workspace ─── */
        .lab-workspace {
          flex: 1;
          display: flex;
          min-height: 0;
          overflow: hidden;
        }

        /* ─── Editor Panel ─── */
        .lab-editor-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          border-right: 1px solid var(--border);
        }
        .lab-editor-wrap {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .lab-gutter {
          width: 52px;
          flex-shrink: 0;
          background: var(--bg-main);
          border-right: 1px solid var(--border);
          padding: 16px 0;
          overflow: hidden;
          user-select: none;
        }
        .lab-gutter-line {
          height: 24px;
          line-height: 24px;
          text-align: right;
          padding-right: 16px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: #c4c8cc;
        }
        .lab-gutter-error {
          color: var(--error);
          font-weight: 700;
          background: rgba(239, 68, 68, 0.06);
        }
        .lab-textarea {
          flex: 1;
          border: none;
          outline: none;
          resize: none;
          padding: 16px 20px;
          margin: 0;
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 24px;
          color: var(--text-main);
          background: var(--bg-surface);
          caret-color: var(--accent);
          tab-size: 4;
        }
        .lab-textarea::selection {
          background: color-mix(in srgb, var(--primary) 12%, transparent);
        }

        /* ─── Side Panel ─── */
        .lab-sidebar {
          width: 340px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-main);
          overflow-y: auto;
        }
        .lab-sidebar::-webkit-scrollbar { width: 4px; }
        .lab-sidebar::-webkit-scrollbar-track { background: transparent; }
        .lab-sidebar::-webkit-scrollbar-thumb { background: var(--border); }

        .lab-panel {
          border-bottom: 1px solid var(--border);
        }
        .lab-panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
          background: var(--bg-surface);
        }
        .lab-panel-header-success {
          color: var(--success);
          background: #f0fdf4;
        }
        .lab-panel-body {
          padding: 20px;
        }

        /* ─── Parameters ─── */
        .lab-param-group {
          margin-bottom: 16px;
        }
        .lab-param-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .lab-param-label {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }
        .lab-param-badge {
          font-size: 11px;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--primary);
          background: color-mix(in srgb, var(--primary) 8%, transparent);
          padding: 2px 10px;
        }
        .lab-slider {
          width: 100%;
          height: 4px;
          appearance: none;
          -webkit-appearance: none;
          background: var(--border);
          outline: none;
          cursor: pointer;
        }
        .lab-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          background: var(--primary);
          border-radius: 50%;
          cursor: pointer;
        }
        .lab-param-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .lab-select {
          width: 100%;
          height: 36px;
          padding: 0 10px;
          font-size: 12px;
          font-family: var(--font-mono);
          border: 1px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-main);
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .lab-select:focus {
          border-color: var(--primary);
        }

        .lab-env-row {
          display: flex;
          gap: 20px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }
        .lab-env-row > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lab-env-label {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }
        .lab-env-value {
          font-size: 11px;
          font-weight: 600;
          font-family: var(--font-mono);
          color: var(--text-main);
        }
        .lab-env-device {
          color: var(--success);
        }

        /* ─── Download Panel ─── */
        .lab-download-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .lab-download-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          height: 40px;
          padding: 0 16px;
          background: var(--bg-surface);
          border: 1px solid color-mix(in srgb, var(--success) 30%, transparent);
          color: #166534;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.15s;
          font-family: var(--font-sans);
        }
        .lab-download-btn:hover {
          background: #f0fdf4;
          border-color: var(--success);
          transform: translateX(2px);
        }

        /* ─── Console ─── */
        .lab-console-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 200px;
        }
        .lab-clear-btn {
          margin-left: auto;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 6px;
          transition: color 0.15s;
          font-family: var(--font-sans);
        }
        .lab-clear-btn:hover {
          color: var(--text-main);
        }
        .lab-console-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 12px 20px;
          font-family: var(--font-mono);
          font-size: 10px;
          line-height: 22px;
          background: var(--bg-surface);
        }
        .lab-console-body::-webkit-scrollbar { width: 3px; }
        .lab-console-body::-webkit-scrollbar-track { background: transparent; }
        .lab-console-body::-webkit-scrollbar-thumb { background: var(--border); }

        .lab-log-line {
          display: flex;
          gap: 10px;
          align-items: start;
        }
        .lab-log-time {
          color: #c4c8cc;
          flex-shrink: 0;
          font-size: 9px;
          padding-top: 1px;
          user-select: none;
        }
        .lab-log-msg {
          color: var(--text-main);
          opacity: 0.7;
          word-break: break-word;
        }
        .lab-log-error {
          color: var(--error);
          opacity: 1;
          font-weight: 600;
        }
        .lab-log-success {
          color: var(--success);
          opacity: 1;
          font-weight: 600;
        }
        .lab-log-warn {
          color: var(--warning);
          opacity: 1;
        }
        .lab-console-empty {
          color: #c4c8cc;
          font-style: italic;
          text-align: center;
          padding: 40px 0;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
      `}</style>
    </div>
  );
};
