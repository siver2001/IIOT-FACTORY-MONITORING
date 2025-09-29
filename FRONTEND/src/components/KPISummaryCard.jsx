// FRONTEND/src/components/KPISummaryCard.jsx

import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Thành phần hiển thị tóm tắt KPI chuẩn.
 * * @param {object} props
 * @param {string} props.title Tiêu đề KPI.
 * @param {number} props.value Giá trị chính.
 * @param {string} [props.suffix] Hậu tố (ví dụ: %, USD).
 * @param {React.ReactNode} [props.prefix] Tiền tố (ví dụ: Icon).
 * @param {string} [props.color='blue'] Màu sắc chính (blue, red, green, gold).
 * @param {string} [props.subText] Văn bản chi tiết nhỏ bên dưới.
 */
const KPISummaryCard = ({ title, value, suffix, prefix, color = 'blue', subText, precision, valueStyle = {} }) => {
    
    const colorMap = {
        blue: '#1677ff',
        red: '#ff4d4f',
        green: '#52c41a',
        gold: '#faad14',
    };

    return (
        <Card 
            variant="borderless" 
            className="tw-shadow-md" 
            style={{ borderLeft: `4px solid ${colorMap[color] || colorMap.blue}` }}
        >
            <Statistic
                title={title || 'Chỉ số KPI'}
                value={value === undefined || value === null ? 'N/A' : value}
                precision={precision}
                suffix={suffix}
                prefix={prefix || <QuestionCircleOutlined />}
                valueStyle={{ color: colorMap[color] || colorMap.blue, ...valueStyle }}
            />
            {subText && (
                <Text type="secondary" className="tw-block tw-mt-2 tw-text-sm">
                    {subText}
                </Text>
            )}
        </Card>
    );
};

export default KPISummaryCard;