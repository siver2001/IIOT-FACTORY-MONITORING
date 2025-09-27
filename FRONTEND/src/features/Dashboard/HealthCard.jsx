import React from 'react';
import { Card, Statistic, Tag, Typography } from 'antd';
import { HeartFilled, WarningOutlined } from '@ant-design/icons';

const { Text } = Typography;

const getHealthColor = (score) => {
    if (score > 80) return { color: '#52c41a', tag: 'Tốt' };
    if (score > 50) return { color: '#faad14', tag: 'Cần theo dõi' };
    return { color: '#ff4d4f', tag: 'Nguy hiểm' };
};

const HealthCard = ({ machineId, healthScore }) => {
    const { color, tag } = getHealthColor(healthScore);

    return (
        <Card 
            title={machineId}
            variant="borderless"
            extra={<Tag color={color}>{tag.toUpperCase()}</Tag>}
            style={{ borderLeft: `4px solid ${color}`, minHeight: 120 }}
        >
            <Statistic
                title="Điểm Sức khỏe"
                value={healthScore}
                precision={1}
                suffix="/100"
                valueStyle={{ color }}
                prefix={<HeartFilled />}
            />
        </Card>
    );
};

export default HealthCard;