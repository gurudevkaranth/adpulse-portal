import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CHANNEL_COLORS = ['#ef4444', '#f97316', '#64748b', '#3b82f6', '#22c55e', '#8b5cf6'];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-border p-3 text-xs">
      <div className="font-medium text-text-primary mb-1">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-medium text-text-primary">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ChannelsTab({ channelChart }) {
  return (
    <div className="grid grid-cols-3 gap-5">
      {/* Stacked Area Chart */}
      <div className="col-span-2 bg-white rounded-xl border border-border p-5">
        <h3 className="text-base font-semibold text-text-primary mb-4">Revenue by Channel</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={channelChart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} />
            {channelChart.channels.map((ch, i) => (
              <Area
                key={ch}
                type="monotone"
                dataKey={ch}
                stackId="1"
                stroke={CHANNEL_COLORS[i]}
                fill={CHANNEL_COLORS[i]}
                fillOpacity={0.3}
                strokeWidth={1.5}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {channelChart.channels.map((ch, i) => (
            <div key={ch} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHANNEL_COLORS[i] }} />
              {ch}
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Distribution */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Revenue Distribution</h3>
        <div className="space-y-3">
          {channelChart.channels.map((ch, i) => {
            const total = channelChart.data.reduce((s, d) => s + (d[ch] || 0), 0);
            const grandTotal = channelChart.channels.reduce((s, c) => s + channelChart.data.reduce((ss, d) => ss + (d[c] || 0), 0), 0);
            const pct = ((total / grandTotal) * 100).toFixed(1);
            return (
              <div key={ch} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHANNEL_COLORS[i] }} />
                  <span className="text-sm text-text-primary">{ch}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-text-secondary">{formatCurrency(total)}</span>
                  <span className="font-medium text-text-primary w-10 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-border-light">
          <div className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold">Total Performance</div>
          <div className="text-xl font-bold text-text-primary mt-1">
            {formatCurrency(channelChart.channels.reduce((s, c) => s + channelChart.data.reduce((ss, d) => ss + (d[c] || 0), 0), 0))}
          </div>
        </div>
      </div>
    </div>
  );
}
