import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../auth/useAuth';
import apiClient, { setTenantInterceptor } from '../api/client';
import { TenantContext } from './TenantContext';

export default function TenantProvider({ children }) {
  const { user, isOTBStaff, isAgencyUser } = useAuth();

  const [selectedTenant, setSelectedTenant] = useState(
    () => localStorage.getItem('selectedTenant') || ''
  );
  const [allTenants, setAllTenants] = useState([]);

  // Resolve available tenants based on user type
  const availableTenants = useMemo(() => {
    if (isOTBStaff) return allTenants;
    if (isAgencyUser && user?.agencies) {
      return user.agencies.flatMap((a) =>
        (a.brands || []).map((b) => ({
          tenant_id: b.tenant,
          name: b.name || b.tenant,
        }))
      );
    }
    if (user?.tenant_id) {
      return [{ tenant_id: user.tenant_id, name: user.tenant_id }];
    }
    return [];
  }, [isOTBStaff, isAgencyUser, user, allTenants]);

  // Derive effective tenantId: explicit selection > user default > first available
  const tenantId = useMemo(() => {
    if (selectedTenant) return selectedTenant;
    if (!isOTBStaff && user?.tenant_id) return user.tenant_id;
    if (availableTenants.length > 0) return availableTenants[0].tenant_id;
    return '';
  }, [selectedTenant, isOTBStaff, user, availableTenants]);

  // Fetch all tenants for OTB staff
  useEffect(() => {
    if (isOTBStaff) {
      apiClient
        .get('/v1/tenants')
        .then(({ data }) => setAllTenants(data.tenants || data))
        .catch(() => {});
    }
  }, [isOTBStaff]);

  const setTenantId = useCallback((id) => {
    setSelectedTenant(id);
    localStorage.setItem('selectedTenant', id);
  }, []);

  // Wire up the axios interceptor
  const tenantRef = useRef(tenantId);

  useEffect(() => {
    tenantRef.current = tenantId;
  }, [tenantId]);

  useEffect(() => {
    setTenantInterceptor(() => tenantRef.current);
  }, []);

  const value = {
    tenantId,
    setTenantId,
    availableTenants,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}
