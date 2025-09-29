// FRONTEND/src/components/GlobalMessageProvider.jsx

import React from 'react';
import { App } from 'antd';

// Global singleton to hold the message instance
export const messageInstance = {};

/**
 * Component để lưu trữ dynamic message instance vào global singleton.
 */
const GlobalMessageProvider = () => {
    // Lấy context từ Antd App wrapper
    const staticFns = App.useApp();
    
    // Lưu instance message vào singleton khi component mount
    React.useEffect(() => {
        messageInstance.message = staticFns.message;
    }, [staticFns.message]); 

    return null; 
};

export default GlobalMessageProvider;