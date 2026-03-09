import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verify = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/v1/auth/verify');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verify();
  }, [verify]);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isOTBStaff: user?.tenant_id === 'outoftheblue',
    isAgencyUser: user?.is_agency_user === true,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
