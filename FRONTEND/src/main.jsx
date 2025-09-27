import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntdApp } from 'antd'; // <-- IMPORT AntdApp
import App from './App.jsx';
import './index.css'; 
import { AuthProvider } from './context/AuthContext.jsx'; 

// Đảm bảo import Ant Design Styles
import 'antd/dist/reset.css'; 

// Thiết lập theme Ant Design (tùy chọn)
const customTheme = {
  token: {
    colorPrimary: '#0052D9', 
    borderRadius: 6,
  },
  components: {
    Layout: {
      headerBg: '#fff', 
      siderBg: '#001529',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={customTheme}>
      <AntdApp> {}
        <AuthProvider> 
          <App />
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>,
);