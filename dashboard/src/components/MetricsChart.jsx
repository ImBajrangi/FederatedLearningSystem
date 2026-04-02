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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">
            Convergence analysis
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Institutional accuracy curve (Global)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              {(data[data.length - 1] * 100).toFixed(1)}% Accuracy
            </span>
          </div>
        </div>
      </div>

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="round"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontWeight: 600 }}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: '#64748b', fontWeight: 700, marginBottom: '4px' }}
              itemStyle={{ color: '#4f46e5', fontWeight: 700 }}
            />
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="#4f46e5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAcc)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Validation yield
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-800">
              {data.length > 1 ? (data[data.length - 1] > data[data.length - 2] ? '↑' : '↓') : ''}
              {((data[data.length - 1] / 1) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-100">
          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
            Privacy budget
          </span>
          <span className="text-xl font-bold text-indigo-600">
            ε=1.2
          </span>
        </div>
      </div>
    </div>
  );
};
