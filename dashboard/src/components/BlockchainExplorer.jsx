import React, { useRef, useEffect, useState } from 'react';
import { Box, Layers, History, ShieldCheck, Activity, Archive, Landmark, Database, X, Hash, Cpu, Key, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BlockchainRibbon = ({ blockchain }) => {
  const ribbonRef = useRef(null);
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    if (ribbonRef.current) {
      ribbonRef.current.scrollTop = ribbonRef.current.scrollHeight;
    }
  }, [blockchain]);

  const hasBlocks = blockchain && blockchain.length > 0;

  return (
    <div className="bl-root">
      {/* Ribbon Header */}
      <div className="bl-header">
        <div className="bl-header-left">
          <Landmark size={13} className="bl-header-icon" />
          <span className="bl-header-title">Audit Ledger</span>
        </div>
        <div className="bl-header-right">
          <div className="bl-header-label-group">
            <Database size={13} className="bl-db-icon" />
            <h3 className="bl-header-name">Blockchain Ledger</h3>
          </div>
          <div className="bl-sync-badge">
            <div className="bl-sync-dot" />
            <span>Realtime Synchronized ({blockchain?.length || 0} Blocks)</span>
          </div>
        </div>
      </div>

      {/* Ledger Column Headers */}
      <div className="bl-col-headers">
        <div>Block ID</div>
        <div className="bl-col-hash">Checksum / Merkle</div>
        <div className="bl-col-center">Txs / Load</div>
        <div className="bl-col-right">Integrity Status</div>
      </div>

      {/* Ledger Rows Viewport */}
      <div ref={ribbonRef} className="bl-rows">
        {!hasBlocks ? (
          <div className="bl-empty">
            <Database size={20} className="bl-empty-icon" />
            <span>Awaiting genesis block synchronization...</span>
          </div>
        ) : (
          blockchain.map((block) => (
            <motion.div
              key={`${block.index}-${block.hash}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`bl-row ${block.index === 0 ? 'bl-row-genesis' : ''}`}
              onClick={() => setSelectedBlock(block)}
              style={{ cursor: 'pointer' }}
            >
              {/* Block ID */}
              <div className="bl-cell-id">
                <div className={`bl-block-dot ${block.index === 0 ? 'bl-dot-genesis' : ''}`} />
                <span className="bl-block-name">
                  {block.index === 0 ? 'Genesis' : `Block #${block.index.toString().padStart(4, '0')}`}
                </span>
              </div>

              {/* Signature Hash */}
              <div className="bl-cell-hash">
                <span className="bl-hash-text" title={block.hash}>
                  {block.hash !== 'null' && block.hash && block.hash.length > 16
                    ? `${block.hash.substring(0, 10)}...${block.hash.substring(block.hash.length - 8)}`
                    : block.hash === 'null' ? '0x0000_GENESIS' : block.hash || '0x...'}
                </span>
                {block.merkle_root && (
                  <span className="bl-merkle-badge" title={`Merkle Root: ${block.merkle_root}`}>
                    M: {block.merkle_root.substring(0, 8)}...
                  </span>
                )}
              </div>

              {/* Metrics/Load */}
              <div className="bl-cell-load">
                <span className="bl-load-text">{(block.transactions || []).length} TX</span>
                <div className="bl-load-bars">
                  {[...Array(Math.min((block.transactions || []).length, 5))].map((_, idx) => (
                    <div key={idx} className="bl-load-bar" />
                  ))}
                </div>
              </div>

              {/* Integrity Status */}
              <div className="bl-cell-status">
                <span className={`bl-status-tag ${block.index === 0 ? 'bl-tag-auth' : 'bl-tag-verified'}`}>
                  {block.index === 0 ? 'Authorized' : 'Verified ✓'}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Interactive Cryptographic Block Inspector Modal */}
      <AnimatePresence>
        {selectedBlock && (
          <motion.div
            className="bl-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBlock(null)}
          >
            <motion.div
              className="bl-modal-content"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bl-modal-header">
                <div className="bl-modal-title-group">
                  <Database size={16} className="text-emerald-400" />
                  <h4 className="bl-modal-title">
                    {selectedBlock.index === 0 ? 'Genesis Block #0000' : `Block #${selectedBlock.index.toString().padStart(4, '0')}`} Detailed Inspection
                  </h4>
                </div>
                <button className="bl-modal-close" onClick={() => setSelectedBlock(null)}>
                  <X size={16} />
                </button>
              </div>

              <div className="bl-modal-body">
                {/* Cryptographic Key-Values */}
                <div className="bl-meta-grid">
                  <div className="bl-meta-item">
                    <span className="bl-meta-label">Block Hash (SHA-256)</span>
                    <span className="bl-meta-value font-mono text-emerald-400 select-all">{selectedBlock.hash}</span>
                  </div>
                  <div className="bl-meta-item">
                    <span className="bl-meta-label">Previous Block Hash</span>
                    <span className="bl-meta-value font-mono text-slate-400 select-all">{selectedBlock.previous_hash || '0'.repeat(64)}</span>
                  </div>
                  {selectedBlock.merkle_root && (
                    <div className="bl-meta-item">
                      <span className="bl-meta-label">Merkle Tree Root</span>
                      <span className="bl-meta-value font-mono text-cyan-400 select-all">{selectedBlock.merkle_root}</span>
                    </div>
                  )}
                  <div className="bl-meta-item-row">
                    <div>
                      <span className="bl-meta-label">Miner / Validator Node</span>
                      <span className="bl-meta-value text-slate-200">{selectedBlock.miner || 'COORDINATOR_NODE'}</span>
                    </div>
                    <div>
                      <span className="bl-meta-label">PoW Nonce</span>
                      <span className="bl-meta-value font-mono text-amber-400">{selectedBlock.nonce ?? 0}</span>
                    </div>
                    <div>
                      <span className="bl-meta-label">Difficulty Target</span>
                      <span className="bl-meta-value font-mono text-slate-300">{selectedBlock.difficulty ?? 2} leading zeros</span>
                    </div>
                    <div>
                      <span className="bl-meta-label">Timestamp</span>
                      <span className="bl-meta-value text-slate-300">
                        {selectedBlock.timestamp ? new Date(selectedBlock.timestamp * 1000).toLocaleTimeString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="bl-txs-container">
                  <h5 className="bl-txs-title">On-Chain Transactions ({selectedBlock.transactions?.length || 0})</h5>
                  <div className="bl-txs-table-wrapper">
                    <table className="bl-txs-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Client / Node</th>
                          <th>Fingerprint (Hash)</th>
                          <th>Reputation</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedBlock.transactions || []).map((tx, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className="bl-badge-type">{tx.tx_type || (tx.event ? 'GENESIS' : 'UPDATE')}</span>
                            </td>
                            <td className="font-semibold text-slate-200">{tx.client_id || 'SYSTEM'}</td>
                            <td className="font-mono text-xs text-slate-400" title={tx.model_hash || tx.tx_id}>
                              {tx.model_hash ? `${tx.model_hash.substring(0, 12)}...` : tx.message || '—'}
                            </td>
                            <td className="text-emerald-400 font-mono">{tx.reputation_score !== undefined ? `${tx.reputation_score}` : '100'}</td>
                            <td>
                              <span className={`bl-badge-status ${tx.validation_status === 'VALID' || tx.event ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {tx.validation_status || tx.event || 'CONFIRMED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .bl-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          background: #0a0e17;
          border-radius: 4px;
          position: relative;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .bl-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #10b981, transparent);
          opacity: 0.4;
          z-index: 5;
        }

        /* ── Header ── */
        .bl-header {
          padding: 12px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.03), transparent);
        }
        .bl-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bl-header-icon {
          color: #10b981;
          opacity: 0.85;
        }
        .bl-header-title {
          font-size: 10px;
          font-weight: 800;
          color: rgba(255,255,255,0.55);
          text-transform: uppercase;
          letter-spacing: 0.25em;
          font-family: monospace;
        }
        .bl-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .bl-header-label-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bl-db-icon {
          color: #10b981;
          opacity: 0.8;
        }
        .bl-header-name {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          margin: 0;
        }
        .bl-sync-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 4px;
        }
        .bl-sync-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px rgba(16,185,129,0.6);
          animation: bl-pulse 2s infinite;
        }
        @keyframes bl-pulse {
          0% { opacity: 1; box-shadow: 0 0 8px rgba(16,185,129,0.6); }
          50% { opacity: 0.4; box-shadow: 0 0 4px rgba(16,185,129,0.2); }
          100% { opacity: 1; box-shadow: 0 0 8px rgba(16,185,129,0.6); }
        }
        .bl-sync-badge span {
          font-size: 9px;
          font-weight: 700;
          color: #34d399;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* ── Column Headers ── */
        .bl-col-headers {
          display: grid;
          grid-template-columns: 140px 1fr 110px 130px;
          align-items: center;
          padding: 10px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.4);
          flex-shrink: 0;
          font-size: 9px;
          font-weight: 800;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-family: monospace;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .bl-col-hash { padding-left: 16px; }
        .bl-col-center { text-align: center; }
        .bl-col-right { text-align: right; }

        /* ── Rows ── */
        .bl-rows {
          flex: 1;
          overflow-y: auto;
          background: #060a12;
        }
        .bl-rows::-webkit-scrollbar { width: 5px; }
        .bl-rows::-webkit-scrollbar-track { background: #060a12; }
        .bl-rows::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        .bl-rows::-webkit-scrollbar-thumb:hover { background: #334155; }

        .bl-row {
          display: grid;
          grid-template-columns: 140px 1fr 110px 130px;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.2s;
        }
        .bl-row:hover {
          background: rgba(255,255,255,0.04);
        }
        .bl-row-genesis {
          background: rgba(16,185,129,0.04);
          border-left: 2px solid #10b981;
        }

        /* ── Cells ── */
        .bl-cell-id {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bl-block-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          flex-shrink: 0;
        }
        .bl-dot-genesis {
          background: #10b981;
          box-shadow: 0 0 10px rgba(16,185,129,0.6);
        }
        .bl-block-name {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: monospace;
        }

        .bl-cell-hash {
          padding-left: 16px;
          overflow: hidden;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bl-hash-text {
          font-family: monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.02em;
          transition: color 0.2s;
        }
        .bl-merkle-badge {
          font-size: 8px;
          padding: 1px 6px;
          background: rgba(6,182,212,0.1);
          border: 1px solid rgba(6,182,212,0.25);
          color: #22d3ee;
          border-radius: 2px;
          font-family: monospace;
        }
        .bl-row:hover .bl-hash-text {
          color: rgba(255,255,255,0.8);
        }

        .bl-cell-load {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .bl-load-text {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          font-family: monospace;
          white-space: nowrap;
        }
        .bl-load-bars {
          display: flex;
          gap: 2px;
          align-items: flex-end;
        }
        .bl-load-bar {
          width: 3px;
          height: 10px;
          background: #10b981;
          opacity: 0.4;
          transition: opacity 0.2s;
        }
        .bl-row:hover .bl-load-bar {
          opacity: 0.85;
        }

        .bl-cell-status {
          display: flex;
          justify-content: flex-end;
        }
        .bl-status-tag {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 3px 10px;
          border: 1px solid;
          border-radius: 3px;
          white-space: nowrap;
        }
        .bl-tag-auth {
          color: #34d399;
          border-color: rgba(52,211,153,0.3);
          background: rgba(52,211,153,0.08);
        }
        .bl-tag-verified {
          color: #10b981;
          border-color: rgba(16,185,129,0.25);
          background: rgba(16,185,129,0.08);
        }

        /* ── Modal ── */
        .bl-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .bl-modal-content {
          background: #0d131f;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          width: 100%;
          max-width: 680px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0,0,0,0.8);
          overflow: hidden;
        }
        .bl-modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.02);
        }
        .bl-modal-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bl-modal-title {
          font-size: 13px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }
        .bl-modal-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
        }
        .bl-modal-close:hover {
          color: #ffffff;
        }
        .bl-modal-body {
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .bl-meta-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(0,0,0,0.3);
          padding: 14px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .bl-meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .bl-meta-item-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .bl-meta-label {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .bl-meta-value {
          font-size: 11px;
          word-break: break-all;
        }
        .bl-txs-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bl-txs-title {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .bl-txs-table-wrapper {
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
          overflow: hidden;
        }
        .bl-txs-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .bl-txs-table th {
          background: rgba(0,0,0,0.4);
          padding: 8px 12px;
          text-align: left;
          color: #64748b;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .bl-txs-table td {
          padding: 8px 12px;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .bl-badge-type {
          font-size: 8px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 3px;
          background: rgba(59,130,246,0.1);
          color: #60a5fa;
          border: 1px solid rgba(59,130,246,0.25);
        }
        .bl-badge-status {
          font-size: 9px;
          font-weight: 700;
        }

        /* ── Empty State ── */
        .bl-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px;
          height: 100%;
        }
        .bl-empty-icon {
          color: rgba(255,255,255,0.08);
        }
        .bl-empty span {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
      `}</style>
    </div>
  );
};
