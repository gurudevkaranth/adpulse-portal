const GRADES = [
  { grade: 'A', color: 'bg-green-500' },
  { grade: 'B', color: 'bg-blue-500' },
  { grade: 'C', color: 'bg-amber-500' },
  { grade: 'D', color: 'bg-red-500' },
];

export default function GradeLegend() {
  return (
    <div className="flex items-center gap-2 text-xs text-text-tertiary">
      <span className="font-medium">Performance Grades:</span>
      {GRADES.map(({ grade, color }) => (
        <div
          key={grade}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${color}`}
        >
          {grade}
        </div>
      ))}
    </div>
  );
}
