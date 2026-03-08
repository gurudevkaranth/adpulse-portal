import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import CreativeDetail from './pages/CreativeDetail';
import AICopilot from './pages/AICopilot';
import AcquisitionPage from './pages/AcquisitionPage';
import ConversionPage from './pages/ConversionPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          {/* Analyze section */}
          <Route path="analyze/acquisition" element={<AcquisitionPage />} />
          <Route path="analyze/conversion" element={<ConversionPage />} />
          {/* Creative detail (still standalone) */}
          <Route path="creatives/:id" element={<CreativeDetail />} />
          {/* AI Copilot */}
          <Route path="copilot" element={<AICopilot />} />
          {/* Redirects from old standalone routes */}
          <Route path="creatives" element={<Navigate to="/analyze/acquisition?tab=creatives" replace />} />
          <Route path="top-performers" element={<Navigate to="/analyze/acquisition?tab=topPerformers" replace />} />
          <Route path="comparative" element={<Navigate to="/analyze/acquisition?tab=comparative" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
