import React from 'react';
import { Typography, Space, Divider, Button } from 'antd';
import { UserOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useUserManagement } from './UserManagement/useUserManagement'; 
import UserTable from './UserManagement/UserTable'; 

const { Title } = Typography;

const UserManagement = () => {
    // Lấy thông tin quyền từ Context
    const { userRole } = useAuth();
    
    // Sử dụng Hook để quản lý toàn bộ state và logic
    const { 
        users,
        isAdding,
        editingKey,
        startAdding,
        handleFinalConfirm,
        // Dùng destructuring để lấy ra tất cả các hàm xử lý khác
        ...handlers 
    } = useUserManagement(userRole);

    // Truyền state và handlers cho component con
    const tableProps = {
        data: users,
        state: { isAdding, editingKey },
        handlers: { 
            startAdding, 
            ...handlers 
        }
    };

    // Điều kiện để vô hiệu hóa nút tổng thể khi đang có thao tác inline
    const isInlineActionActive = isAdding || editingKey; 

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><UserOutlined /> Quản lý Tài khoản & Phân quyền (RBAC) </Title>
            <div style={{ padding: '0 0 16px', color: '#1890ff', fontWeight: 'bold' }}>
                *Bạn đang đăng nhập với quyền: {userRole || 'Guest'}
            </div>
            
            {/* Thanh công cụ: Thêm người dùng và Xác nhận */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                    type="dashed" 
                    icon={<PlusOutlined />} 
                    onClick={startAdding}
                    disabled={isInlineActionActive} 
                >
                    Thêm Người Dùng Mới
                </Button>
                <Button 
                    type="primary" 
                    icon={<CheckOutlined />} 
                    onClick={handleFinalConfirm}
                    disabled={isInlineActionActive} 
                    size="large"
                >
                    Xác nhận Hoàn thành & Lưu
                </Button>
            </div>
            
            <Divider orientation="left">Danh sách Người dùng</Divider>
            
            {/* Sử dụng component bảng đã tách riêng */}
            <UserTable {...tableProps} />
        </Space>
    );
};

export default UserManagement;