import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export const MetricsChart = ({ data }) => {
  const chartData = data.map((val, index) => ({
    round: index,
    accuracy: val * 100,
  }));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <div>
          <h3 className="text-xl font-bold text-text-main tracking-tight serif">
            Convergence Analysis
          </h3>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1 font-mono">
            Institutional Accuracy Curve (Global)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-50 border border-emerald-100/50 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest tabular-nums">
              {(data?.length ? data[data.length - 1] * 100 : 0).toFixed(1)}% Accuracy
            </span>
          </div>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={chartData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis
              dataKey="round"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontWeight: 600, fontFamily: 'monospace' }}
              dy={10}
            />
            <YAxis
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontWeight: 600, fontFamily: 'monospace' }}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '0px',
                fontSize: '11px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontFamily: 'monospace'
              }}
              labelStyle={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}
              itemStyle={{ color: 'var(--primary)', fontWeight: 700 }}
            />
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="var(--primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAcc)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-10">
        <div className="p-6 bg-white border border-border shadow-sm">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-3 font-mono">
            Validation Yield
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-text-main tabular-nums serif">
              {data?.length > 1 ? (data[data.length - 1] >= data[data.length - 2] ? '↑ ' : '↓ ') : ''}
              {(data?.length ? data[data.length - 1] * 100 : 0).toFixed(1)}%
            </span>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${data?.length > 1 ? (data[data.length - 1] >= data[data.length - 2] ? 'text-emerald-600' : 'text-error') : 'text-text-muted'}`}>
              Institutional Progress
            </div>
          </div>
        </div>
        <div className="p-6 bg-white border border-border shadow-sm">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-3 font-mono">
            Privacy Budget (DP)
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary tabular-nums serif">
              ε=1.2
            </span>
            <div className="px-2 py-0.5 border border-primary/20 bg-primary/5 text-[9px] font-bold text-primary uppercase tracking-widest">
              Secured
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
