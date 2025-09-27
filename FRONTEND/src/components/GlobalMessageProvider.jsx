import React from 'react';
import { App } from 'antd';

// Global singleton to hold the message instance
export const messageInstance = {};

/**
 * Component để lưu trữ dynamic message instance vào global singleton.
 */
const GlobalMessageProvider = () => {
    const staticFns = App.useApp();
    
    React.useEffect(() => {
        messageInstance.message = staticFns.message;
    }, [staticFns.message]); 

    return null; 
};

export default GlobalMessageProvider;