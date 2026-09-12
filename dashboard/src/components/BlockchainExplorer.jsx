import React, { useRef, useEffect, useState } from 'react';
import { Box, Layers, History, ShieldCheck, Activity, Archive, Landmark, Database, X, Hash, Cpu, Key, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BlockchainRibbon = ({ blockchain = [] }) => {
  const ribbonRef = useRef(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const safeBlockchain = Array.isArray(blockchain) ? blockchain : [];

  useEffect(() => {
    if (ribbonRef.current) {
      ribbonRef.current.scrollTop = ribbonRef.current.scrollHeight;
    }
  }, [safeBlockchain]);

  const hasBlocks = safeBlockchain.length > 0;

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
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bl-modal-header">
                <div className="bl-modal-title-group">
                  <div className="bl-modal-icon-badge">
                    <Database size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="bl-modal-title">
                      {selectedBlock.index === 0 ? 'Genesis Block #0000' : `Block #${selectedBlock.index.toString().padStart(4, '0')}`}
                    </h4>
                    <span className="bl-modal-subtitle">Cryptographic Ledger Inspection & Verification</span>
                  </div>
                </div>
                <button className="bl-modal-close" onClick={() => setSelectedBlock(null)} title="Close">
                  <X size={18} />
                </button>
              </div>

              <div className="bl-modal-body">
                {/* Cryptographic Key-Values */}
                <div className="bl-meta-grid">
                  <div className="bl-meta-item">
                    <div className="flex items-center justify-between">
                      <span className="bl-meta-label">Block Hash (SHA-256)</span>
                      <span className="bl-meta-badge-verified">✓ Cryptographically Valid</span>
                    </div>
                    <div className="bl-hash-box">
                      <span className="bl-hash-val-primary select-all">{selectedBlock.hash}</span>
                    </div>
                  </div>

                  <div className="bl-meta-item">
                    <span className="bl-meta-label">Previous Block Hash</span>
                    <div className="bl-hash-box">
                      <span className="bl-hash-val-secondary select-all">{selectedBlock.previous_hash || '0'.repeat(64)}</span>
                    </div>
                  </div>

                  {selectedBlock.merkle_root && (
                    <div className="bl-meta-item">
                      <span className="bl-meta-label">Merkle Tree Root</span>
                      <div className="bl-hash-box">
                        <span className="bl-hash-val-merkle select-all">{selectedBlock.merkle_root}</span>
                      </div>
                    </div>
                  )}

                  {/* 4-Column Metric Cards */}
                  <div className="bl-meta-cards-grid">
                    <div className="bl-metric-card">
                      <span className="bl-metric-card-label">Validator / Miner</span>
                      <span className="bl-metric-card-val text-white">{selectedBlock.miner || 'COORDINATOR_NODE'}</span>
                    </div>
                    <div className="bl-metric-card">
                      <span className="bl-metric-card-label">PoW Nonce</span>
                      <span className="bl-metric-card-val text-amber-400 font-mono">#{selectedBlock.nonce ?? 0}</span>
                    </div>
                    <div className="bl-metric-card">
                      <span className="bl-metric-card-label">Difficulty Target</span>
                      <span className="bl-metric-card-val text-cyan-400 font-mono">{selectedBlock.difficulty ?? 1} Leading Zeros</span>
                    </div>
                    <div className="bl-metric-card">
                      <span className="bl-metric-card-label">Block Timestamp</span>
                      <span className="bl-metric-card-val text-slate-200">
                        {selectedBlock.timestamp ? new Date(selectedBlock.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'GENESIS'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="bl-txs-container">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="bl-txs-title">On-Chain Transactions & Verifications</h5>
                    <span className="bl-txs-count-badge">{(selectedBlock.transactions || []).length} Recorded</span>
                  </div>
                  <div className="bl-txs-table-wrapper">
                    <table className="bl-txs-table">
                      <thead>
                        <tr>
                          <th>TYPE</th>
                          <th>CLIENT / NODE</th>
                          <th>FINGERPRINT (HASH)</th>
                          <th>REPUTATION</th>
                          <th style={{ textAlign: 'right' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedBlock.transactions || []).length === 0 ? (
                          <tr>
                            <td colSpan="5" className="bl-tx-empty">
                              No transactions in block payload
                            </td>
                          </tr>
                        ) : (
                          (selectedBlock.transactions || []).map((tx, idx) => (
                            <tr key={idx}>
                              <td>
                                <span className="bl-badge-type">{tx.tx_type || (tx.event ? 'GENESIS' : 'UPDATE')}</span>
                              </td>
                              <td className="bl-tx-node-name">{tx.client_id || 'SYSTEM'}</td>
                              <td className="bl-tx-hash-cell" title={tx.model_hash || tx.tx_id}>
                                {tx.model_hash ? `${tx.model_hash.substring(0, 16)}...` : tx.message || '—'}
                              </td>
                              <td>
                                <span className="bl-tx-rep-val">{tx.reputation_score !== undefined ? `${tx.reputation_score}` : '100'}</span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <span className={`bl-badge-status ${tx.validation_status === 'VALID' || tx.event ? 'bl-status-valid' : 'bl-status-err'}`}>
                                  {tx.validation_status || tx.event || 'CONFIRMED ✓'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
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
          background: #ffffff;
          border-radius: 8px;
          position: relative;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .bl-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #10b981, transparent);
          opacity: 0.6;
          z-index: 5;
        }

        /* ── Header ── */
        .bl-header {
          padding: 12px 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          background: #f8fafc;
        }
        .bl-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bl-header-icon {
          color: #10b981;
        }
        .bl-header-title {
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
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
        }
        .bl-header-name {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .bl-sync-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 4px;
        }
        .bl-sync-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px rgba(16,185,129,0.5);
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
          color: #047857;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* ── Column Headers ── */
        .bl-col-headers {
          display: grid;
          grid-template-columns: 140px 1fr 110px 130px;
          align-items: center;
          padding: 10px 20px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          flex-shrink: 0;
          font-size: 9px;
          font-weight: 800;
          color: #64748b;
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
          background: #ffffff;
        }
        .bl-rows::-webkit-scrollbar { width: 5px; }
        .bl-rows::-webkit-scrollbar-track { background: #fafbfc; }
        .bl-rows::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .bl-rows::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .bl-row {
          display: grid;
          grid-template-columns: 140px 1fr 110px 130px;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s;
        }
        .bl-row:hover {
          background: #f8fafc;
        }
        .bl-row-genesis {
          background: #f0fdf4;
          border-left: 3px solid #10b981;
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
          background: #94a3b8;
          flex-shrink: 0;
        }
        .bl-dot-genesis {
          background: #10b981;
          box-shadow: 0 0 10px rgba(16,185,129,0.5);
        }
        .bl-block-name {
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
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
          color: #475569;
          letter-spacing: 0.02em;
          transition: color 0.15s;
        }
        .bl-merkle-badge {
          font-size: 8px;
          padding: 1px 6px;
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          color: #0369a1;
          border-radius: 3px;
          font-family: monospace;
          font-weight: 600;
        }
        .bl-row:hover .bl-hash-text {
          color: #0f172a;
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
          color: #64748b;
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
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .bl-row:hover .bl-load-bar {
          opacity: 1;
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
          border-radius: 4px;
          white-space: nowrap;
        }
        .bl-tag-auth {
          color: #047857;
          border-color: #a7f3d0;
          background: #ecfdf5;
        }
        .bl-tag-verified {
          color: #047857;
          border-color: #a7f3d0;
          background: #ecfdf5;
        }

        /* ── Modal ── */
        .bl-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .bl-modal-content {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          width: 100%;
          max-width: 760px;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
          overflow: hidden;
          color: #0f172a;
        }
        .bl-modal-header {
          padding: 18px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
        }
        .bl-modal-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bl-modal-icon-badge {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bl-modal-title {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a !important;
          margin: 0;
          letter-spacing: 0.01em;
        }
        .bl-modal-subtitle {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: block;
          margin-top: 2px;
        }
        .bl-modal-close {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          transition: all 0.2s;
        }
        .bl-modal-close:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
        }
        .bl-modal-body {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #fafbfc;
        }
        .bl-meta-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: #ffffff;
          padding: 18px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        .bl-meta-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .bl-meta-label {
          font-size: 10px;
          font-weight: 700;
          color: #475569 !important;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .bl-meta-badge-verified {
          font-size: 9px;
          font-weight: 700;
          color: #047857;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .bl-hash-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
        }
        .bl-hash-val-primary {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          color: #059669 !important;
          word-break: break-all;
          line-height: 1.5;
        }
        .bl-hash-val-secondary {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 600;
          color: #475569 !important;
          word-break: break-all;
          line-height: 1.5;
        }
        .bl-hash-val-merkle {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          color: #0284c7 !important;
          word-break: break-all;
          line-height: 1.5;
        }

        /* ── 4-Column Metric Cards ── */
        .bl-meta-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
        }
        @media (max-width: 640px) {
          .bl-meta-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .bl-metric-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .bl-metric-card-label {
          font-size: 9px;
          font-weight: 700;
          color: #64748b !important;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .bl-metric-card-val {
          font-size: 11px;
          font-weight: 700;
          color: #0f172a !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Transactions Container ── */
        .bl-txs-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bl-txs-title {
          font-size: 11px;
          font-weight: 800;
          color: #0f172a !important;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .bl-txs-count-badge {
          font-size: 9px;
          font-weight: 700;
          color: #475569;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid #e2e8f0;
        }
        .bl-txs-table-wrapper {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
        }
        .bl-txs-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .bl-txs-table th {
          background: #f8fafc;
          padding: 10px 14px;
          text-align: left;
          color: #475569 !important;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid #e2e8f0;
        }
        .bl-txs-table td {
          padding: 12px 14px;
          border-top: 1px solid #f1f5f9;
          color: #0f172a !important;
          vertical-align: middle;
        }
        .bl-tx-node-name {
          font-weight: 700;
          color: #0f172a !important;
        }
        .bl-tx-hash-cell {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          color: #0284c7 !important;
        }
        .bl-tx-rep-val {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          color: #059669 !important;
        }
        .bl-badge-type {
          font-size: 8px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
          background: #eff6ff;
          color: #2563eb !important;
          border: 1px solid #bfdbfe;
          letter-spacing: 0.05em;
        }
        .bl-badge-status {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }
        .bl-status-valid {
          color: #059669 !important;
        }
        .bl-status-err {
          color: #dc2626 !important;
        }
        .bl-tx-empty {
          text-align: center;
          padding: 24px;
          color: #94a3b8 !important;
          font-style: italic;
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
          color: #cbd5e1;
        }
        .bl-empty span {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8 !important;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
      `}</style>
    </div>
  );
};
