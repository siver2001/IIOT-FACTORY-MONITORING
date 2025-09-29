// FRONTEND/src/features/Alerts/FaultKnowledgeBasePage.jsx

import React, { useState, useMemo, useCallback } from 'react';
import { 
    // FIX: ĐÃ THÊM Descriptions vào import
    Typography, Space, Table, Tag, Input, Row, Col, Select, Divider, Modal, Card, Statistic, Button, Descriptions 
} from 'antd';
import { BookOutlined, AlertOutlined, TagOutlined } from '@ant-design/icons';
import { useAlertManagement } from '../../hooks/useAlertManagement'; 
import { useFaultCatalog } from '../../hooks/useFaultCatalog'; 
import dayjs from 'dayjs';
import PermissionGuard from '../../components/PermissionGuard';

const { Title, Text, Link } = Typography;
const { Option } = Select;

// Hạn chế quyền truy cập trang RCA Knowledge Base (chỉ cho phép đến cấp Supervisor)
const REQUIRED_LEVEL = 2; 

const FaultKnowledgeBasePage = () => {
    // Lấy FAULT_CATALOG động từ hook useFaultCatalog
    const { FAULT_CATALOG } = useFaultCatalog();
    const { alerts } = useAlertManagement();
    
    const [filters, setFilters] = useState({ machineId: null, faultCode: null });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRCA, setSelectedRCA] = useState(null);

    // Lọc Alerts đã được Giải quyết (Resolved) để xây dựng Kho tri thức
    const resolvedAlerts = useMemo(() => {
        const uniqueFaults = new Map();

        // Đảm bảo alerts là một mảng trước khi gọi filter
        (alerts || []).filter(a => a.status === 'Resolved' && a.resolvedInfo).forEach(alert => {
            try {
                const info = JSON.parse(alert.resolvedInfo);
                const faultCode = info.faultCode;
                
                // Sử dụng Mã Lỗi làm khóa duy nhất cho kho tri thức
                if (faultCode && !uniqueFaults.has(faultCode)) {
                    // Lấy mô tả chi tiết từ danh mục lỗi động
                    const faultDetail = (FAULT_CATALOG || []).find(f => f.code === faultCode);

                    uniqueFaults.set(faultCode, {
                        id: faultCode,
                        machineId: alert.machineId,
                        faultCode: faultCode,
                        // Thêm chi tiết RCA
                        rootCause: info.cause, 
                        actionTaken: info.action,
                        // Thêm mô tả và hạng mục từ Catalog
                        description: faultDetail?.description || `Mã lỗi tùy chỉnh: ${faultCode}`,
                        category: faultDetail?.category || 'Tùy chỉnh',
                        lastResolved: dayjs(alert.timestamp).format('YYYY-MM-DD HH:mm'),
                        // Tính toán số lần lỗi lặp lại (đếm tất cả alerts có mã lỗi này)
                        occurrence: (alerts || []).filter(a => a.faultCode === faultCode).length
                    });
                } else if (faultCode && uniqueFaults.has(faultCode)) {
                    // Cập nhật số lần lặp lại và ngày giải quyết gần nhất
                     const existing = uniqueFaults.get(faultCode);
                     existing.occurrence += 1;
                     existing.lastResolved = dayjs(alert.timestamp).format('YYYY-MM-DD HH:mm');
                }
            } catch (e) {
                console.error("Error parsing resolvedInfo:", e);
            }
        });
        
        // Áp dụng bộ lọc
        return Array.from(uniqueFaults.values()).filter(rca => {
            let match = true;
            if (filters.machineId && rca.machineId !== filters.machineId) match = false;
            if (filters.faultCode && rca.faultCode !== filters.faultCode) match = false;
            return match;
        });

    }, [alerts, filters, FAULT_CATALOG]);


    const handleShowDetails = (rca) => {
        setSelectedRCA(rca);
        setIsModalVisible(true);
    };

    // Định nghĩa cột bảng
    const columns = [
        { title: 'Mã Lỗi', dataIndex: 'faultCode', key: 'faultCode', width: 120, fixed: 'left', render: (text) => <Tag color="geekblue" style={{ fontWeight: 'bold' }}>{text}</Tag> },
        { title: 'Mô tả Lỗi', dataIndex: 'description', key: 'description', ellipsis: true },
        { title: 'Hạng mục', dataIndex: 'category', key: 'category', width: 130, render: (text) => <Tag color="blue">{text}</Tag> },
        { title: 'Nguyên nhân Gốc rễ', dataIndex: 'rootCause', key: 'rootCause', ellipsis: true },
        { title: 'Số lần Lặp lại', dataIndex: 'occurrence', key: 'occurrence', width: 100, sorter: (a, b) => a.occurrence - b.occurrence },
        { title: 'Giải quyết Gần nhất', dataIndex: 'lastResolved', key: 'lastResolved', width: 180 },
        { 
            title: 'Hành động', 
            key: 'action', 
            width: 100, 
            fixed: 'right',
            render: (_, record) => (
                <Button size="small" type="link" onClick={() => handleShowDetails(record)}>Xem chi tiết</Button>
            )
        },
    ];

    return (
        <PermissionGuard requiredLevel={REQUIRED_LEVEL}>
            <Space direction="vertical" size={24} style={{ display: 'flex' }}>
                <Title level={3}><BookOutlined /> Kho Tri Thức Lỗi (Root Cause Analysis - RCA)</Title>
                <Text type="secondary">
                    Danh mục này tổng hợp các lỗi đã được giải quyết, cung cấp nguyên nhân gốc rễ và hành động khắc phục đã được xác minh.
                </Text>

                <Card className="tw-shadow-md">
                    <Row gutter={16}>
                        <Col span={6}>
                            <Select
                                placeholder="Lọc theo Mã Máy"
                                allowClear
                                style={{ width: '100%' }}
                                onChange={(value) => setFilters(f => ({ ...f, machineId: value }))}
                            >
                                {['M-CNC-101', 'M-LASER-102', 'M-PRESS-103', 'M-ROBOT-104'].map(id => <Option key={id} value={id}>{id}</Option>)}
                            </Select>
                        </Col>
                        <Col span={6}>
                            <Select
                                placeholder="Lọc theo Mã Lỗi"
                                allowClear
                                showSearch
                                style={{ width: '100%' }}
                                onChange={(value) => setFilters(f => ({ ...f, faultCode: value }))}
                            >
                                {/* SỬ DỤNG DANH MỤC LỖI TỰ ĐỘNG */}
                                {(FAULT_CATALOG || []).map(f => <Option key={f.code} value={f.code}>{f.code} - {f.description}</Option>)}
                            </Select>
                        </Col>
                        <Col span={6}>
                             <Statistic title="Số lỗi đã ghi nhận RCA" value={resolvedAlerts.length} prefix={<TagOutlined />} />
                        </Col>
                        <Col span={6}>
                             <Link href='/alerts/fault-management'>
                                 <Button icon={<TagOutlined />} type="default">
                                    Quản lý Danh mục Mã Lỗi
                                 </Button>
                             </Link>
                        </Col>
                    </Row>
                </Card>

                <Table
                    columns={columns}
                    dataSource={resolvedAlerts}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                    bordered
                />

                {/* Modal Chi tiết RCA */}
                <Modal
                    title={`Chi tiết RCA: ${selectedRCA?.faultCode}`}
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={<Button onClick={() => setIsModalVisible(false)}>Đóng</Button>}
                >
                    <Space direction="vertical" style={{ display: 'flex' }}>
                        <Descriptions bordered size="small" column={1}>
                             <Descriptions.Item label="Mô tả Lỗi">{selectedRCA?.description}</Descriptions.Item>
                             <Descriptions.Item label="Hạng mục">{selectedRCA?.category}</Descriptions.Item>
                             <Descriptions.Item label="Máy liên quan">{selectedRCA?.machineId}</Descriptions.Item>
                             <Descriptions.Item label="Số lần Lặp lại">{selectedRCA?.occurrence}</Descriptions.Item>
                        </Descriptions>
                         <Divider orientation="left">Nguyên nhân Gốc rễ & Khắc phục</Divider>
                         <Text strong>Nguyên nhân Gốc rễ:</Text>
                         <Text>{selectedRCA?.rootCause}</Text>
                         <Text strong className='tw-mt-2'>Hành động Khắc phục:</Text>
                         <Text>{selectedRCA?.actionTaken}</Text>
                    </Space>
                </Modal>
            </Space>
        </PermissionGuard>
    );
};

export default FaultKnowledgeBasePage;