import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // <-- Thêm Navigate
import MainLayout from './features/Layout/MainLayout';
import LoginPage from './features/Auth/LoginPage';
import DashboardPage from './features/Dashboard/DashboardPage';
import MachineStatus from './features/Dashboard/MachineStatus'; 
import OEECalculator from './features/Dashboard/OEECalculator';
import UserManagement from './Admin/UserManagement';
import { useAuth } from './context/AuthContext.jsx'; 

// Giao diện Mock cho các trang chức năng khác
const DefaultPage = ({ title }) => <div style={{ padding: 24 }}><h2>{title} đang được phát triển...</h2><p>Dữ liệu real-time vẫn đang chạy ngầm.</p></div>;

// Component Wrapper để bảo vệ route
const ProtectedRoute = ({ element: Component }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? Component : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated, logout } = useAuth(); // <-- SỬ DỤNG CONTEXT

  return (
    <Router>
      <Routes>
        
        {/* Route Đăng nhập */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        
        {/* Route Chính (Protected) */}
        <Route path="/" element={<ProtectedRoute element={<MainLayout />} />}>
          {/* Dashboard Chính */}
          <Route index element={<DashboardPage />} />

          {/* Monitoring Routes */}
          <Route path="production/status" element={<MachineStatus />} />
          <Route path="production/logs" element={<DefaultPage title="Lịch sử Vận hành (Data Historian)" />} />

          {/* KPI Analytics Routes */}
          <Route path="kpi/oee" element={<OEECalculator />} />
          <Route path="kpi/mtbf" element={<DefaultPage title="Phân tích MTBF/MTTR" />} />
          <Route path="kpi/quality" element={<DefaultPage title="Phân tích Chất lượng" />} />
          
          {/* Alert & Admin Routes */}
          <Route path="alerts" element={<DefaultPage title="Quản lý Cảnh báo Chi tiết" />} />
          <Route path="admin/users" element={<UserManagement />} />
          <Route path="admin/config" element={<DefaultPage title="Cấu hình Thiết bị & Tags" />} />
          
          {/* Fallback Route */}
          <Route path="*" element={<DefaultPage title="404 - Trang không tồn tại" />} />
        </Route>
        
        {/* Chuyển hướng các đường dẫn không hợp lệ hoặc chưa đăng nhập */}
        <Route path="*" element={isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;