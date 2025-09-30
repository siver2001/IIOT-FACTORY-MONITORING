// FRONTEND/src/features/Dashboard/DowntimeBreakdown.jsx

import React from 'react';
import { Card, Typography, Statistic, Row, Col } from 'antd';
import { AreaChartOutlined, StopOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useOperationHistory } from '../../hooks/useOperationHistory'; // <-- IMPORT HOOK MỚI

ChartJS.register(ArcElement, Tooltip, Legend);

const { Title, Text } = Typography;

const DowntimeBreakdown = () => {
    // SỬ DỤNG DỮ LIỆU TÍNH TOÁN TỪ HOOK
    const { downtimeBreakdown } = useOperationHistory(); 
    
    const downtimeData = downtimeBreakdown; 
    
    // Nếu không có dữ liệu breakdown, sử dụng mảng rỗng để tránh lỗi
    const hasData = downtimeData.breakdown.length > 0;

    const data = {
        labels: hasData ? downtimeData.breakdown.map(d => d.cause) : ['Không có thời gian dừng'],
        datasets: [
            {
                data: hasData ? downtimeData.breakdown.map(d => d.hours) : [1],
                backgroundColor: hasData ? downtimeData.breakdown.map(d => d.color) : ['#d9d9d9'],
                hoverOffset: 4,
            },
        ],
    };
    
    // Nếu không có dữ liệu thực tế (tổng thời gian = 0)
    if (!hasData) {
        return (
            <Card title={<Title level={4} style={{ margin: 0 }}><AreaChartOutlined /> Phân tích Dừng máy (Downtime Breakdown)</Title>}
                variant="default" 
                className="tw-shadow-md"
            >
                 <Text type="secondary" className="tw-text-center tw-block tw-py-4">Không có thời gian dừng máy (Non-Running) được ghi nhận trong lịch sử.</Text>
            </Card>
        );
    }

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
                        value={downtimeData.totalDowntimeHours}
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