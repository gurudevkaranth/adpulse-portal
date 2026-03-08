import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './auth/AuthProvider';
import TenantProvider from './tenant/TenantProvider';
import RequireAuth from './auth/RequireAuth';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import CreativeDetail from './pages/CreativeDetail';
import AICopilot from './pages/AICopilot';
import AcquisitionPage from './pages/AcquisitionPage';
import ConversionPage from './pages/ConversionPage';
import Login from './pages/Login';
import TenantPicker from './tenant/TenantPicker';
import ErrorBoundary from './components/shared/ErrorBoundary';

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <AuthProvider>
        <TenantProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<TenantPicker />} />
              {/* Analyze section */}
              <Route path="analyze/acquisition" element={<AcquisitionPage />} />
              <Route path="analyze/conversion" element={<ConversionPage />} />
              {/* Creative detail */}
              <Route path="creatives/:id" element={<CreativeDetail />} />
              {/* AI Copilot */}
              <Route path="copilot" element={<AICopilot />} />
              {/* Redirects from old standalone routes */}
              <Route path="creatives" element={<Navigate to="/analyze/acquisition?tab=creatives" replace />} />
              <Route path="top-performers" element={<Navigate to="/analyze/acquisition?tab=topPerformers" replace />} />
              <Route path="comparative" element={<Navigate to="/analyze/acquisition?tab=comparative" replace />} />
            </Route>
          </Routes>
        </TenantProvider>
      </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
