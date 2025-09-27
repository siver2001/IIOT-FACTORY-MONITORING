import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Dropdown, Space, Badge, Avatar } from 'antd';
import { Outlet, Link } from 'react-router-dom';
import { 
    DashboardOutlined, BuildOutlined, AlertOutlined, SettingOutlined, 
    UserOutlined, DownOutlined, BarChartOutlined, ShopOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext.jsx'; // <-- ĐÃ THÊM

const { Header, Content, Sider } = Layout;

// ... (transformMenuItems function, rawMenuItems, factories definitions giữ nguyên)
// Hàm chuyển đổi cấu trúc menu tùy chỉnh sang format 'items' của Ant Design (Giữ nguyên)
const transformMenuItems = (items) => {
    return items.map(item => {
        const menuItem = {
            key: item.key,
            icon: item.icon,
        };

        if (item.children) {
            menuItem.label = item.label;
            menuItem.children = transformMenuItems(item.children);
        } else {
            menuItem.label = <Link to={item.link}>{item.label}</Link>;
        }

        if (item.type === 'divider') {
             return { type: 'divider' };
        }
        
        return menuItem;
    });
};

const rawMenuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard Tổng quan', link: '/' },
    { key: '/production', icon: <BuildOutlined />, label: 'Giám sát Sản xuất', children: [
        { key: '/status', label: 'Trạng thái Máy Live', link: '/production/status' },
        { key: '/logs', label: 'Lịch sử Vận hành', link: '/production/logs' },
    ]},
    { key: '/kpi', icon: <BarChartOutlined />, label: 'Phân tích Hiệu suất', children: [
        { key: '/oee', label: 'OEE Analyzer', link: '/kpi/oee' },
        { key: '/mtbf', label: 'MTBF/MTTR Report', link: '/kpi/mtbf' },
        { key: '/quality', label: 'Phân tích Chất lượng', link: '/kpi/quality' },
    ]},
    { key: '/alerts', icon: <AlertOutlined />, label: 'Quản lý Cảnh báo', link: '/alerts' },
    { key: '/admin', icon: <SettingOutlined />, label: 'Quản trị Hệ thống', children: [
        { key: '/admin/users', label: 'Quản lý Tài khoản', link: '/admin/users' },
        { key: '/admin/config', label: 'Cấu hình Thiết bị', link: '/admin/config' },
    ]},
];

const factories = [
    { key: 'F01', label: 'Nhà máy Sản xuất A' },
    { key: 'F02', label: 'Nhà máy Lắp ráp B' },
];


const MainLayout = () => { // <-- XÓA PROP onLogout
    const { logout } = useAuth(); // <-- SỬ DỤNG CONTEXT
    const [collapsed, setCollapsed] = useState(false);
    const [currentFactory, setCurrentFactory] = useState(factories[0]);
    // Sử dụng useToken hook của Antd để lấy các giá trị theme
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken(); 
    
    // Chuyển đổi Menu sidebar
    const sidebarMenuItems = React.useMemo(() => transformMenuItems(rawMenuItems), []);

    // Mock Notifications for Header
    const notifications = [
        { id: 1, message: "M-103: Nhiệt độ cao bất thường", severity: "Critical" },
        { id: 2, message: "PLC_DâyChuyềnA: Mất kết nối Modbus", severity: "Error" },
    ];

    // User Menu Items (sử dụng logout từ Context)
    const userMenuItems = [
        { key: '1', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
        { key: '2', icon: <SettingOutlined />, label: 'Cài đặt' },
        { type: 'divider' },
        { key: '3', danger: true, label: 'Đăng xuất', onClick: logout }, // <-- SỬ DỤNG LOGOUT TỪ CONTEXT
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar - Menu Điều hướng */}
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={250}>
                <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {collapsed ? 'IIOT' : 'Factory IIoT System'}
                </div>
                
                <Menu 
                    theme="dark" 
                    mode="inline" 
                    defaultSelectedKeys={['/']} 
                    defaultOpenKeys={['/production', '/kpi', '/admin']}
                    items={sidebarMenuItems}
                />
            </Sider>

            <Layout>
                {/* Header - Thanh tiêu đề */}
                <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    {/* Factory Selector */}
                    <Dropdown
                        menu={{ items: factories.map(f => ({ key: f.key, label: f.label, onClick: () => setCurrentFactory(f) })) }}
                        trigger={['click']}
                    >
                        <Button size="large" type="primary">
                            <Space>
                                <ShopOutlined />
                                **{currentFactory.label}**
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>

                    {/* Controls & User Profile */}
                    <Space size="large">
                        
                        {/* Notifications */}
                        <Badge count={notifications.length} offset={[5, 0]} dot={notifications.length > 0}>
                            <AlertOutlined style={{ fontSize: '24px', color: notifications.length > 0 ? '#ff4d4f' : '#000' }} />
                        </Badge>

                        {/* User Menu */}
                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}> 
                            <Button type="text" style={{ padding: '0 10px' }}>
                                <Space size="small">
                                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                                    <span style={{ fontWeight: 'bold' }}>Admin</span>
                                </Space>
                            </Button>
                        </Dropdown>
                    </Space>
                </Header>

                {/* Nội dung trang */}
                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet /> {/* Hiển thị nội dung của từng Route con */}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;