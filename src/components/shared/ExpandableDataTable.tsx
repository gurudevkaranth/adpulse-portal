import { useState, type ReactNode } from 'react';
import { ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Info, Search, Download } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  info?: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

interface DataRow {
  id: string;
  name?: string;
  type?: string;
  children?: DataRow[];
  adCount?: number;
  [key: string]: unknown;
}

interface ExpandableDataTableProps {
  columns: Column[];
  data: DataRow[];
  onRowClick?: (row: DataRow) => void;
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
}

export default function ExpandableDataTable({
  columns,
  data,
  onRowClick,
  title,
  subtitle,
  headerRight,
}: ExpandableDataTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const getValue = (row: DataRow, key: string): unknown => {
    if (key.includes('.')) {
      return key.split('.').reduce((o: unknown, k: string) => (o as Record<string, unknown>)?.[k], row);
    }
    return row[key];
  };

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = (getValue(a, sortKey) as number) ?? 0;
        const bVal = (getValue(b, sortKey) as number) ?? 0;
        return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
      })
    : data;

  const filteredData = searchQuery
    ? sortedData.filter(row => row.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : sortedData;

  const renderRow = (row: DataRow, level = 0): ReactNode => {
    const hasChildren = row.children && row.children.length > 0;
    const isExpanded = expanded.has(row.id);
    const isAd = row.type !== 'campaign' && row.type !== 'adSet' && row.type !== 'landingPage';

    return (
      <tbody key={row.id}>
        <tr
          className={`border-b border-border-light hover:bg-gray-50/80 transition-colors ${
            isAd ? 'cursor-pointer' : ''
          }`}
          onClick={() => {
            if (isAd && onRowClick) onRowClick(row);
            else if (hasChildren) toggleExpand(row.id);
          }}
        >
          {columns.map((col, ci) => (
            <td
              key={col.key}
              className={`py-3 px-4 text-sm ${
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
              }`}
            >
              {ci === 0 ? (
                <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
                  {hasChildren ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpand(row.id); }}
                      className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                    >
                      <ChevronRight className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  ) : (
                    <span className="w-5" />
                  )}
                  {col.render ? col.render(getValue(row, col.key), row as unknown as Record<string, unknown>) : (
                    <span className="font-medium text-text-primary">{getValue(row, col.key) as ReactNode}</span>
                  )}
                  {row.adCount !== undefined && (
                    <span className="text-xs text-text-tertiary ml-1">{row.adCount}</span>
                  )}
                </div>
              ) : (
                col.render ? col.render(getValue(row, col.key), row as unknown as Record<string, unknown>) : (
                  <span className="font-medium text-text-primary">{getValue(row, col.key) as ReactNode}</span>
                )
              )}
            </td>
          ))}
        </tr>
        {hasChildren && isExpanded && row.children!.map(child => renderRow(child, level + 1))}
      </tbody>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Table header area */}
      {(title || headerRight) && (
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-text-primary">{title}</h3>}
            {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-surface-tertiary rounded-lg border-0 w-48 focus:outline-none focus:ring-2 focus:ring-primary-500/20 placeholder:text-text-tertiary"
              />
            </div>
            {/* Download */}
            <button className="p-2 hover:bg-gray-100 rounded-lg text-text-tertiary hover:text-text-primary transition-colors">
              <Download className="w-4 h-4" />
            </button>
            {headerRight}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`py-2.5 px-4 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''}`}>
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1 hover:text-text-secondary transition-colors"
                      >
                        <span>{col.label}</span>
                        {sortKey === col.key ? (
                          sortDir === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      <span>{col.label}</span>
                    )}
                    {col.info && (
                      <span className="relative group">
                        <Info className="w-3 h-3 opacity-50 cursor-help" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {col.info}
                        </span>
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {filteredData.map(row => renderRow(row))}
        </table>
      </div>
    </div>
  );
}
