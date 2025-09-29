// FRONTEND/src/components/PageHeaderWithBreadcrumb.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * Component Header trang với nút Quay lại và Breadcrumb cơ bản.
 * @param {object} props
 * @param {string} props.title Tiêu đề chính của trang
 * @param {React.ReactNode} props.icon Icon của tiêu đề
 * @param {function} [props.onBack] Hàm xử lý khi nhấn nút quay lại (mặc định là navigate(-1))
 */
const PageHeaderWithBreadcrumb = ({ title, icon, onBack }) => {
    const navigate = useNavigate();
    
    const defaultOnBack = () => {
        // Quay lại trang trước đó trong lịch sử trình duyệt (Status Page hoặc Asset Management)
        navigate(-1); 
    };

    return (
        <div className="tw-p-4 tw-mb-4 tw-border-b tw-border-gray-200 tw-bg-white tw-shadow-sm">
            <Space align="center" className="tw-w-full">
                <Button
                    type="default"
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack || defaultOnBack}
                    size="large"
                >
                    Quay lại
                </Button>
                <Title level={3} style={{ margin: 0, marginLeft: 16 }}>
                    <Space size="middle">
                        {icon}
                        {title}
                    </Space>
                </Title>
            </Space>
        </div>
    );
};

export default PageHeaderWithBreadcrumb;