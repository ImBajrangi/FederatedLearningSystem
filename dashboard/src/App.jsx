import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ArchitectureBuilder } from './components/ArchitectureBuilder';
import { MetricsChart } from './components/MetricsChart';
import { Terminal } from './components/Terminal';
import { BlockchainRibbon } from './components/BlockchainExplorer';
import { TrainingWorkspace } from './components/TrainingWorkspace';
import { DatasetExplorer } from './components/DatasetExplorer';
import { useSecureFederated } from './hooks/useSecureFederated';
import { Play, RotateCcw, ShieldCheck, Info, X, Zap, Activity, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const {
    round,
    isActive,
    blockchain,
    clients,
    accuracyHistory,
    rejectedCount,
    logs,
    runRound,
    setIsActive,
    clearSimulation,
    isConnected,
    status
  } = useSecureFederated();

  const [currentView, setCurrentView] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [footerHeight, setFooterHeight] = useState(180);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 64 && newHeight <= window.innerHeight * 0.7) {
        setFooterHeight(newHeight);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const addToast = (msg, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const startSimulation = async () => {
    if (!isConnected) {
      addToast('Backend connection offline.', 'error');
      return;
    }
    
    addToast(status === 'IDLE' ? 'Initiating FL connection.' : 'Starting aggregation cycle.', 'info');
    const success = await runRound();
    
    if (success) {
      addToast('Federated command acknowledged.', 'success');
    } else {
      addToast('Command failed. Check backend logs.', 'error');
    }
  };

  const initSidebarResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = sidebarWidth;

    const onMouseMove = (moveEvent) => {
      const newW = Math.min(Math.max(200, startW + (moveEvent.clientX - startX)), 480);
      setSidebarWidth(newW);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="flex-1 p-10 space-y-12 section-fade bg-white">
            <div className="flex items-center justify-between pb-8 border-b border-border">
              <div className="space-y-2">
                <h2 className="type-l2 serif text-text-main pr-10 font-medium tracking-tight">Global Orchestrator</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-medium text-text-muted/40 uppercase tracking-[0.2em]">NODE_ID:</span>
                    <span className="text-[9px] font-bold text-text-main/80 uppercase tracking-widest">0x88F2_SECURE</span>
                  </div>
                  <div className="w-[1px] h-2 bg-border/60" />
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-medium text-text-muted/40 uppercase tracking-[0.2em]">MODE:</span>
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Institutional Production</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right pr-8 border-r border-border">
                  <div className="text-[9px] font-light text-text-muted mb-2 uppercase tracking-[0.3em]">Global Accuracy</div>
                  <div className="flex items-center justify-end gap-3">
                    <span className="type-l2 serif text-text-main font-medium">
                      {accuracyHistory.length > 0 
                        ? (accuracyHistory[accuracyHistory.length - 1] * 100).toFixed(2) 
                        : "0.00"}%
                    </span>
                    <div className="p-1 px-1.5 bg-emerald-50 border border-emerald-100 rounded-sm">
                      <Activity size={10} className="text-emerald-600" />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={startSimulation}
                    disabled={isActive || !isConnected}
                    className={`institutional-btn-primary flex items-center gap-4 shadow-lg active:scale-95 transition-all px-8 ${(!isConnected || isActive) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                  >
                    <Play size={14} className={isActive ? 'animate-pulse' : ''} />
                    <span className="tracking-[0.25em]">
                      {status === 'IDLE' ? 'Initiate Orchestration' : status === 'WAITING' ? 'Synchronize Weights' : 'Processing...'}
                    </span>
                  </button>
                  <button 
                    onClick={clearSimulation}
                    className="p-3 border border-border text-text-muted hover:bg-slate-50 transition-all hover:text-text-main"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 space-y-10">
                <div className="institutional-card">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-bg-surface/50">
                    <div className="flex items-center gap-4">
                      <Activity size={14} className="text-primary opacity-60" />
                      <span className="text-[10px] font-bold text-text-main uppercase tracking-[0.2em] pr-10">Real-Time Model Convergence</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-text-muted/60 font-sans">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-1 bg-primary" /> Converged Accuracy
                      </div>
                    </div>
                  </div>
                  <div className="p-8 h-[340px]">
                    <MetricsChart data={accuracyHistory} isActive={isActive} />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="type-l2 serif text-text-main whitespace-nowrap">Immutable Node Journal</h3>
                    <div className="h-[1px] flex-1 bg-border/60" />
                  </div>
                  <BlockchainRibbon blockchain={blockchain} />
                </div>
              </div>

              <div className="space-y-10">
                 <div className="institutional-card bg-primary text-white border-none overflow-hidden group">
                    <div className="p-8 relative z-10">
                       <ShieldCheck className="mb-6 opacity-40 group-hover:scale-110 transition-transform" size={24} />
                       <h3 className="type-l2 serif mb-4">Security Policy Active</h3>
                       <p className="text-[11px] leading-relaxed opacity-80 uppercase tracking-tight font-sans">
                         Differential Privacy calibration enabled (ε=0.8). Homomorphic encryption layers initialized for node-to-node synchronization.
                       </p>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <Zap size={80} />
                    </div>
                 </div>
                 
                 <div className="institutional-card">
                    <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-bg-surface/50">
                       <Activity size={14} className="text-primary" />
                       <span className="type-label text-text-main font-bold">Network Resilience</span>
                    </div>
                    <div className="p-8 space-y-6">
                       <div className="flex justify-between items-center pb-6 border-b border-border/50">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Shards</span>
                          <span className="type-label text-primary font-bold">{clients.filter(c => c.status === 'ACTIVE').length} / 8</span>
                       </div>
                       <div className="flex justify-between items-center pb-6 border-b border-border/50">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Rounds Synced</span>
                          <span className="type-label text-primary font-bold">{round}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Integrity Alerts</span>
                          <span className={`type-label font-bold ${rejectedCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{rejectedCount}</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        );
      case 'architecture':
        return <ArchitectureBuilder onAction={addToast} />;
      case 'training':
        return <TrainingWorkspace clients={clients} isLive={isActive} round={round} />;
      case 'datasets':
        return <DatasetExplorer />;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="shell-container selection:bg-primary/10 bg-white">
      <Header status={isConnected ? (isActive ? 'SYSTEM_RUNNING' : status || 'CONNECTED') : 'OFFLINE'} />
      
      <div className="flex flex-1 bg-white">
        <Sidebar 
          currentView={currentView} 
          setView={setCurrentView} 
          clients={clients}
          width={sidebarWidth} 
          onResize={initSidebarResize}
        />
        
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="flex-1 flex flex-col bg-white">
            {renderView()}
          </div>
          
          <div style={{ height: footerHeight }}>
            <Terminal 
              logs={logs} 
              onResize={startResizing} 
              isResizing={isResizing}
              onAction={(cmd) => addToast(`Terminal command executed: ${cmd}`, 'info')}
            />
          </div>
        </main>
      </div>

      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`institutional-toast-enterprise fixed right-8 bottom-8 z-[200] ${toast.type === 'error' ? 'border-red-500 bg-red-50 text-red-700' : ''}`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'error' ? <X size={14} /> : <ShieldCheck size={14} />}
              <span className="type-label font-bold uppercase tracking-widest">{toast.msg}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default App;
