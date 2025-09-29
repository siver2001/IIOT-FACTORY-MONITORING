// FRONTEND/src/maintenance/MaintenanceDashboardPage.jsx
import React from 'react';
import { Typography, Space, Card, Row, Col, Statistic, Table, Tag, Divider } from 'antd';
import { 
    DashboardOutlined, CheckCircleOutlined, AlertOutlined, ClockCircleOutlined, 
    TagsOutlined, ToolOutlined, ShopOutlined, DollarOutlined
} from '@ant-design/icons';
import { useWorkOrder } from './useWorkOrder'; 
// FIX: Chỉ import hook useAlertManagement
import { useAlertManagement } from '../hooks/useAlertManagement'; 
// FIX: Import hook quản lý Catalog
import { useFaultCatalog } from '../hooks/useFaultCatalog'; 

const { Title, Text } = Typography;

const MaintenanceDashboardPage = () => {
    const { pmComplianceKPI, costKPI } = useWorkOrder(); 
    // FIX: Lấy FAULT_CATALOG và advancedKPIs từ các nguồn đã sửa
    const { advancedKPIs } = useAlertManagement(); 
    const { FAULT_CATALOG } = useFaultCatalog();
    
    // --- Tính toán giá trị ---
    const mttaColor = advancedKPIs.mtta < 2.5 ? '#52c41a' : '#ff4d4f'; 
    const pmColor = pmComplianceKPI.complianceRate > 90 ? '#52c41a' : pmComplianceKPI.complianceRate > 80 ? '#faad14' : '#ff4d4f';
    const cpmhColor = costKPI.cpmh < 1 ? '#52c41a' : '#ff4d4f'; 

    const faultColumns = [
        { title: 'Mã Lỗi', dataIndex: 'faultCode', key: 'faultCode', render: (code) => <Tag color="geekblue" style={{ fontWeight: 'bold' }}>{code}</Tag> },
        { 
            title: 'Mô tả', 
            dataIndex: 'faultCode', 
            key: 'description', 
            // FIX: Sử dụng FAULT_CATALOG động
            render: (code) => (FAULT_CATALOG || []).find(f => f.code === code)?.description || 'Không rõ' 
        },
        { 
            title: 'Số lần Lặp lại', 
            dataIndex: 'count', 
            key: 'count',
            sorter: (a, b) => a.count - b.count,
            defaultSortOrder: 'descend',
        },
    ];
    
    const machineColumns = [
        { title: 'Mã Máy', dataIndex: 'machineId', key: 'machineId', render: (id) => <Tag color="blue" icon={<ShopOutlined />}>{id}</Tag> },
        { 
            title: 'Số lần Lỗi', 
            dataIndex: 'count', 
            key: 'count',
            sorter: (a, b) => a.count - b.count,
            defaultSortOrder: 'descend',
        },
    ];

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><DashboardOutlined /> Dashboard Hiệu suất Bảo trì (Maintenance KPI)</Title>

            <Divider orientation="left">KPI Tổng quan Bảo trì & Chi phí</Divider>

            <Row gutter={24}>
                {/* 1. PM Compliance */}
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-lg" style={{ borderLeft: `4px solid ${pmColor}` }}>
                        <Statistic
                            title="Tỷ lệ Tuân thủ PM (PM Compliance)"
                            value={pmComplianceKPI.complianceRate}
                            precision={1}
                            suffix="%"
                            valueStyle={{ color: pmColor }}
                            prefix={<CheckCircleOutlined />}
                        />
                        <Text type="secondary" className="tw-block tw-mt-2">
                            Hoàn thành {pmComplianceKPI.compliantCount}/{pmComplianceKPI.totalPMCompleted} công việc đúng hạn.
                        </Text>
                    </Card>
                </Col>
                
                {/* 2. MTTA */}
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-lg" style={{ borderLeft: `4px solid ${mttaColor}` }}>
                        <Statistic
                            title="MTTA (Mean Time To Acknowledge)"
                            value={advancedKPIs.mtta}
                            precision={2}
                            suffix=" giờ"
                            valueStyle={{ color: mttaColor }}
                            prefix={<ClockCircleOutlined />}
                        />
                         <Text type="secondary" className="tw-block tw-mt-2">
                            Thời gian trung bình xác nhận cảnh báo. (Mục tiêu: Dưới 3 giờ)
                        </Text>
                    </Card>
                </Col>
                
                {/* 3. CPMH (MỚI) */}
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-lg" style={{ borderLeft: `4px solid ${cpmhColor}` }}>
                        <Statistic
                            title="CPMH (Chi phí/Giờ Máy)"
                            value={costKPI.cpmh}
                            precision={4}
                            suffix=" USD/giờ"
                            valueStyle={{ color: cpmhColor }}
                            prefix={<DollarOutlined />}
                        />
                         <Text type="secondary" className="tw-block tw-mt-2">
                            Tổng giờ chạy: {costKPI.totalRunningHours.toLocaleString()} giờ.
                        </Text>
                    </Card>
                </Col>

                {/* 4. Tổng chi phí WO */}
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-lg" style={{ borderLeft: '4px solid #faad14' }}>
                        <Statistic
                            title="Tổng Chi phí WO Đã Hoàn thành"
                            value={costKPI.totalCost}
                            suffix=" USD"
                            valueStyle={{ color: '#faad14' }}
                            prefix={<DollarOutlined />}
                        />
                         <Text type="secondary" className="tw-block tw-mt-2">
                            Tổng giờ công: {costKPI.totalLaborHours.toLocaleString()} giờ.
                        </Text>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Phân tích Độ lặp lại Lỗi</Divider>
            
            <Row gutter={24}>
                {/* Top 5 Fault Codes */}
                <Col span={12}>
                    <Card title={<Title level={5}><TagsOutlined /> Top 5 Mã Lỗi Lặp lại</Title>} className="tw-shadow-lg">
                        <Table
                            dataSource={advancedKPIs.topFaults}
                            columns={faultColumns}
                            rowKey="faultCode"
                            pagination={false}
                            size="middle"
                        />
                    </Card>
                </Col>
                
                {/* Top 5 Machines */}
                <Col span={12}>
                    <Card title={<Title level={5}><ShopOutlined /> Top 5 Máy Có Số lần Lỗi Cao Nhất</Title>} className="tw-shadow-lg">
                        <Table
                            dataSource={advancedKPIs.topMachines}
                            columns={machineColumns}
                            rowKey="machineId"
                            pagination={false}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>

        </Space>
    );
};

export default MaintenanceDashboardPage;