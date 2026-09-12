import React, { useState, useRef, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';

export const MetricsChart = ({ data = [], lossData = [] }) => {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 20 && height > 20) setIsReady(true);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const normalizeAcc = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 0;
    const num = Number(val);
    return num <= 1 && num > 0 ? num * 100 : num;
  };

  const normalizeLoss = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 0;
    return Number(val);
  };

  const hasData = data && data.length > 0 && data.some(v => v > 0);

  // Chart data mapping
  const chartData = hasData
    ? data.map((val, index) => ({
        round: `R${index + 1}`,
        accuracy: parseFloat(normalizeAcc(val).toFixed(2)),
        loss: parseFloat(normalizeLoss(lossData[index] || 0).toFixed(4)),
      }))
    : [
        { round: 'R1', accuracy: 0, loss: 0 },
        { round: 'R2', accuracy: 0, loss: 0 },
        { round: 'R3', accuracy: 0, loss: 0 },
        { round: 'R4', accuracy: 0, loss: 0 },
        { round: 'R5', accuracy: 0, loss: 0 },
      ];

  const currentAcc = hasData ? normalizeAcc(data[data.length - 1]).toFixed(1) : "0.0";
  const currentLoss = lossData.length > 0 ? normalizeLoss(lossData[lossData.length - 1]).toFixed(3) : "0.000";
  
  const accImproved = data.length > 1 ? normalizeAcc(data[data.length - 1]) >= normalizeAcc(data[data.length - 2]) : true;
  const lossReduced = lossData.length > 1 ? normalizeLoss(lossData[lossData.length - 1]) <= normalizeLoss(lossData[lossData.length - 2]) : true;

  return (
    <div className="mc-root">
      {/* Chart Top Sub-Bar */}
      <div className="mc-top-bar">
        <div className="mc-title-group">
          <Activity size={13} className="mc-icon" />
          <span className="mc-title-text">Convergence Metrics</span>
        </div>
        <div className="mc-badge-live">
          <span className="mc-badge-dot" />
          <span className="mc-badge-text">{currentAcc}% Global</span>
        </div>
      </div>

      {/* Chart Canvas Wrap */}
      <div ref={containerRef} className="mc-canvas-area">
        {!hasData && (
          <div className="mc-empty-overlay">
            <div className="mc-empty-chip">
              <Sparkles size={12} className="mc-empty-icon" />
              <span className="mc-empty-text">
                Awaiting active federated training round to plot convergence
              </span>
            </div>
          </div>
        )}

        {isReady && (
          <ResponsiveContainer width="100%" height={170} debounce={40}>
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -24, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.8} />
              <XAxis
                dataKey="round"
                fontSize={9}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}
                dy={4}
              />
              <YAxis
                yAxisId="left"
                fontSize={9}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                fontSize={9}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#ef4444', fontWeight: 600, fontFamily: 'monospace' }}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '11px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  fontFamily: 'monospace'
                }}
                labelStyle={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}
                itemStyle={{ fontWeight: 700 }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="accuracy"
                stroke="#0284c7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAcc)"
                animationDuration={800}
                name="Accuracy (%)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="loss"
                stroke="#ef4444"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorLoss)"
                animationDuration={800}
                name="Loss"
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Dual Summary Metrics Cards */}
      <div className="mc-cards-grid">
        <div className="mc-card">
          <div className="mc-card-header">
            <span className="mc-card-label">Global Accuracy</span>
            {hasData && data.length > 1 && (
              <TrendingUp size={13} className={accImproved ? 'mc-trend-up' : 'mc-trend-down'} />
            )}
          </div>
          <div className="mc-card-val-row">
            <span className="mc-card-val">{currentAcc}%</span>
          </div>
          <div className="mc-card-subtext">
            Institutional Convergence
          </div>
        </div>
        
        <div className="mc-card">
          <div className="mc-card-header">
            <span className="mc-card-label">Training Loss</span>
            {lossData.length > 1 && (
              <TrendingDown size={13} className={lossReduced ? 'mc-trend-up' : 'mc-trend-down'} />
            )}
          </div>
          <div className="mc-card-val-row">
            <span className="mc-card-val mc-val-loss">{currentLoss}</span>
          </div>
          <div className="mc-card-subtext">
            Error Minimization
          </div>
        </div>
      </div>

      <style>{`
        .mc-root {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 12px;
        }
        .mc-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .mc-title-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .mc-icon {
          color: #0284c7;
        }
        .mc-title-text {
          font-size: 10px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .mc-badge-live {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px;
          border-radius: 999px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }
        .mc-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px rgba(16,185,129,0.5);
        }
        .mc-badge-text {
          font-size: 9px;
          font-weight: 700;
          color: #047857;
          font-family: var(--font-mono, monospace);
        }
        .mc-canvas-area {
          width: 100%;
          height: 170px;
          min-height: 170px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mc-empty-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(1px);
          pointer-events: none;
        }
        .mc-empty-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }
        .mc-empty-icon {
          color: #0284c7;
        }
        .mc-empty-text {
          font-size: 9.5px;
          font-weight: 600;
          color: #64748b;
        }
        .mc-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .mc-card {
          padding: 10px 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mc-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .mc-card-label {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .mc-trend-up {
          color: #10b981;
        }
        .mc-trend-down {
          color: #ef4444;
          transform: rotate(180deg);
        }
        .mc-card-val-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .mc-card-val {
          font-size: 16px;
          font-weight: 800;
          font-family: var(--font-mono, monospace);
          color: #0f172a;
        }
        .mc-val-loss {
          color: #ef4444;
        }
        .mc-card-subtext {
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};
