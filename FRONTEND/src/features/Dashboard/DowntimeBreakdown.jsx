import React from 'react';
import { Card, Typography, Statistic, Row, Col } from 'antd';
import { AreaChartOutlined, StopOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const { Title, Text } = Typography;

// Mock Data cho Downtime Breakdown
const MOCK_DOWNTIME_DATA = {
    totalDowntimeHours: 55.2,
    breakdown: [
        { cause: 'Lỗi Thiết bị/Bảo trì', hours: 22.5, color: '#ff4d4f' },
        { cause: 'Thiếu Nguyên liệu', hours: 15.0, color: '#faad14' },
        { cause: 'Thay đổi Lô/Cấu hình', hours: 10.2, color: '#1677ff' },
        { cause: 'Lỗi Vận hành', hours: 7.5, color: '#52c41a' },
    ]
};

const DowntimeBreakdown = () => {
    const data = {
        labels: MOCK_DOWNTIME_DATA.breakdown.map(d => d.cause),
        datasets: [
            {
                data: MOCK_DOWNTIME_DATA.breakdown.map(d => d.hours),
                backgroundColor: MOCK_DOWNTIME_DATA.breakdown.map(d => d.color),
                hoverOffset: 4,
            },
        ],
    };

    return (
        <Card 
            title={<Title level={4} style={{ margin: 0 }}><AreaChartOutlined /> Phân tích Dừng máy (Downtime Breakdown)</Title>}
            variant="default" 
            className="tw-shadow-md"
            styles={{ body: { padding: 16 } }}
        >
            <Row gutter={16}>
                <Col span={8}>
                    <Statistic
                        title="Tổng thời gian dừng"
                        value={MOCK_DOWNTIME_DATA.totalDowntimeHours}
                        precision={1}
                        suffix="giờ"
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: '#cf1322' }}
                    />
                    <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                        Phân bổ theo nguyên nhân.
                    </Text>
                </Col>
                <Col span={16}>
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Doughnut
                            data={data}
                            options={{ 
                                maintainAspectRatio: false, 
                                cutout: '60%', 
                                plugins: { 
                                    legend: { position: 'right' } 
                                } 
                            }}
                        />
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default DowntimeBreakdown;