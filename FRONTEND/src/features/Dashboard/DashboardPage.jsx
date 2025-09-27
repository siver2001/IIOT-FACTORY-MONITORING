import React from 'react';
import { Card, Col, Row, Statistic, Space, Table, Tag, Typography, Button, Divider } from 'antd';
// GỘP TẤT CẢ ICONS VÀO MỘT DÒNG IMPORT (ĐÃ BỎ CheckCircleOutlined)
import { 
    ArrowUpOutlined, ArrowDownOutlined, AlertOutlined, 
    HomeOutlined, SendOutlined, MedicineBoxOutlined 
} from '@ant-design/icons'; 
import { Line, Doughnut } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement,
    Filler 
} from 'chart.js';

import { useRealTimeData } from '../../hooks/useRealTimeData';
import { useNavigate } from 'react-router-dom';
import HealthCard from './HealthCard'; 
import HealthChart from './HealthChart'; 
import DowntimeBreakdown from './DowntimeBreakdown'; // Import này được thêm ở bước trước

// **************************************************
// ĐẢM BẢO KHỐI KHAI BÁO CHARTJS CHỈ XUẤT HIỆN 1 LẦN
// **************************************************
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler); 

const { Title: AntdTitle } = Typography;

const DashboardPage = () => {
    const navigate = useNavigate();
    const data = useRealTimeData();
    
    const { 
        OEE, MTBF, MachineCount, RunningCount, ErrorCount, 
        performanceHistory, liveAlerts, healthScore, healthHistory 
    } = data; 

    // Hàm xác định màu sắc (Used)
    const getStatusColor = (count, total) => {
        const ratio = count / total;
        if (ratio > 0.8) return 'green';
        if (ratio > 0.5) return 'blue';
        return 'red';
    };

    // Dữ liệu Doughnut Chart (Used)
    const statusData = {
        labels: ['Running', 'Idle', 'Error'],
        datasets: [
            {
                data: [RunningCount, MachineCount - RunningCount - ErrorCount, ErrorCount],
                backgroundColor: ['#52c41a', '#1677ff', '#ff4d4f'],
                hoverBackgroundColor: ['#73d13c', '#4096ff', '#f5222d'],
            },
        ],
    };

    // Dữ liệu Line Chart (Used)
    const lineChartData = {
        labels: performanceHistory.map(d => d.time),
        datasets: [
            {
                label: 'Hiệu suất (Performance)',
                data: performanceHistory.map(d => d.value),
                borderColor: 'rgba(24, 144, 255, 1)',
                backgroundColor: 'rgba(24, 144, 255, 0.1)',
                tension: 0.4,
                pointRadius: 3,
                fill: true,
            },
        ],
    };

    // Định nghĩa cột Alert Table (Used)
    const liveAlertColumns = [
        { title: 'Thời gian', dataIndex: 'time', key: 'time', width: 100 },
        { title: 'Mã Máy', dataIndex: 'machineId', key: 'machineId', width: 80 },
        { title: 'Thông báo', dataIndex: 'message', key: 'message' },
        {
            title: 'Mức độ',
            dataIndex: 'severity',
            key: 'severity',
            width: 100,
            render: (text) => (
                <Tag color={text === 'Critical' ? 'red' : text === 'Error' ? 'volcano' : 'gold'}>{text.toUpperCase()}</Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Button size="small" icon={<SendOutlined />} onClick={() => console.log(`Acknowledged ${record.id}`)}>Xử lý</Button>
            ),
        },
    ];

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <AntdTitle level={3}>Dashboard Tổng quan Nhà máy <HomeOutlined /></AntdTitle>

            {/* Row 1: KPI Cards */}
            <Row gutter={24}>
                <Col span={6}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #1677ff' }}> 
                        <Statistic
                            title="OEE Tổng hợp"
                            value={OEE} 
                            precision={1}
                            valueStyle={{ color: OEE > 80 ? '#3f8600' : '#cf1322' }}
                            prefix={OEE > 80 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #52c41a' }}> 
                        <Statistic
                            title="Máy đang chạy (RUN)"
                            value={RunningCount} 
                            valueStyle={{ color: getStatusColor(RunningCount, MachineCount) }}
                            suffix={`/${MachineCount}`} 
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #ff4d4f' }}> 
                        <Statistic
                            title="Máy đang Lỗi (ERROR)"
                            value={ErrorCount} 
                            valueStyle={{ color: ErrorCount > 5 ? '#cf1322' : '#d9d9d9' }}
                            prefix={<AlertOutlined />}
                            suffix={`/${MachineCount}`}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #faad14' }}> 
                        <Statistic
                            title="MTBF (Trung bình)"
                            value={MTBF} 
                            valueStyle={{ color: MTBF > 300 ? '#3f8600' : '#faad14' }}
                            suffix=" giờ"
                        />
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left"><MedicineBoxOutlined /> Phân tích Sức khỏe Dự đoán (P.M)</Divider>
            
            {/* Health Score & Health Trend */}
            <Row gutter={24}>
                <Col span={6}>
                    <HealthCard machineId="Tổng hợp" healthScore={healthScore} />
                </Col>
                <Col span={18}>
                    <HealthChart history={healthHistory} />
                </Col>
            </Row>

            <Divider orientation="left">Phân tích Hiệu suất & Trạng thái</Divider>

            {/* Row 2: Performance Trend & Downtime Breakdown */}
            <Row gutter={24}>
                {/* Real-time Performance Line Chart */}
                <Col span={14}>
                    <Card title="Xu hướng Hiệu suất Tổng hợp (24h gần nhất)">
                        <Line data={lineChartData} options={{ maintainAspectRatio: false, height: 300 }} />
                    </Card>
                </Col>
                
                {/* Downtime Breakdown MỚI */}
                <Col span={10}>
                    <DowntimeBreakdown />
                </Col>
            </Row>

            {/* Row 3: Status Distribution & Live Alerts */}
            <Row gutter={24}>
                 {/* Machine Status Doughnut Chart */}
                <Col span={8}>
                    <Card title="Phân bổ Trạng thái Máy">
                        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Doughnut
                                data={statusData}
                                options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right' } } }}
                            />
                        </div>
                    </Card>
                </Col>
                {/* Live Alerts Table */}
                <Col span={16}>
                    <Card title="Cảnh báo Đang hoạt động (Real-time Logs)">
                        <Table
                            dataSource={liveAlerts} 
                            columns={liveAlertColumns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            scroll={{ y: 200 }}
                        />
                    </Card>
                </Col>
            </Row>
            
            {/* Nút quay lại trang chính */}
            <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                    <Button
                        type="dashed"
                        size="large"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/')}
                        style={{ marginTop: 10, visibility: window.location.pathname === '/' ? 'hidden' : 'visible' }}
                    >
                        Quay lại Trang Chính
                    </Button>
                </Col>
            </Row>
        </Space>
    );
};
export default DashboardPage;