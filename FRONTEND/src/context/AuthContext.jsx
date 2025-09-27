// File: FRONTEND/src/context/AuthContext.jsx

import React, { createContext, useContext, useState } from 'react';

// Tạo Context
const AuthContext = createContext(null);

// Custom Hook để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider Component
export const AuthProvider = ({ children }) => {
    // Lấy trạng thái ban đầu từ localStorage
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('jwtToken'));

    // Hàm Đăng nhập
    const login = (token, role) => {
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('username', role === 'Admin' ? 'admin_factory' : 'user');
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

    const value = {
        isAuthenticated,
        login,
        logout,
        userRole: localStorage.getItem('userRole'),
        username: localStorage.getItem('username') || 'Guest' 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};