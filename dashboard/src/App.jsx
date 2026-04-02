import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ArchitectureBuilder } from './components/ArchitectureBuilder';
import { MetricsChart } from './components/MetricsChart';
import { Terminal } from './components/Terminal';
import { BlockchainRibbon } from './components/BlockchainExplorer';
import { TrainingWorkspace } from './components/TrainingWorkspace';
import { DatasetExplorer } from './components/DatasetExplorer';
import { useSimulation } from './hooks/useSimulation';
import { Play, RotateCcw, ShieldCheck, Info, X, Zap, ChevronRight, Activity, BookOpen, Clock } from 'lucide-react';
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
    clearSimulation
  } = useSimulation();

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
    if (isActive) return;
    setIsActive(true);
    addToast('Global synchronization initiated.', 'info');

    for (let r = round; r < 6; r++) {
      await runRound();
      await new Promise(res => setTimeout(res, 1500));
    }
    setIsActive(false);
    addToast('Federated cycle complete. Weights aggregated.', 'success');
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
    document.body.style.cursor = 'ew-resize';
  };

  const renderView = () => {
    switch (currentView) {
      case 'training':
        return <TrainingWorkspace clients={clients} />;
      case 'dataset':
        return <DatasetExplorer />;
      case 'library':
        return <ArchitectureBuilder onAction={(msg) => addToast(msg, 'success')} />;
      default:
        return (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-16"
          >
            {/* Academic Progress Header */}
            <div className="space-y-12">
               <div>
                  <h2 className="text-4xl font-bold tracking-tight text-text-main serif mb-4">Academic Progress</h2>
                  <p className="text-sm text-text-muted font-medium">
                    Welcome back to your research node. Resume your training environments and historical ledger analysis below.
                  </p>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-bold text-text-main uppercase tracking-widest">Overall Research Completion</span>
                     <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{(round / 6 * 100).toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar-minimal">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(round / 6 * 100)}%` }}
                        className="progress-bar-fill"
                     />
                  </div>
               </div>
            </div>

            {/* Experiment Grid */}
            <div className="space-y-10">
               <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-lg font-bold text-text-main serif">Recent Experiments</h3>
                  <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View All Logs →</button>
               </div>
               
               <div className="grid grid-cols-3 gap-8">
                   <div className="academic-card !p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-6">
                         <span className="text-[10px] font-bold text-primary uppercase tracking-widest">CNN - CIFAR10</span>
                         <Activity size={12} className="text-primary/30" />
                      </div>
                      <div className="space-y-1.5">
                         <div className="text-[11px] font-bold text-text-muted uppercase tracking-tighter">Final Loss: <span className="text-text-main tabular-nums">0.041</span></div>
                         <div className="text-[10px] font-medium text-text-muted/60 uppercase tracking-tighter">Last Run: Oct 24, 14:30</div>
                      </div>
                   </div>
                                    <div className="academic-card !p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-6">
                         <span className="text-[10px] font-bold text-primary uppercase tracking-widest">ResNet50 Fine-tune</span>
                         <Activity size={12} className="text-primary/30" />
                      </div>
                      <div className="space-y-1.5">
                         <div className="text-[11px] font-bold text-text-muted uppercase tracking-tighter">Final Loss: <span className="text-text-main tabular-nums">0.128</span></div>
                         <div className="text-[10px] font-medium text-text-muted/60 uppercase tracking-tighter">Last Run: Oct 22, 09:15</div>
                      </div>
                   </div>

                   <div className="academic-card !p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-6">
                         <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Linear Reg Baseline</span>
                         <Activity size={12} className="text-primary/30" />
                      </div>
                      <div className="space-y-1.5">
                         <div className="text-[11px] font-bold text-text-muted uppercase tracking-tighter">Final Loss: <span className="text-text-main tabular-nums">1.402</span></div>
                         <div className="text-[10px] font-medium text-text-muted/60 uppercase tracking-tighter">Last Run: Oct 18, 16:45</div>
                      </div>
                   </div>
               </div>
            </div>

            {/* Next Chapter Promo */}
            <div className="academic-card border-l-4 border-l-primary !p-12 mt-4">
                <div className="flex items-start justify-between">
                   <div className="space-y-4">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Next Task</span>
                      <h4 className="text-2xl font-bold text-text-main serif">Federated Weight Aggregation</h4>
                      <p className="text-sm text-text-muted leading-relaxed max-w-xl">
                        Explore how institutional local weights are synchronized via the consensus ledger while maintaining Differential Privacy (DP) guarantees.
                      </p>
                      <button 
                        onClick={() => setCurrentView('training')}
                        className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2 group mt-4"
                      >
                         Continue Training <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                   <BookOpen size={48} className="text-primary/10" />
                </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="app-shell selection:bg-primary/10 selection:text-primary">
      <Header status={isActive ? 'Live' : round >= 6 ? 'Standby' : 'Ready'} />

      <div className="shell-body">
        <div style={{ width: `${sidebarWidth}px` }} className="shrink-0 flex flex-col relative overflow-hidden">
          <Sidebar
            clients={clients}
            rejectedCount={rejectedCount}
            chainHeight={blockchain.length}
            currentView={currentView}
            setView={setCurrentView}
          />
        </div>

        <div className="resize-handle-h" onMouseDown={initSidebarResize} />

        <main className="shell-main">
          {/* Institutional Top Bar: Actions */}
          {['dashboard', 'library'].includes(currentView) && (
            <div className="h-16 shrink-0 flex items-center justify-between border-b border-border px-10 bg-white z-30">
              <div className="flex items-center gap-4 text-text-muted">
                <Clock size={14} className="text-primary/40" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em]">
                   v7.2.0.STABLE • RESEARCH ENV
                </span>
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={() => {
                    clearSimulation();
                    addToast('Research state cleared.', 'info');
                  }}
                  className="btn btn-outline h-10 px-6 group border-border hover:border-text-muted text-text-muted"
                >
                  <RotateCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span className="uppercase tracking-widest text-[9px] font-bold">Clear Ledger</span>
                </button>
                <button
                  onClick={startSimulation}
                  disabled={isActive || round >= 6}
                  className={`btn btn-primary h-10 px-8 ${isActive || round >= 6 ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                >
                  <Play size={12} fill="currentColor" />
                  <span className="uppercase tracking-widest text-[9px] font-bold">
                    {isActive ? 'Simulating...' : round >= 6 ? 'Halted' : 'Initiate Training'}
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="content-viewport custom-scrollbar">
            <AnimatePresence mode="wait">
              {renderView()}
            </AnimatePresence>
          </div>

          <footer 
            className="shell-footer" 
            style={{ height: `${footerHeight}px` }}
          >
            <div className="resize-handle-v" onMouseDown={startResizing} />
            <BlockchainRibbon blockchain={blockchain} />
          </footer>

          {/* Toast Notification System (Academic Styling) */}
          <div className="absolute right-12 top-24 z-[100] flex flex-col gap-4">
            <AnimatePresence>
              {toasts.map(toast => (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                  className="bg-white p-6 rounded-sm border border-border border-l-4 border-l-primary shadow-2xl flex items-center gap-6 min-w-[360px]"
                >
                  <div className={`p-2 rounded-full ${toast.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-400'}`}>
                    {toast.type === 'success' ? <ShieldCheck size={18} /> : <Info size={18} />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{toast.type} notification</span>
                    <span className="text-xs font-bold text-text-main serif italic">{toast.msg}</span>
                  </div>
                  <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-auto text-text-muted hover:text-text-main transition-colors">
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
