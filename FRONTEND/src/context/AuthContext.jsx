// FRONTEND/src/context/AuthContext.jsx

import React, { createContext, useContext, useState } from 'react';

// Tạo Context
const AuthContext = createContext(null);

// Custom Hook để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider Component
export const AuthProvider = ({ children }) => {
    // Lấy trạng thái ban đầu từ localStorage
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('jwtToken'));
    
    // HÀM MỚI: Lấy cấp độ quyền hạn (giá trị số)
    const getRoleLevel = (role) => {
        switch (role) {
            case 'Admin': return 0;
            case 'Manager': return 1;
            case 'Supervisor': return 2;
            case 'User': return 3;
            default: return 99; // Khách
        }
    };

    // Hàm Đăng nhập
    const login = (token, role) => {
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('userRole', role);
        // Map user login to a simplified role/username for display/mocking
        localStorage.setItem('username', role === 'Admin' ? 'admin_root' : (role === 'Manager' ? 'manager_a' : (role === 'Supervisor' ? 'supervisor_b' : 'user_line_c')));
        setIsAuthenticated(true);
    };

    // Hàm Đăng xuất
    const logout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        setIsAuthenticated(false);
        // Lời gọi message.info() đã được di chuyển ra khỏi đây
    };
    
    const userRole = localStorage.getItem('userRole');

    const value = {
        isAuthenticated,
        login,
        logout,
        userRole: userRole,
        username: localStorage.getItem('username') || 'Guest',
        roleLevel: getRoleLevel(userRole), // EXPORT ROLE LEVEL
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};