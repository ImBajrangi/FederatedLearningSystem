import React, { useRef, useEffect } from 'react';

interface LogEntry {
  msg: string;
  color: string;
}

interface TerminalProps {
  logs: LogEntry[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={terminalRef}
      className="font-mono border-t scroll-smooth"
      style={{
        height: '300px',
        width: '100%',
        backgroundColor: 'var(--terminal-bg)',
        padding: '16px',
        overflowY: 'auto',
        fontSize: '11px',
        lineHeight: '1.6'
      }}
    >
      <div className="flex flex-col gap-1">
        {logs.map((log, i) => (
          <div
            key={i}
            className="flex gap-2"
            style={{ color: log.color }}
          >
            <span style={{ opacity: 0.5, userSelect: 'none' }}>[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
            <span style={{ whiteSpace: 'pre-wrap' }}>{log.msg}</span>
          </div>
        ))}
        <div className="flex items-center gap-2" style={{ color: 'var(--primary)' }}>
          <span style={{ opacity: 0.5, userSelect: 'none' }}>[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
          <span>&gt;</span>
          <span
            className="animate-pulse-dot"
            style={{
              display: 'inline-block',
              width: '10px',
              height: '16px',
              backgroundColor: 'var(--primary)',
              boxShadow: '0 0 10px var(--primary)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
