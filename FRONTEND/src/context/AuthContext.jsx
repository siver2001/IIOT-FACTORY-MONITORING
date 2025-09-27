import React, { createContext, useContext, useState } from 'react';
import { message } from 'antd';

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
        setIsAuthenticated(true);
    };

    // Hàm Đăng xuất
    const logout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
        message.info('Bạn đã đăng xuất.');
    };

    const value = {
        isAuthenticated,
        login,
        logout,
        userRole: localStorage.getItem('userRole'),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};