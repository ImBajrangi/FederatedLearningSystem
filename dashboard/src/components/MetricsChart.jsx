import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity } from 'lucide-react';

export const MetricsChart = ({ data }) => {
  // Map raw floats to charted objects. If empty, show a zero-baseline.
  const chartData = data.length > 0 
    ? data.map((val, index) => ({
        round: index + 1, // Start labelling from Round 1
        accuracy: val * 100,
      }))
    : [{ round: 0, accuracy: 0 }];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Activity size={13} className="text-primary/70" />
          <h3 className="type-l3 text-text-main tracking-tight">
            Institutional Training Analysis
          </h3>
        </div>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1 font-mono">
          Institutional Accuracy Curve (Global)
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-50 border border-emerald-100/50 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest tabular-nums">
              {(data?.length ? data[data.length - 1] * 100 : 0).toFixed(1)}% Accuracy
            </span>
          </div>
        </div>
      </div>

      <div className="h-[240px] w-full min-h-[240px] relative overflow-hidden" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="99%" height="100%" debounce={50}>
          <AreaChart
            data={chartData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            aspect={2.5}
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
          <div className="flex flex-col gap-3">
            <span className="type-label text-text-muted opacity-70">Model Accuracy</span>
            <span className="type-l2 sans text-text-main tabular-nums">
               {(data?.length ? data[data.length - 1] * 100 : 0).toFixed(1)}%
            </span>
          </div>
          <div className={`text-[10px] font-bold uppercase tracking-widest mt-4 ${data?.length > 1 ? (data[data.length - 1] >= data[data.length - 2] ? 'text-emerald-600' : 'text-error') : 'text-text-muted'}`}>
            Institutional Progress
          </div>
        </div>
        <div className="p-6 bg-white border border-border shadow-sm">
          <span className="type-label text-text-muted opacity-70 block mb-3">
            Privacy Budget (DP)
            <div className="flex items-center gap-4 opacity-40">
              <span className="type-label tabular-nums">01</span>
              <span className="type-label">PENDING VALIDATION</span>
            </div>
          </span>
          <div className="flex items-center justify-between">
            <span className="type-l2 sans text-primary tabular-nums">
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
