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

// Component Wrapper để bảo vệ route
const ProtectedRoute = ({ element: Component }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? Component : <Navigate to="/login" replace />;
};

function App() {
    const { isAuthenticated, logout } = useAuth(); 

    return (
        <Router>
            <Routes>
                
                {/* Route Đăng nhập */}
                <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
                
                {/* Route Chính (Protected) */}
                <Route path="/" element={<ProtectedRoute element={<MainLayout />} />}>
                    {/* Dashboard Chính */}
                    <Route index element={<DashboardPage />} />

                    {/* Monitoring & Production Routes */}
                    <Route path="production/status" element={<MachineStatus />} />
                    <Route path="production/logs" element={<OperationHistoryPage />} /> 
                    <Route path="production/batch" element={<BatchControl />} /> 
                    
                    {/* Module Bảo trì */}
                    <Route path="maintenance">
                        <Route path="dashboard" element={<MaintenanceDashboardPage />} /> 
                        <Route path="work-orders" element={<WorkOrderManagementPage />} />
                        <Route path="inventory" element={<SparePartsInventoryPage />} /> 
                        {/* Đã xóa route: <Route path="purchase-request" element={<PurchaseRequestPage />} /> */}
                        <Route path="calendar" element={<MaintenanceCalendarPage />} />
                        <Route path="profile/:id" element={<MachineProfilePage />} />
                    </Route>

                    {/* KPI Analytics Routes */}
                    <Route path="kpi/oee" element={<OEECalculator />} />
                    <Route path="kpi/mtbf" element={<ReliabilityAnalysisPage />} /> 
                    <Route path="kpi/quality" element={<QualityAnalysisPage />} /> 
                    
                    {/* Alert Routes */}
                    <Route path="alerts">
                        <Route index element={<AlertManagementPage />} />
                        <Route path="knowledge-base" element={<FaultKnowledgeBasePage />} /> 
                    </Route>
                    
                    {/* NHÓM CÁC ROUTE ADMIN */}
                    <Route path="admin">
                        <Route path="users" element={<UserManagement />} />
                        <Route path="config" element={<DeviceConfigPage />} />
                        <Route path="assets" element={<AssetManagementPage />} />
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