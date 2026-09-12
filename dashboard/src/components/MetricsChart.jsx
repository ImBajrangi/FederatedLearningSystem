import React, { useState, useRef, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';

export const MetricsChart = ({ data = [], lossData = [] }) => {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(true);

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

  const hasData = data && data.length > 0;

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
    <div className="w-full flex flex-col justify-between h-full">
      {/* Chart Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-primary" />
          <span className="text-[11px] font-bold text-text-main uppercase tracking-wider">
            Institutional Convergence Metrics
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {currentAcc}% Global
            </span>
          </div>
        </div>
      </div>

      {/* Responsive Chart Container */}
      <div ref={containerRef} className="w-full h-[180px] min-h-[160px] relative mt-3 mb-2" style={{ minWidth: 0 }}>
        {!hasData && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-border/80 shadow-xs">
              <Sparkles size={13} className="text-accent" />
              <span className="text-[10px] font-semibold text-text-muted">
                Awaiting active federated training round to plot real-time convergence
              </span>
            </div>
          </div>
        )}

        {isReady && (
          <ResponsiveContainer width="100%" height="100%" debounce={30}>
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 12, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
              <XAxis
                dataKey="round"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontWeight: 600, fontFamily: 'monospace' }}
                dy={6}
              />
              <YAxis
                yAxisId="left"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontWeight: 600, fontFamily: 'monospace' }}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#ef4444', fontWeight: 600, fontFamily: 'monospace' }}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  fontFamily: 'monospace'
                }}
                labelStyle={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}
                itemStyle={{ fontWeight: 700 }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="accuracy"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorAcc)"
                animationDuration={1000}
                name="Accuracy (%)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="loss"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLoss)"
                animationDuration={1000}
                name="Loss"
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Dual Summary Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 border border-border/80 rounded-md transition-all hover:border-primary/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Global Accuracy</span>
            {hasData && data.length > 1 && (
              <TrendingUp size={13} className={accImproved ? 'text-emerald-500' : 'text-error rotate-180'} />
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-text-main tabular-nums">{currentAcc}%</span>
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-text-muted/80 mt-1">
            Institutional Convergence
          </div>
        </div>
        
        <div className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 border border-border/80 rounded-md transition-all hover:border-error/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Training Loss</span>
            {lossData.length > 1 && (
              <TrendingDown size={13} className={lossReduced ? 'text-emerald-500' : 'text-error rotate-180'} />
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-error tabular-nums">{currentLoss}</span>
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-text-muted/80 mt-1">
            Error Minimization
          </div>
        </div>
      </div>
    </div>
  );
};
