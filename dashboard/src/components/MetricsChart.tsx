import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface MetricsChartProps {
  data: number[];
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ data }) => {
  const chartData = data.map((val, index) => ({
    round: index,
    accuracy: val * 100,
  }));

  return (
    <div
      className="glass rounded-sm"
      style={{
        width: '100%',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Metric Convergence
          </h3>
          <p className="font-mono uppercase tracking-widest text-muted" style={{ fontSize: '10px', marginTop: '4px', fontWeight: 700 }}>
            Model Accuracy Curve
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="rounded-full"
              style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary)' }}
            />
            <span className="font-mono text-muted uppercase tracking-widest font-bold" style={{ fontSize: '10px' }}>
              Current: {(data[data.length - 1] * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#13ec49" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#13ec49" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis
              dataKey="round"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8' }}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#050505',
                border: '1px solid #1e293b',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'Space Grotesk'
              }}
              labelStyle={{ color: '#13ec49' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="#13ec49"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAcc)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-3" style={{ marginTop: '24px' }}>
        <h4 className="font-mono font-bold text-muted uppercase tracking-widest" style={{ fontSize: '10px' }}>
          Consensus Analytics
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}
        >
          <div className="rounded-sm border" style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="text-muted font-bold uppercase tracking-wider block mb-1" style={{ fontSize: '10px', display: 'block', marginBottom: '4px' }}>
              Validation Pass Rate
            </span>
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              {data.length > 1 ? (data[data.length - 1] > data[data.length - 2] ? '↑' : '↓') : ''}
              {((1 - (data[data.length - 1] / 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="rounded-sm border" style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="text-muted font-bold uppercase tracking-wider block mb-1" style={{ fontSize: '10px', display: 'block', marginBottom: '4px' }}>
              Privacy Budget Spent
            </span>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--warning)' }}>
              ε=0.42
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
