import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ArchitectureBuilder } from './components/ArchitectureBuilder';
import { MetricsChart } from './components/MetricsChart';
import { Terminal } from './components/Terminal';
import { BlockchainRibbon } from './components/BlockchainExplorer';
import { TrainingWorkspace } from './components/TrainingWorkspace';
import { DatasetExplorer } from './components/DatasetExplorer';
import { useSimulation } from './hooks/useSimulation';
import { Play, RotateCcw, ShieldCheck, Info, X, Zap, ChevronRight } from 'lucide-react';
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
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            className="flex-1 h-full overflow-y-auto p-10 flex flex-col gap-10 custom-scrollbar"
          >
            {/* 1. Statistics Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="flex flex-col gap-10">
                <div className="card p-10 bg-white shadow-xl shadow-slate-200/50">
                  <MetricsChart data={accuracyHistory} />
                </div>
                
                <div className="card p-10 border-l-4 border-indigo-500 bg-indigo-50/40">
                  <div className="flex items-center gap-4 mb-4 text-indigo-600">
                    <ShieldCheck size={24} />
                    <h4 className="text-sm font-bold uppercase tracking-widest">Enterprise security audit</h4>
                  </div>
                  <p className="text-base text-slate-600 leading-relaxed font-medium">
                    Adaptive security thresholds are active. Current anomaly detection sensitivity for model update verification is calibrated at <span className="font-mono font-bold text-indigo-700 bg-indigo-100/50 px-2 py-0.5 rounded">1.96σ</span>. Any deviation beyond this enterprise baseline will trigger automatic node isolation and institutional alert.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-10">
                <div className="card flex-1 min-h-[440px] shadow-xl shadow-slate-200/50 overflow-hidden">
                   <Terminal logs={logs} />
                </div>
                
                <div className="card p-10 flex flex-col items-center justify-center text-center gap-6 border-dashed bg-slate-50/50 border-slate-300">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner ${isActive ? 'bg-indigo-100 shadow-indigo-200/50' : 'bg-slate-100'}`}>
                    {isActive ? (
                      <Zap size={32} className="text-indigo-600 animate-pulse" />
                    ) : (
                      <RotateCcw size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-base font-bold text-slate-700 uppercase tracking-widest">
                      {isActive ? 'Processing cycles...' : 'System stand-by'}
                    </h5>
                    <p className="text-sm text-slate-400 mt-2 font-medium">
                      {isActive ? 'Global parameter merging in progress' : 'Awaiting institutional broadcast signal'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="app-shell selection:bg-indigo-100 selection:text-indigo-900">
      <Header status={isActive ? 'Live' : round >= 6 ? 'Standby' : 'Ready'} />

      <div className="shell-body">
        <Sidebar
          clients={clients}
          rejectedCount={rejectedCount}
          chainHeight={blockchain.length}
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        <main className="shell-main">
          {/* Institutional Top Bar: Actions */}
          {['dashboard', 'library'].includes(currentView) && (
            <div className="h-16 shrink-0 flex items-center justify-between border-b px-10 bg-white/80 backdrop-blur-md z-30 sticky top-0 shadow-sm">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="p-1.5 bg-slate-100 rounded text-slate-500">
                   <ChevronRight size={14} />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                   Institutional Node: v7.2.0.STABLE
                </span>
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={() => {
                    clearSimulation();
                    addToast('System state reset.', 'info');
                  }}
                  className="btn btn-outline h-10 px-6 group"
                >
                  <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span>Clear Ledger</span>
                </button>
                <button
                  onClick={startSimulation}
                  disabled={isActive || round >= 6}
                  className={`btn btn-primary h-10 px-10 shadow-lg ${isActive || round >= 6 ? 'opacity-50 grayscale' : ''}`}
                >
                  <Play size={16} fill="currentColor" />
                  <span>
                    {isActive ? 'Executing cycle...' : round >= 6 ? 'Process Finalized' : 'Initiate Broadcast'}
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="content-viewport custom-scrollbar px-10 py-8">
            <div className="max-w-[1600px] mx-auto w-full">
              <AnimatePresence mode="wait">
                {renderView()}
              </AnimatePresence>
            </div>
          </div>

          <footer className="shell-footer">
            <BlockchainRibbon blockchain={blockchain} />
          </footer>

          {/* Toast Notification System */}
          <div className="absolute right-8 top-20 z-[100] flex flex-col gap-3">
            <AnimatePresence>
              {toasts.map(toast => (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
                  className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl border-l-4 min-w-[320px] bg-white ${
                    toast.type === 'success' ? 'border-emerald-500' : 'border-indigo-500'
                  }`}
                >
                  <div className={`p-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {toast.type === 'success' ? <ShieldCheck size={18} /> : <Info size={18} />}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{toast.msg}</span>
                  <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-auto text-slate-300 hover:text-slate-500">
                    <X size={16} />
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
