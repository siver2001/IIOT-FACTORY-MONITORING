import React, { useState } from 'react';
// IMPORT THÊM App để dùng hook message
import { Layout, Menu, Button, theme, Dropdown, Space, Badge, Avatar, App } from 'antd'; 
import { Outlet, Link } from 'react-router-dom';
import { 
    DashboardOutlined, BuildOutlined, AlertOutlined, SettingOutlined, 
    UserOutlined, DownOutlined, BarChartOutlined, ShopOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext.jsx'; 
import { useRealTimeData } from '../../hooks/useRealTimeData'; 

const { Header, Content, Sider } = Layout;

const factories = [
    { key: 'F01', label: 'Nhà máy Sản xuất A' },
    { key: 'F02', label: 'Nhà máy Lắp ráp B' },
];

const rawMenuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard Tổng quan', link: '/' },
    { key: '/production', icon: <BuildOutlined />, label: 'Giám sát Sản xuất', children: [
        { key: '/production/status', label: 'Trạng thái Máy Live', link: '/production/status' },
        { key: '/production/logs', label: 'Lịch sử Vận hành', link: '/production/logs' },
        { key: '/production/batch', label: 'Quản lý Lô (Batch)', link: '/production/batch' },
    ]},
    { key: '/kpi', icon: <BarChartOutlined />, label: 'Phân tích Hiệu suất', children: [
        { key: '/kpi/oee', label: 'OEE Analyzer', link: '/kpi/oee' },
        { key: '/kpi/mtbf', label: 'MTBF/MTTR Report', link: '/kpi/mtbf' },
        { key: '/kpi/quality', label: 'Phân tích Chất lượng', link: '/kpi/quality' },
    ]},
    { key: '/alerts', icon: <AlertOutlined />, label: 'Quản lý Cảnh báo', link: '/alerts' },
    { key: '/admin', icon: <SettingOutlined />, label: 'Quản trị Hệ thống', children: [
        { key: '/admin/users', label: 'Quản lý Tài khoản', link: '/admin/users' },
        { key: '/admin/config', label: 'Cấu hình Thiết bị', link: '/admin/config' },
    ]},
];

/**
 * Hàm đệ quy chuyển đổi Menu Item và thêm hiệu ứng Cảnh báo
 * @param {Array} items Danh sách menu items
 * @param {number} activeAlertCount Số lượng cảnh báo active
 */
const transformMenuItems = (items, activeAlertCount) => {
    return items.map(item => {
        const menuItem = {
            key: item.key,
            icon: item.icon,
        };
        
        // LOGIC CHỚP NHÁY VÀ MÀU ĐỎ CHO ITEM CẢNH BÁO
        if (item.key === '/alerts' && activeAlertCount > 0) {
             // 1. Thêm className tùy chỉnh để ghi đè màu chữ
             menuItem.className = 'alert-active-flash tw-animate-pulse'; 
             // 2. Ép buộc màu đỏ cho ICON
             menuItem.icon = <AlertOutlined style={{ color: '#ff4d4f' }} />;
        } else {
             // Đảm bảo icon AlertOutlined ban đầu vẫn là màu mặc định khi không có lỗi
             menuItem.icon = item.icon;
             menuItem.className = '';
        }

        if (item.children) {
            menuItem.label = item.label;
            menuItem.children = transformMenuItems(item.children, activeAlertCount);
        } else {
            // 3. Hiển thị label kèm số lượng và hiệu ứng nhấp nháy (chỉ cho link)
            const labelContent = (item.key === '/alerts' && activeAlertCount > 0) ? (
                // Chỉ cần thêm số lượng, màu sắc và nhấp nháy sẽ do CSS đảm nhận
                <span>{item.label} ({activeAlertCount})</span> 
            ) : item.label;
            
            menuItem.label = <Link to={item.link}>{labelContent}</Link>;
        }

        if (item.type === 'divider') {
             return { type: 'divider' };
        }
        
        return menuItem;
    });
};


// Component nội dung chính
const MainLayoutContent = () => { 
    // SỬ DỤNG HOOK useApp() TẠI ĐÂY (Giải quyết cảnh báo message context)
    const { message } = App.useApp();
    const { logout } = useAuth();
    const liveData = useRealTimeData(); 

    const activeAlertCount = liveData.liveAlerts.filter(a => a.severity === 'Critical' || a.severity === 'Error').length;
    
    const [collapsed, setCollapsed] = useState(false);
    const [currentFactory, setCurrentFactory] = useState(factories[0]);
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken(); 
    
    // HÀM MỚI: Xử lý Logout và Thông báo
    const handleLogout = () => {
        logout();
        message.info('Bạn đã đăng xuất.'); 
    };

    const sidebarMenuItems = React.useMemo(() => transformMenuItems(rawMenuItems, activeAlertCount), [activeAlertCount]); 

    const notifications = liveData.liveAlerts.filter(a => a.severity === 'Critical' || a.severity === 'Error'); 

    // User Menu Items
    const userMenuItems = [
        { key: '1', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
        { key: '2', icon: <SettingOutlined />, label: 'Cài đặt' },
        { type: 'divider' },
        { key: '3', danger: true, label: 'Đăng xuất', onClick: handleLogout }, 
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
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
                <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
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

                    <Space size="large">
                        
                        <Badge count={notifications.length} offset={[5, 0]} dot={notifications.length > 0}>
                            <AlertOutlined style={{ fontSize: '24px', color: notifications.length > 0 ? '#ff4d4f' : '#000' }} />
                        </Badge>

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

                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

// Wrapper component để đảm bảo App.useApp() hoạt động
const MainLayout = () => (
    <App>
        <MainLayoutContent />
    </App>
);

export default MainLayout;