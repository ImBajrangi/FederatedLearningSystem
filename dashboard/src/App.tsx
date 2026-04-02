import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ArchitectureBuilder } from './components/ArchitectureBuilder';
import { MetricsChart } from './components/MetricsChart';
import { Terminal } from './components/Terminal';
import { BlockchainRibbon } from './components/BlockchainExplorer';
import { useSimulation } from './hooks/useSimulation';
import { Play, RotateCcw, ShieldCheck } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'analytics' | 'architecture'>('analytics');

  const startSimulation = async () => {
    if (isActive) return;
    setIsActive(true);

    // Simulate rounds
    for (let r = round; r < 6; r++) {
      await runRound();
      await new Promise(res => setTimeout(res, 1500));
    }
    setIsActive(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-academic-text font-body">
      <Header status={isActive ? 'Live' : round >= 6 ? 'Standby' : 'Ready'} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          clients={clients}
          rejectedCount={rejectedCount}
          chainHeight={blockchain.length}
        />

        <main
          className="flex-1 flex flex-col relative overflow-hidden"
          style={{ backgroundColor: 'var(--terminal-bg)', transform: 'translate3d(0,0,0)', willChange: 'transform' }}
        >
          {/* Main Top Area: Tabs and Actions */}
          <div
            className="flex items-center justify-between border-b z-20 sticky top-0 px-6 py-3"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', transform: 'translateZ(0)' }}
          >
            <div
              className="flex rounded-sm border"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <button
                onClick={() => setActiveTab('analytics')}
                className="px-4 py-1.5 uppercase font-mono font-bold tracking-widest rounded-sm transition-all"
                style={{
                  fontSize: '10px',
                  border: 'none',
                  backgroundColor: activeTab === 'analytics' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'analytics' ? 'black' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Training Analytics
              </button>
              <button
                onClick={() => setActiveTab('architecture')}
                className="px-4 py-1.5 uppercase font-mono font-bold tracking-widest rounded-sm transition-all"
                style={{
                  fontSize: '10px',
                  border: 'none',
                  backgroundColor: activeTab === 'architecture' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'architecture' ? 'black' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Layer Inspector
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={clearSimulation}
                className="btn-secondary flex items-center gap-2 px-3 py-2 rounded-sm"
              >
                <RotateCcw size={14} />
                <span className="uppercase font-mono font-bold tracking-widest" style={{ fontSize: '10px' }}>Reset Cache</span>
              </button>
              <button
                onClick={startSimulation}
                disabled={isActive || round >= 6}
                className={`btn-primary flex items-center gap-2 px-6 py-2 rounded-sm uppercase font-mono font-bold tracking-widest transition-all ${isActive || round >= 6 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                style={{
                  fontSize: '10px',
                  boxShadow: isActive || round >= 6 ? 'none' : '0 0 16px rgba(19, 236, 73, 0.25)'
                }}
              >
                {isActive ? 'Executing...' : round >= 6 ? 'Session Complete' : 'Initialize Environment'}
                <Play size={14} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden" style={{ transform: 'translateZ(0)' }}>
            <div className="flex-1 relative overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {activeTab === 'analytics' ? (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <MetricsChart data={accuracyHistory} />
                        <div className="glass-card rounded-sm" style={{ padding: '24px' }}>
                          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--primary)', marginBottom: '16px' }}>
                            <ShieldCheck size={16} />
                            <h4 className="font-mono font-bold uppercase tracking-widest" style={{ fontSize: '10px' }}>Security Audit Context</h4>
                          </div>
                          <p className="text-sm text-muted" style={{ lineHeight: '1.6' }}>
                            Adaptive thresholding active for Secure Aggregation. Current Z-Score sensitivity for model update verification is set to <span style={{ color: 'white' }} className="font-mono">1.96σ</span>. Any updates exceeding this bound will be marked as anomalies in the next consensus block.
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <Terminal logs={logs} />
                        <div
                          className="flex-1 glass rounded-sm flex flex-col items-center justify-center transition-opacity"
                          style={{
                            padding: '24px',
                            borderStyle: 'dashed',
                            borderColor: 'rgba(19, 236, 73, 0.2)',
                            opacity: 0.6
                          }}
                        >
                          <div
                            className="rounded-full flex items-center justify-center"
                            style={{
                              width: '48px',
                              height: '48px',
                              backgroundColor: 'rgba(19, 236, 73, 0.1)',
                              marginBottom: '16px'
                            }}
                          >
                            <div
                              className="animate-spin rounded-full"
                              style={{ width: '24px', height: '24px', border: '2px solid var(--primary)', borderTopColor: 'transparent' }}
                            />
                          </div>
                          <span className="font-mono font-bold text-muted uppercase tracking-widest" style={{ fontSize: '10px' }}>
                            {isActive ? 'Compiling Local Updates...' : 'Waiting for Peer Broadcast'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="architecture"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex-1 relative h-full"
                  >
                    <ArchitectureBuilder />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <BlockchainRibbon blockchain={blockchain} />
        </main>
      </div>
    </div>
  );
}

export default App;
