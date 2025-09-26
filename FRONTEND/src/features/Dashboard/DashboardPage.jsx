// src/features/Dashboard/DashboardPage.jsx
import React from 'react';
import { Layout, Row, Col, Card, Statistic, Divider, Space } from 'antd';
import { AreaChartOutlined, CheckCircleOutlined, AlertOutlined } from '@ant-design/icons';
import useDashboardData from './useDashboardData'; // Custom Hook nhận dữ liệu Real-time
import OEEGauge from './components/OEEGauge';
import RealTimeChart from './components/RealTimeChart';
import MachineStatusList from './components/MachineStatusList';

const { Content } = Layout;

const DashboardPage = () => {
    // 1. Nhận dữ liệu real-time từ Custom Hook
    const { machineData, realTimeLog, kpiData, isLoading } = useDashboardData();

    if (isLoading) return <Spin size="large" tip="Đang tải dữ liệu nhà máy..." />;

    return (
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 800 }}>
            {/* Hàng 1: KPIs Tổng thể */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="OEE Tổng thể"
                            value={kpiData.oee}
                            precision={2}
                            valueStyle={{ color: kpiData.oee > 85 ? '#3f8600' : '#cf1322' }}
                            suffix="%"
                            prefix={<AreaChartOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic title="MTBF" value={kpiData.mtbf} suffix=" giờ" />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic title="Máy đang chạy" value={kpiData.runningCount} suffix={`/${kpiData.totalCount}`} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic title="Cảnh báo Mới" value={kpiData.newAlerts} valueStyle={{ color: '#faad14' }} prefix={<AlertOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">GIÁM SÁT REAL-TIME</Divider>

            {/* Hàng 2: Biểu đồ Real-time và Đồng hồ OEE */}
            <Row gutter={[16, 16]}>
                <Col span={16}>
                    <Card title="Tốc độ Sản xuất Real-time (Đơn vị/phút)" bordered={false} style={{ height: 400 }}>
                        <RealTimeChart data={machineData} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="OEE Hiện tại (Machine M01)" bordered={false} style={{ height: 400, textAlign: 'center' }}>
                        <OEEGauge value={machineData['M01']?.oee || 0} />
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">TRẠNG THÁI VÀ LOG MÁY</Divider>

            {/* Hàng 3: Danh sách Trạng thái Máy và Log Cảnh báo */}
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Card title="Trạng thái Máy toàn nhà máy" bordered={false} style={{ height: 500, overflowY: 'auto' }}>
                        {/* Component hiển thị danh sách máy, tag trạng thái (Running/Stopped/Error) */}
                        <MachineStatusList data={machineData} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Log và Cảnh báo Real-time" bordered={false} style={{ height: 500, overflowY: 'auto' }}>
                        {/* Hiển thị danh sách Log sự kiện (thời gian, nội dung, mức độ) */}
                        <List
                            size="small"
                            dataSource={realTimeLog}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Tag color={item.severity === 'ERROR' ? 'red' : 'orange'}>{item.severity}</Tag>}
                                        title={item.title}
                                        description={`[${item.timestamp}] - Máy ${item.machineId}: ${item.message}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </Content>
    );
};

export default DashboardPage;