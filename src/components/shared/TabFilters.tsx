interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabFiltersProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
}

export default function TabFilters({ tabs, activeTab, onChange }: TabFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            activeTab === tab.key
              ? 'border-border bg-white shadow-sm text-text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1 ${activeTab === tab.key ? 'text-text-secondary' : 'text-text-tertiary'}`}>
              ({tab.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
