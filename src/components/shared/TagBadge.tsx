const colorMap: Record<string, string> = {
  hook: 'bg-purple-50 text-purple-700 border-purple-200',
  cta: 'bg-blue-50 text-blue-700 border-blue-200',
  tone: 'bg-amber-50 text-amber-700 border-amber-200',
  visual: 'bg-teal-50 text-teal-700 border-teal-200',
};

interface TagBadgeProps {
  type: string;
  value: string;
}

export default function TagBadge({ type, value }: TagBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${colorMap[type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {value}
    </span>
  );
}
