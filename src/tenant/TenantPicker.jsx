import { useState, useMemo } from 'react';
import { Search, Building2 } from 'lucide-react';
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
      <h1 className="text-2xl font-bold text-text-primary mb-1">
        Select Customer
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        Choose a tenant to view their analytics
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers..."
          className="w-full rounded-lg border border-border bg-surface-tertiary py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-300 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        />
      </div>

      {/* Tenant list */}
      <div className="space-y-1">
        {filtered.map((t) => (
          <button
            key={t.tenant_id}
            onClick={() => setTenantId(t.tenant_id)}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
              t.tenant_id === tenantId
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-text-secondary hover:bg-surface-tertiary'
            }`}
          >
            <Building2 className="h-5 w-5 shrink-0" />
            <div>
              <div className="text-sm font-medium">{t.name || t.tenant_id}</div>
              {t.name && t.name !== t.tenant_id && (
                <div className="text-xs text-text-tertiary">{t.tenant_id}</div>
              )}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-text-tertiary">
            No customers found
          </p>
        )}
      </div>
    </div>
  );
}
