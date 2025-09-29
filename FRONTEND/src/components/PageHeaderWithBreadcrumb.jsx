// FRONTEND/src/components/PageHeaderWithBreadcrumb.jsx

import React from 'react';
import { Typography, Space, Button } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

/**
 * Thành phần Header chuẩn cho các trang chức năng.
 * * @param {object} props
 * @param {string} props.title Tiêu đề chính của trang.
 * @param {React.ReactNode} [props.icon] Icon chính của trang.
 * @param {React.ReactNode} [props.actions] Các nút hành động bên phải (ví dụ: Add, Export).
 */
const PageHeaderWithBreadcrumb = ({ title, icon, actions }) => {
    const navigate = useNavigate();

    return (
        <div className="tw-border-b tw-pb-4 tw-mb-6 tw-flex tw-justify-between tw-items-center">
            <Space size="middle">
                {/* Nút Quay lại (Chỉ hiển thị nếu không phải trang chủ) */}
                {window.location.pathname !== '/' && (
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        type="text" 
                        onClick={() => navigate(-1)}
                        className="tw-mr-2"
                    />
                )}
                <Title level={3} style={{ margin: 0 }}>
                    <Space>
                        {icon || <HomeOutlined />} 
                        {title}
                    </Space>
                </Title>
            </Space>
            
            {/* Vùng chứa các nút hành động (Add/Export) */}
            {actions && <Space>{actions}</Space>}
        </div>
    );
};

export default PageHeaderWithBreadcrumb;