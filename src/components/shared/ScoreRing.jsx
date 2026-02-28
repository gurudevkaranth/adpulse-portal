import { getScoreColor } from '../../data/mockData';

export default function ScoreRing({ score, size = 48, strokeWidth = 4, label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ animation: 'score-fill 1s ease-out', transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color }}
        >
          {score}
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}
