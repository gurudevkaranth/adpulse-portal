import { useState, useMemo } from 'react';
import { Search, Building2, ChevronRight, Users } from 'lucide-react';
import { useTenant } from './useTenant';

export default function TenantPicker() {
  const { availableTenants, tenantId, setTenantId } = useTenant();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return availableTenants;
    const q = query.toLowerCase();
    return availableTenants.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.tenant_id?.toLowerCase().includes(q)
    );
  }, [availableTenants, query]);

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
          <Users className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Select Customer
          </h1>
          <p className="text-sm text-text-secondary">
            Choose a tenant to view their analytics
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers..."
          className="w-full rounded-xl border border-border bg-surface-tertiary py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-150"
          autoFocus
        />
      </div>

      {/* Count */}
      <div className="text-xs text-text-tertiary mb-2 px-1">
        {filtered.length} {filtered.length === 1 ? 'customer' : 'customers'}
        {query && ` matching "${query}"`}
      </div>

      {/* Tenant list */}
      <div className="space-y-1 rounded-xl border border-border bg-white overflow-hidden">
        {filtered.map((t) => {
          const isSelected = t.tenant_id === tenantId;
          return (
            <button
              key={t.tenant_id}
              onClick={() => setTenantId(t.tenant_id)}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 group ${
                isSelected
                  ? 'bg-primary-50 border-l-[3px] border-l-primary-500'
                  : 'hover:bg-surface-tertiary border-l-[3px] border-l-transparent'
              }`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 text-sm font-bold ${
                isSelected
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-tertiary text-text-secondary group-hover:bg-primary-100 group-hover:text-primary-700'
              } transition-colors duration-150`}>
                {(t.name || t.tenant_id).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${
                  isSelected ? 'text-primary-700' : 'text-text-primary'
                }`}>
                  {t.name || t.tenant_id}
                </div>
                {t.name && t.name !== t.tenant_id && (
                  <div className="text-xs text-text-tertiary truncate">{t.tenant_id}</div>
                )}
              </div>
              <ChevronRight className={`h-4 w-4 shrink-0 transition-all duration-150 ${
                isSelected
                  ? 'text-primary-500 opacity-100'
                  : 'text-text-tertiary opacity-0 group-hover:opacity-100'
              }`} />
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Building2 className="h-8 w-8 text-text-tertiary mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-text-secondary">No customers found</p>
            <p className="text-xs text-text-tertiary mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
