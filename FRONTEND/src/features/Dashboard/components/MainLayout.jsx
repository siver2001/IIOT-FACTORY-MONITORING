// src/components/MainLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Space, theme, message } from 'antd';
import { 
    AreaChartOutlined, 
    SettingOutlined, 
    UserOutlined, 
    AlertOutlined, 
    LogoutOutlined, 
    DashboardOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const items = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan Real-time' },
    { key: '/analytics/kpi', icon: <AreaChartOutlined />, label: 'Phân tích OEE/KPIs' },
    { key: '/alerts', icon: <AlertOutlined />, label: 'Quản lý Cảnh báo & Log' },
    { key: 'management', icon: <SettingOutlined />, label: 'Quản lý Hệ thống', children: [
        { key: '/management/machines', label: 'Cấu hình Máy' },
        { key: '/management/users', label: 'Quản lý Người dùng' },
    ]},
];

const MainLayout = () => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    
    // Lấy token và vai trò (từ giả lập login)
    const userRole = localStorage.getItem('userRole') || 'Guest';

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const handleMenuClick = (e) => {
        // Điều hướng bằng react-router-dom
        navigate(e.key); 
    };

    const handleLogout = () => {
        // Xóa token và redirect về trang đăng nhập
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        message.success('Đăng xuất thành công!');
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider 
                collapsible 
                collapsed={collapsed} 
                onCollapse={(value) => setCollapsed(value)}
                breakpoint="lg" // Tự động thu gọn trên màn hình nhỏ
                collapsedWidth="80"
                width={250}
            >
                {/* Logo Section */}
                <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', color: '#fff', fontSize: collapsed ? 0 : 20, fontWeight: 'bold', overflow: 'hidden' }}>
                    IIoT FACTORY
                </div>
                
                {/* Menu Điều hướng */}
                <Menu 
                    theme="dark" 
                    defaultSelectedKeys={['/dashboard']} 
                    mode="inline" 
                    items={items} 
                    onClick={handleMenuClick} 
                />
            </Sider>
            
            <Layout>
                {/* Header Section */}
                <Header style={{ 
                    padding: 0, 
                    background: colorBgContainer, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingRight: 24 
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    
                    {/* Thông tin User và Đăng xuất */}
                    <Space size="large">
                        <Text strong>Role: {userRole}</Text>
                        <Button 
                            type="text" 
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                        >
                            Đăng xuất
                        </Button>
                    </Space>
                </Header>
                
                {/* Content Section (Nội dung chính) */}
                <Content style={{ margin: '24px 16px' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: 8,
                        }}
                    >
                        {/* Đây là nơi các trang con sẽ được render (DashboardPage, Analytics,...) */}
                        <Outlet />
                    </div>
                </Content>
                
                {/* Footer Section (Tùy chọn) */}
                <Layout.Footer style={{ textAlign: 'center' }}>
                    IIoT Factory Monitoring System ©2024 Created by [Your Name/Company]
                </Layout.Footer>
            </Layout>
        </Layout>
    );
};

export default MainLayout;