// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Layouts và Pages
import MainLayout from './components/MainLayout'; // Import component Layout chính
import LoginPage from './features/Auth/LoginPage'; // Import trang Đăng nhập
import DashboardPage from './features/Dashboard/DashboardPage'; // Import Dashboard đã có

// Thư viện cần thiết
import { Spin } from 'antd'; // Dùng cho trạng thái tải

// *************** COMPONENT BẢO VỆ ROUTE (PROTECTED ROUTE) ***************
// Component này kiểm tra xem người dùng đã đăng nhập (có JWT token) hay chưa
const ProtectedRoute = ({ children }) => {
    // 1. Kiểm tra JWT Token trong localStorage
    const isAuthenticated = localStorage.getItem('jwtToken'); 
    
    if (!isAuthenticated) {
        // Nếu không có token, điều hướng về trang đăng nhập
        return <Navigate to="/login" replace />;
    }

    // Tùy chọn: Thêm logic kiểm tra tính hợp lệ của token (expire time) tại đây
    
    // Nếu có token, cho phép truy cập nội dung
    return children;
};
// ************************************************************************


const App = () => (
    <BrowserRouter>
        <Routes>
            {/* 1. Route Đăng nhập (Công khai) */}
            <Route path="/login" element={<LoginPage />} />

            {/* 2. Route Chính (Yêu cầu đăng nhập) */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                {/* Trang mặc định sau khi đăng nhập: Điều hướng đến Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} /> 

                {/* Các Route con bên trong MainLayout */}
                <Route path="dashboard" element={<DashboardPage />} /> 
                <Route path="analytics/kpi" element={<h2>Trang Phân tích KPIs</h2>} />
                <Route path="alerts" element={<h2>Trang Quản lý Cảnh báo</h2>} />
                <Route path="management/machines" element={<h2>Trang Cấu hình Máy</h2>} />
                <Route path="management/users" element={<h2>Trang Quản lý Người dùng</h2>} />
            </Route>
            
            {/* 3. Redirect tất cả các path không khớp về trang đăng nhập */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    </BrowserRouter>
);

export default App;