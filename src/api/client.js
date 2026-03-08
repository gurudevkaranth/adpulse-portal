import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 30_000,
});

// Inject tenant_id into every request
export function setTenantInterceptor(getTenantId) {
  apiClient.interceptors.request.use((config) => {
    const tenantId = getTenantId();
    if (tenantId) {
      config.params = { ...config.params, tenant_id: tenantId };
    }
    return config;
  });
}

// Handle 401 — redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
