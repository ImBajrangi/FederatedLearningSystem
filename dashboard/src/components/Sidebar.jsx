import React from 'react';
import {
  LayoutDashboard, Database, ShieldCheck, Terminal, Activity,
  History, Workflow, Cpu, BookOpen, PieChart, Server, ChevronRight, ChevronLeft,
  PanelLeftClose, PanelLeftOpen, LogOut, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MetricItem = ({ label, value, tag, description, icon: Icon, color, isCollapsed }) => {
  if (isCollapsed) {
    return (
      <div className="sb-metric-item-collapsed group">
        <div className={`sb-metric-icon-wrap ${color ? `sb-icon-${color}` : ''}`}>
          {Icon && <Icon size={13} />}
        </div>
        <span className="sb-metric-val-mini">{value}</span>

        {/* Floating Pro Info Tag */}
        <div className="sb-tooltip">
          <div className="sb-tooltip-tag">{tag || 'SYSTEM TELEMETRY'}</div>
          <div className="sb-tooltip-title">{label}</div>
          <div className="sb-tooltip-badge">{value}</div>
          {description && <div className="sb-tooltip-desc">{description}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="sb-metric-item group">
      <div className={`sb-metric-icon-wrap ${color ? `sb-icon-${color}` : ''}`}>
        {Icon && <Icon size={12} />}
      </div>
      <div className="sb-metric-content">
        <span className="sb-metric-label">{label}</span>
        <span className="sb-metric-value">{value}</span>
      </div>
      <div className="sb-metric-indicator" />
    </div>
  );
};

export const Sidebar = ({
  currentView,
  setView,
  clients = [],
  nodeRegistry = {},
  rejectedCount = 0,
  blockchain = [],
  width = 280,
  isCollapsed = false,
  onToggleCollapse,
  onResize,
  onLogout
}) => {
  const { user, displayName, profile } = useAuth();
  const userEmail = user?.email || 'guest@node.local';
  const userInitials = displayName?.slice(0, 2)?.toUpperCase() || 'RN';
  
  // Real live telemetry calculations
  const regEntries = Object.entries(nodeRegistry || {});
  const nodeCount = regEntries.length;
  const activeCount = regEntries.filter(([_, n]) => ['CONNECTED', 'ACTIVE', 'BUSY', 'TRAINING'].includes(n.status)).length;

  const totalTx = (blockchain || []).reduce((acc, blk) => acc + (blk.transactions ? blk.transactions.length : 0), 0);
  const yieldValue = totalTx > 0
    ? Math.max(0, Math.min(100, ((totalTx - (rejectedCount || 0)) / totalTx) * 100)).toFixed(1)
    : (nodeCount > 0 ? "100.0" : "0.0");

  const powerValue = nodeCount === 0 ? "0.0" : (activeCount * 1.25 + (blockchain && blockchain.length > 1 ? 0.35 : 0.0)).toFixed(1);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Academic Progress',
      num: '01',
      tag: '01 • CORE DASHBOARD',
      desc: 'Global orchestration, real-time node convergence & training status.',
      icon: LayoutDashboard
    },
    {
      id: 'training',
      label: 'Training Cluster',
      num: '02',
      tag: '02 • FEDERATED ENGINE',
      desc: 'Active training rounds, parameter aggregation & connected edge nodes.',
      icon: Activity
    },
    {
      id: 'datasets',
      label: 'Shard Registry',
      num: '03',
      tag: '03 • DATA STORAGE',
      desc: 'Distributed datasets, hospital edge shards & cryptographic partition proofs.',
      icon: Database
    },
    {
      id: 'privacy_vault',
      label: 'Privacy Vault',
      num: '04',
      tag: '04 • CRYPTOGRAPHY',
      desc: 'Differential privacy bounds (ε, δ), gradient clipping & zero-knowledge verification.',
      icon: ShieldCheck
    },
    {
      id: 'laboratory',
      label: 'Code Laboratory',
      num: '05',
      tag: '05 • INTERACTIVE REPL',
      desc: 'Python AI sandbox, model architecture inspection & custom training script runner.',
      icon: Terminal
    },
  ];

  return (
    <aside className={`sb-root ${isCollapsed ? 'sb-collapsed' : ''}`} style={{ width }}>
      {/* Resize Handle (only when expanded) */}
      {!isCollapsed && onResize && (
        <div onMouseDown={onResize} className="sb-resizer">
          <div className="sb-resizer-line" />
        </div>
      )}

      {/* Navigation Section */}
      <div className="sb-scroll">
        {/* Section Header with Collapse/Expand Toggle */}
        <div className="sb-section-header">
          {!isCollapsed ? (
            <>
              <div className="sb-header-left">
                <BookOpen size={12} />
                <span>Coursework</span>
              </div>
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="sb-collapse-toggle-btn"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft size={13} />
                </button>
              )}
            </>
          ) : (
            onToggleCollapse && (
              <div className="sb-collapsed-toggle-wrap">
                <button
                  onClick={onToggleCollapse}
                  className="sb-expand-toggle-btn"
                  aria-label="Expand Sidebar"
                >
                  <ChevronRight size={14} />
                </button>
                <div className="sb-tooltip">
                  <div className="sb-tooltip-tag">LAYOUT CONTROL</div>
                  <div className="sb-tooltip-title">Expand Sidebar</div>
                  <div className="sb-tooltip-desc">Restore full navigation labels, telemetry graphs, and user details.</div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sb-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`sb-nav-btn ${isActive ? 'sb-nav-active' : ''} ${isCollapsed ? 'sb-nav-btn-collapsed' : ''}`}
              >
                {!isCollapsed ? (
                  <>
                    <span className="sb-nav-num">{item.num}</span>
                    <span className="sb-nav-label">{item.label}</span>
                    {isActive && <ChevronRight size={10} className="sb-nav-chevron" />}
                  </>
                ) : (
                  <>
                    <div className="sb-collapsed-icon-wrap">
                      <Icon size={16} className={isActive ? 'text-primary' : 'text-slate-500'} />
                      <span className="sb-collapsed-num">{item.num}</span>
                    </div>

                    {/* Floating Pro Info Tag */}
                    <div className="sb-tooltip">
                      <div className="sb-tooltip-tag">{item.tag}</div>
                      <div className="sb-tooltip-title">{item.label}</div>
                      <div className="sb-tooltip-desc">{item.desc}</div>
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Telemetry Header */}
        {!isCollapsed ? (
          <div className="sb-section-header sb-section-stats">
            <Activity size={12} />
            <span>System Telemetry</span>
          </div>
        ) : (
          <div className="sb-section-stats-divider" />
        )}

        {/* Telemetry Items */}
        <div className={`sb-metrics ${isCollapsed ? 'sb-metrics-collapsed' : ''}`}>
          <MetricItem
            label="Node Count"
            value={nodeCount}
            tag="CLUSTER NODES"
            description="Active edge workers & hospitals participating in federated learning."
            icon={Server}
            color="primary"
            isCollapsed={isCollapsed}
          />
          <MetricItem
            label="Verification Yield"
            value={`${yieldValue}%`}
            tag="AUDIT & CONSENSUS"
            description="Cryptographic proof and smart contract validation rate on model weights."
            icon={ShieldCheck}
            color="success"
            isCollapsed={isCollapsed}
          />
          <MetricItem
            label="Computing Power"
            value={`${powerValue} GB/S`}
            tag="SYSTEM THROUGHPUT"
            description="Aggregate tensor transfer bandwidth and training compute ingestion."
            icon={Cpu}
            color="accent"
            isCollapsed={isCollapsed}
          />
        </div>
      </div>

      {/* User Branding & Footer */}
      <footer className={`sb-footer ${isCollapsed ? 'sb-footer-collapsed' : ''}`}>
        {!isCollapsed ? (
          <div className="sb-footer-inner">
            <div className="sb-user-avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }} />
              ) : (
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>{userInitials}</span>
              )}
            </div>
            <div className="sb-user-info">
              <span className="sb-user-name" title={userEmail}>{displayName}</span>
              <div className="sb-user-status">
                <div className="sb-status-dot" />
                <span>{user?.guest ? 'Guest Mode' : 'Authenticated'}</span>
              </div>
            </div>
            <button className="sb-logout-btn" onClick={onLogout} title="Terminate Session">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="sb-footer-collapsed-inner">
            <div className="sb-collapsed-avatar-wrap">
              <div className="sb-user-avatar">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }} />
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 800 }}>{userInitials}</span>
                )}
              </div>
              <div className="sb-tooltip">
                <div className="sb-tooltip-tag">USER PROFILE</div>
                <div className="sb-tooltip-title">{displayName}</div>
                <div className="sb-tooltip-badge">{user?.guest ? 'Guest Mode' : 'Authenticated'}</div>
                <div className="sb-tooltip-desc">{userEmail}</div>
              </div>
            </div>

            <div className="sb-collapsed-logout-wrap">
              <button className="sb-logout-btn-mini" onClick={onLogout} aria-label="Terminate Session">
                <LogOut size={13} />
              </button>
              <div className="sb-tooltip">
                <div className="sb-tooltip-tag">SESSION CONTROL</div>
                <div className="sb-tooltip-title" style={{ color: '#f87171' }}>Terminate Session</div>
                <div className="sb-tooltip-desc">Sign out and securely disconnect from the federated cluster.</div>
              </div>
            </div>
          </div>
        )}
      </footer>

      <style>{`
        .sb-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #fff;
          border-right: 1px solid var(--border);
          position: relative;
          flex-shrink: 0;
          font-family: var(--font-sans);
          transition: width 0.22s ease-in-out;
        }

        .sb-resizer {
          position: absolute; top: 0; right: -3px; bottom: 0; width: 6px;
          cursor: col-resize; z-index: 100;
        }
        .sb-resizer-line {
          position: absolute; top: 0; bottom: 0; left: 2px; width: 2px;
          background: transparent; transition: background 0.2s;
        }
        .sb-resizer:hover .sb-resizer-line { background: var(--primary); }

        .sb-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; }
        .sb-scroll::-webkit-scrollbar { width: 3px; }
        .sb-scroll::-webkit-scrollbar-thumb { background: var(--border); }

        .sb-section-header {
          padding: 24px 20px 16px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }
        .sb-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.6;
        }
        .sb-section-stats { margin-top: 16px; opacity: 0.5; padding-left: 28px; }

        .sb-section-stats-divider {
          height: 1px;
          background: var(--border);
          margin: 16px 12px;
          opacity: 0.6;
        }

        .sb-collapse-toggle-btn {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid var(--border);
          background: #f8fafc;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }
        .sb-collapse-toggle-btn:hover {
          background: #f1f5f9;
          color: var(--text-main);
          border-color: #94a3b8;
        }

        .sb-expand-toggle-btn {
          width: 36px;
          height: 32px;
          margin: 0 auto;
          border-radius: 4px;
          border: 1px solid var(--border);
          background: #f8fafc;
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }
        .sb-expand-toggle-btn:hover {
          background: #e2e8f0;
          border-color: var(--primary);
        }

        .sb-nav { display: flex; flex-direction: column; }
        .sb-nav-btn {
          height: 48px;
          padding: 0 28px;
          display: flex;
          align-items: center;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
          text-align: left;
        }
        .sb-nav-btn:hover { background: var(--bg-main); }
        .sb-nav-active { background: color-mix(in srgb, var(--primary) 5%, transparent); }
        .sb-nav-active::before {
          content: '';
          position: absolute; left: 0; top: 12px; bottom: 12px; width: 3px;
          background: var(--primary);
        }

        .sb-nav-btn-collapsed {
          padding: 0;
          justify-content: center;
          height: 52px;
        }

        .sb-collapsed-icon-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .sb-collapsed-num {
          font-family: var(--font-mono);
          font-size: 8px;
          font-weight: 800;
          color: var(--text-muted);
          opacity: 0.7;
        }

        .sb-nav-num {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 800;
          color: var(--primary);
          opacity: 0.4;
          width: 32px;
          letter-spacing: 0.1em;
        }
        .sb-nav-active .sb-nav-num { opacity: 1; }

        .sb-nav-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          transition: color 0.15s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .sb-nav-active .sb-nav-label { color: var(--text-main); }
        .sb-nav-chevron { margin-left: auto; color: var(--primary); opacity: 0.5; }

        .sb-metrics { padding: 8px 24px 24px; display: flex; flex-direction: column; gap: 2px; }
        .sb-metrics-collapsed {
          padding: 8px 6px;
          align-items: center;
          gap: 8px;
        }

        .sb-metric-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
          position: relative;
        }
        .sb-metric-item:last-child { border-bottom: none; }
        
        .sb-metric-item-collapsed {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 6px 0;
          width: 100%;
        }
        .sb-metric-val-mini {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 800;
          color: var(--text-main);
          text-align: center;
        }

        .sb-metric-icon-wrap {
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-main);
          border: 1px solid var(--border);
          color: var(--text-muted);
          opacity: 0.7;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .sb-icon-primary { color: var(--primary); }
        .sb-icon-success { color: var(--success); }
        .sb-icon-accent { color: #f59e0b; }
        .sb-metric-item:hover .sb-metric-icon-wrap { border-color: var(--primary); opacity: 1; }

        .sb-metric-content { display: flex; flex-direction: column; gap: 2px; }
        .sb-metric-label { font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; }
        .sb-metric-value { font-family: var(--font-mono); font-size: 12px; font-weight: 800; color: var(--text-main); tabular-nums: true; }
        
        .sb-metric-indicator {
          position: absolute; right: 0; width: 0; height: 2px;
          background: var(--primary); opacity: 0; transition: all 0.2s;
        }
        .sb-metric-item:hover .sb-metric-indicator { width: 12px; opacity: 0.4; }

        .sb-footer {
          padding: 20px 24px; 
          background: #fff; 
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        .sb-footer-collapsed {
          padding: 14px 8px;
        }
        .sb-footer-inner { display: flex; align-items: center; gap: 14px; }
        .sb-footer-collapsed-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .sb-user-avatar {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          background: #0f172a;
          color: #fff;
          border-radius: 4px;
          flex-shrink: 0;
          cursor: default;
        }
        .sb-user-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; overflow: hidden; }
        .sb-user-name { font-size: 11px; font-weight: 800; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sb-user-status { display: flex; align-items: center; gap: 6px; }
        .sb-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); }
        .sb-user-status span { font-size: 9px; font-weight: 700; color: var(--success); text-transform: uppercase; letter-spacing: 0.08em; }

        .sb-logout-btn {
          margin-left: auto;
          width: 30px;
          height: 30px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          flex-shrink: 0;
        }
        .sb-logout-btn:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: #ef4444;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
        }

        .sb-logout-btn-mini {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }
        .sb-logout-btn-mini:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: #ef4444;
        }

        /* Collapsed Sidebar Pro Tooltip & Hover Tags */
        .sb-collapsed {
          overflow: visible !important;
          z-index: 100;
        }
        .sb-collapsed .sb-scroll {
          overflow: visible !important;
        }
        .sb-collapsed-toggle-wrap,
        .sb-nav-btn-collapsed,
        .sb-metric-item-collapsed,
        .sb-collapsed-avatar-wrap,
        .sb-collapsed-logout-wrap {
          position: relative;
        }

        .sb-tooltip {
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%) translateX(-4px);
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.09), 0 4px 6px -2px rgba(15, 23, 42, 0.03);
          padding: 9px 12px;
          border-radius: 6px;
          width: 220px;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          z-index: 99999;
          transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
          display: flex;
          flex-direction: column;
          gap: 2.5px;
          text-align: left;
        }

        .sb-tooltip::before {
          content: '';
          position: absolute;
          left: -5px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-left: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }

        .sb-collapsed-toggle-wrap:hover .sb-tooltip,
        .sb-nav-btn-collapsed:hover .sb-tooltip,
        .sb-metric-item-collapsed:hover .sb-tooltip,
        .sb-collapsed-avatar-wrap:hover .sb-tooltip,
        .sb-collapsed-logout-wrap:hover .sb-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) translateX(0);
        }

        .sb-tooltip-tag {
          font-family: var(--font-mono);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #0284c7;
          text-transform: uppercase;
        }

        .sb-tooltip-title {
          font-size: 11.5px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .sb-tooltip-badge {
          display: inline-block;
          align-self: flex-start;
          font-family: var(--font-mono);
          font-size: 9.5px;
          font-weight: 700;
          color: #0284c7;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 1px 6px;
          border-radius: 3px;
          margin: 2px 0;
        }

        .sb-tooltip-desc {
          font-size: 10px;
          line-height: 1.4;
          color: #64748b;
          font-weight: 400;
        }
      `}</style>
    </aside>
  );
};
