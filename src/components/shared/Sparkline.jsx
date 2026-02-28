import { LineChart, Line, ResponsiveContainer } from 'recharts';

const COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#94a3b8',
};

export default function Sparkline({ data, dataKey = 'value', trend = 'neutral', width = 80, height = 30 }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ width, height }} className="inline-block">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={COLORS[trend] || COLORS.neutral}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
