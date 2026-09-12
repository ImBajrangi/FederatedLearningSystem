import React, { useRef, useEffect, useState } from 'react';

export const Terminal = ({ logs, onResize, isResizing, nodeRegistry = {}, roundHistory = [], onClear, onAction, isMinimized, onToggleMinimize, onExecuteCommand }) => {
  const logsRef = useRef(null);
  const inputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('logs');
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleCopy = () => {
    const text = logs.map(l => `[${new Date().toLocaleTimeString()}] $ ${l.msg}`).join('\n');
    navigator.clipboard.writeText(text);
    if (onAction) onAction('LOGS_COPIED');
  };

  // Auto-scroll to bottom on new logs

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const command = inputValue.trim();
      if (command) {
        onExecuteCommand(command);
        setHistory(prev => [command, ...prev].slice(0, 50));
        setInputValue('');
        setHistoryIndex(-1);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInputValue(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputValue(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };

  const focusInput = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div
      className={`flex flex-col h-full ${isResizing ? 'select-none' : ''}`}
      style={{ background: '#0b1120', borderTop: '1px solid #1e293b', position: 'relative' }}
    >
      {/* ── Resize Handle ── */}
      <div
        onMouseDown={onResize}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 6,
          cursor: 'ns-resize', zIndex: 50,
        }}
        onMouseEnter={(e) => { e.currentTarget.firstChild.style.background = 'rgba(99,102,241,0.5)'; }}
        onMouseLeave={(e) => { if (!isResizing) e.currentTarget.firstChild.style.background = 'transparent'; }}
      >
        <div style={{
          width: '100%', height: 2,
          background: isResizing ? '#6366f1' : 'transparent',
          transition: 'background 0.15s',
        }} />
      </div>

      {/* ── Web Terminal Optimized Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px', background: '#111827', height: '36px',
        borderBottom: '1px solid #1f2937', flexShrink: 0,
      }}>
        {/* Tabs for Terminal / Nodes / Output */}
        <div style={{ display: 'flex', height: '100%', gap: '4px', alignItems: 'flex-end', marginLeft: '8px' }}>
          <div
            onClick={() => setActiveTab('logs')}
            style={{
              padding: '0 16px', height: '28px', display: 'flex', alignItems: 'center', gap: '8px',
              background: activeTab === 'logs' ? '#0b1120' : 'transparent',
              borderRadius: '4px 4px 0 0',
              borderBottom: activeTab === 'logs' ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === 'logs' ? '#e2e8f0' : '#64748b',
              fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
              transition: 'all 0.2s', borderTop: 'none'
            }}
          >
            <span style={{ opacity: 0.4 }}>$</span> Terminal
          </div>
          <div
            onClick={() => setActiveTab('registry')}
            style={{
              padding: '0 16px', height: '28px', display: 'flex', alignItems: 'center', gap: '8px',
              background: activeTab === 'registry' ? '#0b1120' : 'transparent',
              borderRadius: '4px 4px 0 0',
              borderBottom: activeTab === 'registry' ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === 'registry' ? '#e2e8f0' : '#64748b',
              fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
              transition: 'all 0.2s', borderTop: 'none'
            }}
          >
            Node Registry
          </div>
          <div
            onClick={() => setActiveTab('output')}
            style={{
              padding: '0 16px', height: '28px', display: 'flex', alignItems: 'center', gap: '8px',
              background: activeTab === 'output' ? '#0b1120' : 'transparent',
              borderRadius: '4px 4px 0 0',
              borderBottom: activeTab === 'output' ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === 'output' ? '#e2e8f0' : '#64748b',
              fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
              transition: 'all 0.2s', borderTop: 'none'
            }}
          >
            Output
          </div>
        </div>

        {/* Terminal Actions (Clear, Scroll, Copy) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingRight: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              onClick={onClear}
              style={{
                padding: '6px', color: '#64748b', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '4px', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
              title="Clear Terminal"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
            </div>
            <div
              onClick={handleCopy}
              style={{
                padding: '4px', color: '#64748b', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '4px', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
              title="Copy Logs"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </div>
          </div>
          <div style={{
            padding: '3px 8px', background: '#0f172a', border: '1px solid #1e293b',
            borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '9px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase'
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            node-bridge:7880
          </div>
          <button
            onClick={onToggleMinimize}
            style={{
              background: '#1e293b', border: '1px solid #334155', color: '#94a3b8',
              width: '24px', height: '24px', borderRadius: '4px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={isMinimized ? "Maximize Terminal" : "Minimize Terminal"}
          >
            {isMinimized ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Tab Content ── */}
      {!isMinimized && (
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
            <div
              ref={logsRef}
              style={{
                flex: 1, overflowY: 'auto', padding: '12px 20px',
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 11, lineHeight: 1.7, color: '#cbd5e1',
              }}
            >
              {logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 2 }}>
                  <span style={{ fontSize: 9, color: '#334155', flexShrink: 0 }}>{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  <span style={{ color: '#6366f1', fontWeight: 700 }}>$</span>
                  <span style={{ color: log.color === '#ef4444' ? '#f87171' : '#ffffff' }}>{log.msg}</span>
                </div>
              ))}
              
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, cursor: 'text' }}
                onClick={focusInput}
              >
                <span style={{ color: '#6366f1', fontWeight: 700 }}>{'>'}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  spellCheck="false"
                  autoComplete="off"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#00ff41',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                    caretColor: '#6366f1',
                    fontWeight: 500
                  }}
                  placeholder="[ROOT@CYBRONITES]#_"
                />
              </div>
            </div>
          )}

          {/* REGISTRY TAB */}
          {activeTab === 'registry' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              <div style={{
                background: '#070c18',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
                      <th style={{ width: '220px', padding: '10px 16px', fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>NODE_ID</th>
                      <th style={{ width: '150px', padding: '10px 16px', fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>IP_ADDRESS</th>
                      <th style={{ width: '120px', padding: '10px 16px', fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>STATUS</th>
                      <th style={{ width: '130px', padding: '10px 16px', fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>REPUTATION</th>
                      <th style={{ padding: '10px 16px', fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>SECURITY_HASH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(nodeRegistry || {}).length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>
                          No edge nodes currently connected. Connect devices via <code>python join.py</code>
                        </td>
                      </tr>
                    ) : (
                      Object.entries(nodeRegistry).map(([id, info]) => {
                        const shortId = id.length > 18 ? `${id.substring(0, 10)}...${id.substring(id.length - 6)}` : id;
                        const statusColor = info.status === 'REJECTED' ? '#ef4444' : info.status === 'BUSY' ? '#fbbf24' : '#10b981';
                        const statusBg = info.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.12)' : info.status === 'BUSY' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(16, 185, 129, 0.12)';
                        const statusBorder = info.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.3)' : info.status === 'BUSY' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(16, 185, 129, 0.3)';

                        return (
                          <tr key={id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                            {/* Node ID */}
                            <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', flexShrink: 0 }} />
                                <span
                                  title={id}
                                  style={{
                                    fontFamily: '"JetBrains Mono", monospace',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#a5b4fc',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '190px',
                                    display: 'inline-block',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {shortId}
                                </span>
                              </div>
                            </td>

                            {/* IP Address */}
                            <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                              <span style={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: '11px',
                                color: '#38bdf8',
                                background: 'rgba(56, 189, 248, 0.08)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                display: 'inline-block'
                              }}>
                                {info.ip || '127.0.0.1'}
                              </span>
                            </td>

                            {/* Status */}
                            <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                              <span style={{
                                fontSize: '9px',
                                fontWeight: 800,
                                color: statusColor,
                                background: statusBg,
                                border: `1px solid ${statusBorder}`,
                                padding: '3px 8px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                display: 'inline-block'
                              }}>
                                {info.status || 'VALID'}
                              </span>
                            </td>

                            {/* Reputation */}
                            <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                              <span style={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#10b981'
                              }}>
                                {info.reputation !== undefined ? Number(info.reputation).toFixed(2) : '150.00'} REP
                              </span>
                            </td>

                            {/* Security Hash */}
                            <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                              <span
                                title={info.hash || info.code_hash || 'Verified on Chain'}
                                style={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontSize: '11px',
                                  color: '#94a3b8',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: 'block'
                                }}
                              >
                                {info.hash || (info.code_hash ? `0x-${info.code_hash.substring(0, 12)}...` : '0x-631843415143...')}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OUTPUT TAB */}
          {activeTab === 'output' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '4px', padding: '20px', marginBottom: 20 }}>
                <h4 style={{ color: '#e2e8f0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Session Performance Summary</h4>
                {roundHistory.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {roundHistory.map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#0b1120', borderRadius: '4px' }}>
                        <span style={{ fontSize: 10, color: '#64748b' }}>Round {r.round}</span>
                        <span style={{ fontSize: 10, color: '#10b981', fontWeight: 700 }}>Accuracy: {(r.acc * 100).toFixed(2)}%</span>
                        <span style={{ fontSize: 10, color: '#f87171' }}>Loss: {r.loss.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#475569', fontSize: 10, fontStyle: 'italic' }}>No completed rounds recorded in ledger. Start simulation to index metrics.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 0.8; } 50% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        /* Thin scrollbar like real terminals */
        div[data-terminal-logs]::-webkit-scrollbar,
        div.terminal-logs::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar { width: 5px; height: 5px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }
        div::-webkit-scrollbar-thumb:hover { background: #2d4f7c; }
      `}</style>
    </div>
  );
};
