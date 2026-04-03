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

      {/* ── Title Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 16px', background: '#0f172a',
        borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <span style={{
          fontFamily: 'monospace', fontSize: 10, color: '#64748b',
          textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
        }}>
          System Output Console
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
          Live Bridge
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
        {/* Data rows */}
        {Object.entries(nodeRegistry).length === 0 ? (
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#334155', fontStyle: 'italic', paddingTop: 4 }}>
            Awaiting secure node handshake...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {Object.entries(nodeRegistry).map(([id, info]) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 24, fontFamily: 'monospace', fontSize: 10, color: '#cbd5e1' }}>
                <span style={{ width: 200, flexShrink: 0, color: '#818cf8', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={id}>{id}</span>
                <span style={{ width: 100, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: info.status === 'TRAINING' ? '#fbbf24' : info.status === 'COMPLETED' ? '#34d399' : '#475569',
                    boxShadow: info.status === 'TRAINING' ? '0 0 8px rgba(251,191,36,0.3)' : '',
                    animation: info.status === 'TRAINING' ? 'pulse 1.5s infinite' : '',
                  }} />
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>{info.status}</span>
                </span>
                <span style={{ flex: 1, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{info.hash || '----------------'}</span>
                <span style={{ width: 40, textAlign: 'right', flexShrink: 0, color: '#34d399', opacity: 0.6 }}>1.0</span>
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
