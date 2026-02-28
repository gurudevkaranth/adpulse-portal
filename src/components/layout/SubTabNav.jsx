export default function SubTabNav({ tabs, activeTab, onChange }) {
  if (!tabs || tabs.length === 0) return null;
  return (
    <div className="flex items-center gap-1">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tab.key
              ? 'bg-white border border-border shadow-sm text-text-primary'
              : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
