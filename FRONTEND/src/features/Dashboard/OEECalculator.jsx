import React, { useState, useMemo } from 'react';
import { Typography, Space, Card, Row, Col, Statistic, Select, DatePicker, Button, Divider } from 'antd';
import { AreaChartOutlined, ClockCircleOutlined, CheckCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import { useRealTimeData } from '../../hooks/useRealTimeData';

const { Title } = Typography;
const { Option } = Select;

// Hàm mock tính toán các thành phần OEE từ dữ liệu real-time
const calculateOEE = (data) => {
    // Giả lập logic tính OEE (Tận dụng các chỉ số mock)
    const availability = (data.MachineCount - data.ErrorCount) / data.MachineCount;
    // Performance được tính hơi phức tạp để tránh trùng với Availability
    const performance = data.RunningCount / data.MachineCount * 1.1; 
    const quality = 0.98; // Giả sử chất lượng cố định

    return {
        availability: parseFloat((Math.min(availability * 100, 100)).toFixed(1)),
        performance: parseFloat((Math.min(performance * 100, 100)).toFixed(1)),
        quality: parseFloat((quality * 100).toFixed(1)),
        oee: parseFloat((availability * performance * quality * 100).toFixed(1)),
    };
};

const OEECalculator = () => {
    const liveData = useRealTimeData();
    const [selectedMachine, setSelectedMachine] = useState('All');
    // Tính toán OEE dựa trên liveData
    const { availability, performance, quality, oee } = useMemo(() => calculateOEE(liveData), [liveData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 0,
                max: 100,
                title: { display: true, text: 'Tỷ lệ (%)' }
            }
        },
        plugins: {
            tooltip: { mode: 'index', intersect: false }
        }
    };

    const oeeChartData = {
        labels: liveData.performanceHistory.map(d => d.time),
        datasets: [
            {
                label: 'OEE (%)',
                data: liveData.performanceHistory.map(d => Math.min(d.value, oee)),
                borderColor: '#1677ff',
                backgroundColor: 'rgba(22, 119, 255, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><AreaChartOutlined /> OEE Analyzer & Chi tiết Hiệu suất</Title>
            
            {/* Control Panel */}
            <Card title="Bộ lọc Phân tích" variant="default">
                <Row gutter={24}>
                    <Col span={6}>
                        <label>Chọn Thiết bị:</label>
                        <Select defaultValue="All" style={{ width: '100%' }} onChange={setSelectedMachine}>
                            <Option value="All">Tất cả Thiết bị</Option>
                            <Option value="M-101">Máy M-101</Option>
                            <Option value="M-102">Máy M-102</Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <label>Chọn Khoảng thời gian:</label>
                        <DatePicker.RangePicker style={{ width: '100%' }} />
                    </Col>
                    <Col span={6}>
                        <label>Lọc theo:</label>
                        <Select defaultValue="Daily" style={{ width: '100%' }}>
                            <Option value="Daily">Theo ngày</Option>
                            <Option value="Weekly">Theo tuần</Option>
                            <Option value="Monthly">Theo tháng</Option>
                        </Select>
                    </Col>
                    <Col span={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Button type="primary" icon={<SettingOutlined />} disabled>Tải Dữ liệu Chi tiết</Button>
                    </Col>
                </Row>
            </Card>

            <Divider orientation="left">OEE Tổng Hợp ({selectedMachine})</Divider>

            {/* KPI Cards (FIXED: Đã thay bordered={false} bằng variant="borderless") */}
            <Row gutter={24}>
                <Col span={6}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #1677ff' }}>
                        <Statistic title="OEE Tổng (Mục tiêu > 85%)" value={oee} precision={1} suffix="%" valueStyle={{ color: oee > 85 ? '#3f8600' : '#cf1322' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #52c41a' }}>
                        <Statistic title="Availability (%)" value={availability} precision={1} suffix="%" prefix={<ClockCircleOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #faad14' }}>
                        <Statistic title="Performance (%)" value={performance} precision={1} suffix="%" prefix={<CheckCircleOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #ff4d4f' }}>
                        <Statistic title="Quality (%)" value={quality} precision={1} suffix="%" prefix={<SettingOutlined />} />
                    </Card>
                </Col>
            </Row>

            {/* OEE Trend Chart */}
            <Card title="Biểu đồ Xu hướng OEE">
                <div style={{ height: 400 }}>
                    <Line data={oeeChartData} options={chartOptions} />
                </div>
            </Card>

        </Space>
    );
};

export default OEECalculator;