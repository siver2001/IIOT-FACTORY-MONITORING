// FRONTEND/src/components/PermissionGuard.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Kiểm soát hiển thị nội dung dựa trên cấp độ quyền hạn của người dùng.
 * * @param {object} props
 * @param {number} props.requiredLevel Cấp độ quyền hạn tối đa được phép truy cập (0 là cao nhất).
 * @param {React.ReactNode} props.children Nội dung được bảo vệ.
 * @param {boolean} [props.hideIfNoPermission=true] Ẩn hoàn toàn nếu không có quyền.
 */
const PermissionGuard = ({ requiredLevel, children, hideIfNoPermission = true }) => {
    const { roleLevel, userRole } = useAuth(); // Lấy cấp độ quyền (Admin=0, Manager=1, ...)

    const hasPermission = roleLevel <= requiredLevel;

    if (hasPermission) {
        return <>{children}</>;
    }
    
    if (!hideIfNoPermission) {
        return (
            <Text type="danger" italic>
                <LockOutlined /> Bạn không có quyền truy cập chức năng này (Cần mức {requiredLevel}, hiện tại {userRole} mức {roleLevel}).
            </Text>
        );
    }
    
    return null;
};

export default PermissionGuard;