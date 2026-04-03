import React, { useRef, useEffect, useState } from 'react';

export const Terminal = ({ logs, onResize, isResizing, nodeRegistry = {} }) => {
  const logsRef = useRef(null);
  const registryRef = useRef(null);
  const [registryHeight, setRegistryHeight] = useState(0);

  // Measure registry height so logs area can fill the rest
  useEffect(() => {
    if (registryRef.current) {
      setRegistryHeight(registryRef.current.offsetHeight);
    }
  });

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

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
        <div style={{ display: 'flex', height: '100%', gap: '2px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px',
            background: '#0b1120', borderTop: '2px solid #6366f1',
            color: '#e2e8f0', fontSize: '10px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'default'
          }}>
            <span style={{ opacity: 0.6 }}>$</span> Terminal
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px',
            color: '#64748b', fontSize: '10px', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            Node Registry
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px',
            color: '#64748b', fontSize: '10px', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer'
          }}>
            Output
          </div>
        </div>

        {/* Terminal Actions (Clear, Scroll, Copy) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '4px', color: '#64748b', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '4px', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
            title="Clear Terminal"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>
            <div style={{
              padding: '4px', color: '#64748b', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '4px', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
            title="Copy Logs"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
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
        </div>
      </div>

      {/* ── Node Registry (fixed height, shrinks to content) ── */}
      <div
        ref={registryRef}
        style={{
          flexShrink: 0, padding: '10px 20px',
          background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid #1e293b',
        }}
      >
        {/* Header row */}
        <div style={{
          display: 'flex', gap: 24, marginBottom: 6, paddingBottom: 6,
          borderBottom: '1px solid rgba(30,41,59,0.5)',
          fontFamily: 'monospace', fontSize: 9, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569',
        }}>
          <span style={{ width: 200, flexShrink: 0 }}>Node_ID (Endpoint)</span>
          <span style={{ width: 100, flexShrink: 0 }}>Status</span>
          <span style={{ flex: 1 }}>Last_Model_Hash</span>
          <span style={{ width: 40, textAlign: 'right', flexShrink: 0 }}>Rep</span>
        </div>
        {/* Data rows with better standard formatting */}
        {Object.entries(nodeRegistry).length === 0 ? (
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#334155', fontStyle: 'italic', paddingTop: 6, textAlign: 'center' }}>
            [SYSTEM] No active nodes connected. Awaiting secure handshake...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Object.entries(nodeRegistry).map(([id, info]) => (
              <div key={id} style={{
                display: 'flex', alignItems: 'center', gap: 24, fontFamily: 'monospace',
                fontSize: '10px', color: '#cbd5e1', padding: '4px 8px', borderRadius: '4px',
                background: 'rgba(30,41,59,0.2)', transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30,41,59,0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30,41,59,0.2)'}
              >
                <span style={{
                  width: 200, flexShrink: 0, color: '#818cf8', fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }} title={id}>{id}</span>
                <span style={{ width: 100, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '2px', flexShrink: 0,
                    background: info.status === 'TRAINING' ? '#fbbf24' : info.status === 'COMPLETED' ? '#10b981' : '#475569',
                    boxShadow: info.status === 'TRAINING' ? '0 0 10px rgba(251,191,36,0.2)' : '',
                    animation: info.status === 'TRAINING' ? 'pulse 2s infinite' : '',
                  }} />
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: info.status === 'TRAINING' ? '#fbbf24' : info.status === 'COMPLETED' ? '#34d399' : '#64748b' }}>
                    {info.status}
                  </span>
                </span>
                <span style={{ flex: 1, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '9px' }}>
                  {info.hash || '----------------'}
                </span>
                <span style={{ width: 40, textAlign: 'right', flexShrink: 0, color: '#10b981', opacity: 0.6, fontSize: '9px' }}>1.0 REP</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Logs (fills remaining height, scrollable like a real terminal) ── */}
      <div
        ref={logsRef}
        style={{
          flex: '1 1 0',       // grows to fill remaining space
          minHeight: 0,         // CRITICAL: allows flex child to shrink below content height
          overflowY: 'auto',    // scroll only this zone
          overflowX: 'hidden',
          padding: '12px 20px',
          fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, monospace',
          fontSize: 11,
          lineHeight: 1.7,
          color: '#cbd5e1',
          background: '#0b1120',
        }}
      >
        {logs.map((log, i) => {
          const color = log.color === '#13ec49' ? '#34d399'
            : log.color === '#ef4444' ? '#f87171'
            : log.color === '#facc15' ? '#fbbf24'
            : '#94a3b8';
          return (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 2 }}>
              <span style={{ fontSize: 9, color: '#1e3a5f', flexShrink: 0, userSelect: 'none', marginTop: 2 }}>
                {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span style={{ color: '#4f46e5', fontWeight: 700, flexShrink: 0, fontSize: 11 }}>$</span>
              <span style={{ color, wordBreak: 'break-all' }}>{log.msg}</span>
            </div>
          );
        })}
        {/* Blinking cursor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 9, color: '#1e3a5f', userSelect: 'none' }}>
            {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span style={{ color: '#6366f1', fontWeight: 700 }}>{'>'}</span>
          <span style={{
            display: 'inline-block', width: 8, height: 14,
            background: '#6366f1', opacity: 0.8,
            animation: 'blink 1s step-end infinite',
          }} />
        </div>
      </div>

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
