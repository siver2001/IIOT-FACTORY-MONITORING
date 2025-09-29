// FRONTEND/src/features/Layout/MainLayout.jsx

import React, { useState } from 'react';
// IMPORT THÊM App để dùng hook message
import { Layout, Menu, Button, theme, Dropdown, Space, Badge, Avatar, App, Tag  } from 'antd'; 
import { Outlet, Link } from 'react-router-dom';
import { 
    DashboardOutlined, BuildOutlined, AlertOutlined, SettingOutlined, 
    UserOutlined, DownOutlined, BarChartOutlined, ShopOutlined, ToolOutlined, StockOutlined, DollarOutlined // THÊM DollarOutlined
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
    // MỤC BẢO TRÌ ĐÃ CẬP NHẬT
    { 
        
        key: '/maintenance',
        icon: <ToolOutlined />,
        label: 'Bảo Trì & Vận hành',
        children: [
            { key: '/maintenance/dashboard', label: 'Dashboard Hiệu suất', link: '/maintenance/dashboard' },
            { key: '/maintenance/work-orders', label: 'Quản lý Lệnh công việc', link: '/maintenance/work-orders' },
            { key: '/maintenance/inventory', icon: <StockOutlined />, label: 'Quản lý Kho Vật tư', link: '/maintenance/inventory' },
            { key: '/maintenance/calendar', label: 'Lịch Bảo trì', link: '/maintenance/calendar' },
        ]
    },
    { 
        key: '/kpi', 
        icon: <BarChartOutlined />, 
        label: 'Phân tích Hiệu suất', 
        children: [
        { key: '/kpi/oee', label: 'OEE Analyzer', link: '/kpi/oee' },
        { key: '/kpi/mtbf', label: 'MTBF/MTTR Report', link: '/kpi/mtbf' },
        { key: '/kpi/quality', label: 'Phân tích Chất lượng', link: '/kpi/quality' },
        ]
},
    { 
        key: 'alerts-root', 
        icon: <AlertOutlined />, 
        label: 'Quản lý Cảnh báo', 
        children: [
            { key: '/alerts', label: 'Danh sách Cảnh báo', link: '/alerts' },
            { key: '/alerts/knowledge-base', label: 'Kho tri thức Lỗi', link: '/alerts/knowledge-base' },
        ]
    },
    { 
        key: '/admin', 
        icon: <SettingOutlined />, 
        label: 'Quản trị Hệ thống', 
        children: [
            { key: '/admin/users', label: 'Quản lý Tài khoản', link: '/admin/users', permissionLevel: 0 }, // Chỉ Admin (0)
            { key: '/admin/config', label: 'Cấu hình Thiết bị', link: '/admin/config', permissionLevel: 1 }, // Admin (0) và Manager (1)
            { key: '/admin/assets', label: 'Quản lý Tài sản', link: '/admin/assets', permissionLevel: 1 }, // Admin (0) và Manager (1)
        ],
        permissionLevel: 1 // Level cha: Supervisor (2) và User (3) không thấy menu này
    },
];

/**
 * Hàm đệ quy chuyển đổi Menu Item và thêm hiệu ứng Cảnh báo
 * @param {Array} items Danh sách menu items
 * @param {number} activeAlertCount Số lượng cảnh báo active
 * @param {number} userRoleLevel Cấp độ quyền hạn của người dùng (0, 1, 2, 3)
 */

const transformMenuItems = (items, activeAlertCount, userRoleLevel) => {
    return items
        .filter(item => item.permissionLevel === undefined || userRoleLevel <= item.permissionLevel)
        .map(item => {
        const menuItem = {
            key: item.key,
            icon: item.icon,
        };
        
        // LOGIC CHỚP NHÁY VÀ MÀU ĐỎ CHO ITEM CẢNH BÁO
        const isAlertRoot = item.key === 'alerts-root'; 
        const hasActiveAlert = activeAlertCount > 0;
        
        if (isAlertRoot) {
            if (hasActiveAlert) {
                 // 1. Thêm className tùy chỉnh để ghi đè màu chữ
                 menuItem.className = 'alert-active-flash tw-animate-pulse'; 
                 // 2. Ép buộc màu đỏ cho ICON
                 menuItem.icon = <AlertOutlined style={{ color: '#ff4d4f' }} />;
            } else {
                 menuItem.icon = <AlertOutlined />;
                 menuItem.className = '';
            }
        } else {
             // Đảm bảo icon AlertOutlined ban đầu vẫn là màu mặc định khi không có lỗi
             menuItem.icon = item.icon;
             menuItem.className = '';
        }

        if (item.children) {
            menuItem.label = item.label;
            menuItem.children = transformMenuItems(item.children, activeAlertCount, userRoleLevel); 
        } else {
            // 3. Hiển thị label kèm số lượng và hiệu ứng nhấp nháy (chỉ cho link)
            const labelContent = (item.key === '/alerts' && hasActiveAlert) ? (
                // Chỉ cần thêm số lượng, màu sắc và nhấp nháy sẽ do CSS đảm nhận
                <span>{item.label} ({activeAlertCount})</span> 
            ) : item.label;
            
            menuItem.label = <Link to={item.link}>{labelContent}</Link>;
        }

        if (item.type === 'divider') {
             return { type: 'divider' };
        }
        
        return menuItem;
    }).filter(Boolean); // Lọc các mục menu bị ẩn (null)
};


// Component nội dung chính
const MainLayoutContent = () => { 
    // SỬ DỤNG HOOK useApp() TẠI ĐÂY (Giải quyết cảnh báo message context)
    const { message } = App.useApp();
    const liveData = useRealTimeData(); 

    const activeAlertCount = liveData.liveAlerts.filter(a => a.severity === 'Critical' || a.severity === 'Error').length;
    
    const [collapsed, setCollapsed] = useState(false);
    const [currentFactory, setCurrentFactory] = useState(factories[0]);
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken(); 
    const { logout, userRole, username, roleLevel } = useAuth(); // LẤY roleLevel
    // ...
    // Xử lý Logout và Thông báo
    const handleLogout = () => {
        logout();
        message.info('Bạn đã đăng xuất.'); 
    };

    // Truyền roleLevel vào hàm tạo menu
    const sidebarMenuItems = React.useMemo(() => transformMenuItems(rawMenuItems, activeAlertCount, roleLevel), [activeAlertCount, roleLevel]); 

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
                    defaultOpenKeys={['/production', '/maintenance', '/kpi', 'alerts-root', '/admin']}
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
                                    <span style={{ fontWeight: 'bold' }}>{username}</span> 
                                    <Tag color="volcano" style={{ margin: 0, fontWeight: 'bold' }}>{userRole}</Tag> 
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