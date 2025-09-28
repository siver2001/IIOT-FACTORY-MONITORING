// FRONTEND/src/maintenance/FailureTreeAnalysis.jsx

import React from 'react';
import { Card, Typography, Space, Divider, Tag, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, AlertOutlined, BulbOutlined, SyncOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Mock Data cho các cấp độ của Cây Lỗi (Failure Tree)
const MOCK_FTA_DATA = {
    topEvent: 'Trục Chính Dừng Bất Thường (Machine Downtime)',
    level1: [
        { 
            cause: 'Lỗi Cơ Khí', 
            icon: 'wrench',
            events: [
                { id: 1.1, name: 'Hỏng vòng bi', subCauses: ['Ma sát quá mức', 'Thiếu bôi trơn'] },
                { id: 1.2, name: 'Gãy khớp nối', subCauses: ['Lỗi vật liệu', 'Tải trọng quá cao'] }
            ] 
        },
        { 
            cause: 'Lỗi Điện/Điều khiển', 
            icon: 'thunderbolt',
            events: [
                { id: 2.1, name: 'Quá tải động cơ', subCauses: ['Cài đặt sai', 'Tắc nghẽn'] },
                { id: 2.2, name: 'Mất tín hiệu PLC', subCauses: ['Lỗi mạng', 'Hỏng module'] }
            ] 
        },
    ]
};

const FailureTreeAnalysis = ({ machineId }) => {

    const renderEvents = (events) => (
        <Space direction="vertical" size="small" style={{ display: 'flex', marginLeft: 20 }}>
            {events.map(event => (
                <Card 
                    key={event.id} 
                    size="small" 
                    title={<Text strong><MinusCircleOutlined style={{ color: '#1677ff' }} /> {event.name}</Text>}
                    style={{ borderLeft: '3px solid #1677ff' }}
                >
                    <Space direction="vertical" size={2}>
                        <Text strong style={{ fontSize: 12 }}>Nguyên nhân (Level 3):</Text>
                        {event.subCauses.map((sc, idx) => (
                            <Tag key={idx} color="default" className="tw-shadow-sm"><BulbOutlined /> {sc}</Tag>
                        ))}
                    </Space>
                </Card>
            ))}
        </Space>
    );

    const renderLevel1 = MOCK_FTA_DATA.level1.map(level => (
        <Col span={12} key={level.cause}>
            <Card title={<Text strong className="tw-text-lg tw-flex tw-items-center"><PlusCircleOutlined style={{ color: '#faad14' }} /> {level.cause}</Text>} className="tw-shadow-md">
                {renderEvents(level.events)}
            </Card>
        </Col>
    ));

    return (
        <Space direction="vertical" size={16} style={{ display: 'flex' }}>
            <Title level={4} className="tw-flex tw-items-center"><ThunderboltOutlined /> Phân tích Cây Lỗi (FTA - Mock)</Title>
            
            <Card className="tw-shadow-xl tw-bg-red-50" style={{ border: '2px solid #ff4d4f' }}>
                <div className="tw-text-center">
                    <Title level={3} style={{ margin: 0, color: '#cf1322' }}>{MOCK_FTA_DATA.topEvent}</Title>
                    <Text type="secondary">Sự kiện đỉnh (Top Event) của máy {machineId}</Text>
                </div>
            </Card>

            <Text strong><SyncOutlined /> Các nguyên nhân cơ bản (Level 1/2):</Text>
            <Row gutter={16}>
                {renderLevel1}
            </Row>
            <Divider />
            <Text type="secondary" className="tw-italic">
                *Đây là mô hình mô phỏng Cây Lỗi. Trong thực tế, mô hình này sẽ được xây dựng dựa trên kinh nghiệm và dữ liệu lịch sử lỗi để phục vụ Phân tích Nguyên nhân Gốc rễ (RCA).
            </Text>
        </Space>
    );
};

export default FailureTreeAnalysis;