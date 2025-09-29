// FRONTEND/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import MainLayout from './features/Layout/MainLayout';
import LoginPage from './features/Auth/LoginPage';
import DashboardPage from './features/Dashboard/DashboardPage';
import MachineStatus from './features/Dashboard/MachineStatus'; 
import OEECalculator from './features/Dashboard/OEECalculator';
import OperationHistoryPage from './features/Production/OperationHistoryPage'; 
import BatchControl from './features/Production/BatchControl';
import ReliabilityAnalysisPage from './features/KPI/ReliabilityAnalysisPage'; 
import QualityAnalysisPage from './features/KPI/QualityAnalysisPage'; 
import AlertManagementPage from './features/Alerts/AlertManagementPage'; 
import FaultKnowledgeBasePage from './features/Alerts/FaultKnowledgeBasePage'; 

// Import trang quản lý Mã Lỗi mới
import FaultCatalogManagementPage from './features/Alerts/FaultCatalogManagementPage'; 

import UserManagement from './Admin/UserManagement';
import AssetManagementPage from './Admin/AssetManagementPage'; 
import DeviceConfigPage from './Admin/DeviceConfig/DeviceConfigPage'; 
// Import các trang Bảo trì
import WorkOrderManagementPage from './maintenance/WorkOrderManagementPage';
import MaintenanceCalendarPage from './maintenance/MaintenanceCalendarPage';
import MaintenanceDashboardPage from './maintenance/MaintenanceDashboardPage';
import SparePartsInventoryPage from './maintenance/SparePartsInventoryPage'; 
import MachineProfilePage from './maintenance/MachineProfilePage'; 
import { useAuth } from './context/AuthContext.jsx'; 

// Giao diện Mock cho các trang chức năng khác
const DefaultPage = ({ title }) => <div style={{ padding: 24 }}><h2>{title} đang được phát triển...</h2><p>Dữ liệu real-time vẫn đang chạy ngầm.</p></div>;

/**
 * Component Wrapper để bảo vệ route
 * @param {object} props 
 * @param {React.Element} props.element Component để render
 * @param {number} [props.minLevel=99] Cấp độ quyền hạn tối đa được phép truy cập (0 là cao nhất)
 */

// Component Wrapper để bảo vệ route
const ProtectedRoute = ({ element: Component, minLevel = 99 }) => {
    const { isAuthenticated, roleLevel } = useAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Kiểm tra quyền hạn: Nếu roleLevel (ví dụ: User là 3) lớn hơn minLevel (ví dụ: Admin page là 0), thì không cho phép.
    if (roleLevel > minLevel) {
        return <DefaultPage title={`Lỗi 403 - Bạn không có quyền truy cập (Cấp độ: ${roleLevel})`} />;
    }
    
    return Component;
};

function App() {
    const { isAuthenticated, logout } = useAuth(); 

    return (
        <Router>
            <Routes>
                
                {/* Route Đăng nhập */}
                <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
                
                {/* Route Chính (Protected) */}
                <Route path="/" element={<ProtectedRoute element={<MainLayout />} minLevel={3} />}>
                    {/* Dashboard Chính (Mọi người đều thấy) */}
                    <Route index element={<DashboardPage />} />

                    {/* Monitoring & Production Routes (MIN LEVEL 3) */}
                    <Route path="production/status" element={<ProtectedRoute element={<MachineStatus />} minLevel={3} />} />
                    <Route path="production/logs" element={<ProtectedRoute element={<OperationHistoryPage />} minLevel={3} />} /> 
                    <Route path="production/batch" element={<ProtectedRoute element={<BatchControl />} minLevel={3} />} /> 
                    
                    {/* Module Bảo trì (MIN LEVEL 3) */}
                    <Route path="maintenance">
                        <Route path="dashboard" element={<ProtectedRoute element={<MaintenanceDashboardPage />} minLevel={3} />} /> 
                        <Route path="work-orders" element={<ProtectedRoute element={<WorkOrderManagementPage />} minLevel={3} />} />
                        <Route path="inventory" element={<ProtectedRoute element={<SparePartsInventoryPage />} minLevel={3} />} /> 
                        <Route path="calendar" element={<ProtectedRoute element={<MaintenanceCalendarPage />} minLevel={3} />} />
                        <Route path="profile/:id" element={<ProtectedRoute element={<MachineProfilePage />} minLevel={3} />} />
                    </Route>

                    {/* KPI Analytics Routes (MIN LEVEL 3) */}
                    <Route path="kpi/oee" element={<ProtectedRoute element={<OEECalculator />} minLevel={3} />} />
                    <Route path="kpi/mtbf" element={<ProtectedRoute element={<ReliabilityAnalysisPage />} minLevel={3} />} /> 
                    <Route path="kpi/quality" element={<ProtectedRoute element={<QualityAnalysisPage />} minLevel={3} />} /> 
                    
                    {/* Alert Routes (MIN LEVEL 3) */}
                    <Route path="alerts">
                        <Route index element={<ProtectedRoute element={<AlertManagementPage />} minLevel={3} />} />
                        <Route path="fault-management" element={<ProtectedRoute element={<FaultCatalogManagementPage />} minLevel={1} />} /> 
                        <Route path="knowledge-base" element={<ProtectedRoute element={<FaultKnowledgeBasePage />} minLevel={3} />} /> 
                    </Route>
                    
                    {/* NHÓM CÁC ROUTE ADMIN */}
                    <Route path="admin">
                        {/* QUẢN LÝ USER: CHỈ ADMIN (MIN LEVEL 0) */}
                        <Route path="users" element={<ProtectedRoute element={<UserManagement />} minLevel={0} />} /> 
                        
                        {/* CẤU HÌNH THIẾT BỊ/TÀI SẢN: ADMIN VÀ MANAGER (MIN LEVEL 1) */}
                        <Route path="config" element={<ProtectedRoute element={<DeviceConfigPage />} minLevel={1} />} />
                        <Route path="assets" element={<ProtectedRoute element={<AssetManagementPage />} minLevel={1} />} />
                    </Route>
                    
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