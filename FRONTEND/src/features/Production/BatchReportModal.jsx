import React, { useMemo } from 'react';
import { Modal, Card, Statistic, Row, Col, Typography, Space, Divider, Tag, Button } from 'antd';
import { 
    CheckCircleOutlined, AlertOutlined, ClockCircleOutlined, BarChartOutlined, 
    FallOutlined, ToolOutlined, RiseOutlined, FireOutlined 
} from '@ant-design/icons';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, 
    ArcElement, 
    Tooltip, 
    Legend 
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const { Title, Text } = Typography;

const getOEEColor = (oee) => oee > 85 ? '#3f8600' : '#cf1322';
const getYieldColor = (yieldRate) => yieldRate > 95 ? '#3f8600' : '#cf1322';

const BatchReportModal = ({ isVisible, onCancel, batch }) => {
    
    // Kiểm tra dữ liệu
    const report = batch?.report;
    const reportDataAvailable = !!report;

    // Dữ liệu cho biểu đồ phân bổ lỗi
    const defectDistributionData = useMemo(() => {
        if (!reportDataAvailable || !report.defectDistribution || report.defectDistribution.length === 0) {
            return {
                labels: ['Không có lỗi'],
                datasets: [{ data: [1], backgroundColor: ['#d9d9d9'] }],
            };
        }
        return {
            labels: report.defectDistribution.map(d => d.type),
            datasets: [
                {
                    data: report.defectDistribution.map(d => d.count),
                    backgroundColor: ['#1677ff', '#ff4d4f', '#faad14', '#52c41a'],
                    hoverOffset: 4,
                },
            ],
        };
    }, [report, reportDataAvailable]);
    
    // Nếu không có báo cáo
    if (!reportDataAvailable) {
        return (
            <Modal title="Báo cáo Lô Sản phẩm" open={isVisible} onCancel={onCancel} footer={null}>
                <Text type="secondary">Báo cáo chưa được tạo. Lô sản phẩm này chưa hoàn thành hoặc đã bị dừng.</Text>
            </Modal>
        );
    }

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}><BarChartOutlined /> Báo cáo Chi tiết Lô: {batch.name}</Title>}
            open={isVisible}
            onCancel={onCancel}
            width={1000} // Tăng chiều rộng để hiển thị nhiều thông tin
            footer={[
                <Button key="close" onClick={onCancel}>Đóng</Button>
            ]}
        >
            <Space direction="vertical" size={24} style={{ display: 'flex' }}>
                <Divider orientation="left">Tóm tắt Hiệu suất (KPIs)</Divider>
                
                {/* KPI Cards */}
                <Row gutter={24}>
                    <Col span={6}>
                        <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #1677ff' }}>
                            <Statistic
                                title="OEE Tổng hợp"
                                value={report.oee}
                                precision={1}
                                suffix="%"
                                valueStyle={{ color: getOEEColor(report.oee) }}
                                prefix={<FireOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #52c41a' }}>
                            <Statistic
                                title="Tỷ lệ Đạt (Yield)"
                                value={report.yieldRate}
                                precision={2}
                                suffix="%"
                                valueStyle={{ color: getYieldColor(report.yieldRate) }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #ff4d4f' }}>
                            <Statistic
                                title="Số lượng Lỗi (Defects)"
                                value={report.defectCount}
                                suffix={`/${batch.targetQty}`}
                                valueStyle={{ color: report.defectCount > 0 ? '#cf1322' : '#3f8600' }}
                                prefix={<FallOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #faad14' }}>
                            <Statistic
                                title="Thời gian Thực hiện"
                                value={report.durationHours}
                                precision={1}
                                suffix=" giờ"
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
                
                <Divider orientation="left">Phân tích Lỗi và Nguyên nhân Gốc rễ</Divider>

                <Row gutter={24}>
                    {/* Defect Distribution Chart */}
                    <Col span={10}>
                        <Card title="Phân bổ Loại lỗi" variant="default" style={{ borderRadius: 8 }}>
                            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Doughnut
                                    data={defectDistributionData}
                                    options={{ maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'right' } } }}
                                />
                            </div>
                        </Card>
                    </Col>
                    
                    {/* Root Cause Analysis */}
                    <Col span={14}>
                        <Card title="Nguyên nhân Thường gặp" variant="default" style={{ borderRadius: 8, height: '100%' }}>
                            <Space direction="vertical" style={{ display: 'flex' }} size="small">
                                <Text strong><ToolOutlined /> Nguyên nhân Gốc rễ Chính:</Text>
                                <Tag color="volcano" style={{ padding: '8px 12px', fontSize: 14 }}>{report.commonCause}</Tag>
                                
                                <Text strong className="tw-mt-4"><AlertOutlined /> Ghi chú Hệ thống:</Text>
                                <Text type="secondary">
                                    Lô đã hoàn thành với hiệu suất OEE **{report.oee}%**. Cần xem xét nguyên nhân này để cải thiện OEE trong lô tiếp theo.
                                </Text>
                                
                                <Text strong className="tw-mt-2"><CheckCircleOutlined /> Lời khuyên cho Bảo trì:</Text>
                                <Text type="secondary">
                                    Thực hiện kiểm tra hiệu chuẩn máy sau mỗi {Math.round(report.durationHours)} giờ chạy đối với lô sản phẩm này.
                                </Text>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Space>
        </Modal>
    );
};

export default BatchReportModal;