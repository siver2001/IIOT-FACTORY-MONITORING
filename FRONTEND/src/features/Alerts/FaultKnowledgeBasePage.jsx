// FRONTEND/src/features/Alerts/FaultKnowledgeBasePage.jsx

import React, { useMemo, useState } from 'react';
import { Typography, Space, Table, Tag, Input, Select, Divider, Card, Popover, Button, Row, Col } from 'antd';
import { 
    BookOutlined, SearchOutlined, ToolOutlined, TagsOutlined, InfoCircleOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useAlertManagement, FAULT_CATALOG } from '../../hooks/useAlertManagement';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// Component chính
const FaultKnowledgeBasePage = () => {
    // Sử dụng hook quản lý Alert
    const { alerts, MACHINE_IDS } = useAlertManagement();
    
    // State quản lý các bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFaultCode, setSelectedFaultCode] = useState(null);
    const [selectedMachine, setSelectedMachine] = useState(null);

    // Dữ liệu chỉ lấy những alert đã được giải quyết (Resolved)
    const resolvedAlerts = useMemo(() => {
        return alerts
            .filter(a => a.status === 'Resolved')
            .map(a => {
                let resolvedData = { cause: 'Không có', action: 'Không có' };
                try {
                    resolvedData = JSON.parse(a.resolvedInfo);
                } catch (e) {
                    // console.error("Error parsing resolvedInfo:", e);
                }
                return { ...a, resolvedData };
            });
    }, [alerts]);

    // Áp dụng bộ lọc cho dữ liệu hiển thị
    const filteredData = useMemo(() => {
        let data = resolvedAlerts;
        
        // Lọc theo từ khóa tìm kiếm (message, cause, action)
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(item => 
                item.message.toLowerCase().includes(lowerSearch) ||
                item.resolvedData.cause.toLowerCase().includes(lowerSearch) ||
                item.resolvedData.action.toLowerCase().includes(lowerSearch)
            );
        }

        // Lọc theo Mã Lỗi
        if (selectedFaultCode) {
            data = data.filter(item => item.faultCode === selectedFaultCode);
        }
        
        // Lọc theo Mã Máy
        if (selectedMachine) {
            data = data.filter(item => item.machineId === selectedMachine);
        }

        return data;
    }, [resolvedAlerts, searchTerm, selectedFaultCode, selectedMachine]);

    // Định nghĩa cột bảng
    const columns = useMemo(() => ([
        { 
            title: 'Mã Lỗi', 
            dataIndex: 'faultCode', 
            key: 'faultCode',
            width: 120,
            render: (code) => <Tag color="geekblue" icon={<TagsOutlined />}>{code}</Tag>
        },
        { title: 'Mã Máy', dataIndex: 'machineId', key: 'machineId', width: 100 },
        { 
            title: 'Mô tả Sự cố', 
            dataIndex: 'message', 
            key: 'message', 
            width: 250, 
            ellipsis: true 
        },
        { 
            title: 'Nguyên nhân (Gốc rễ)', 
            dataIndex: ['resolvedData', 'cause'], 
            key: 'cause', 
            width: 250, 
            ellipsis: true 
        },
        { 
            title: 'Thời gian Khắc phục', 
            dataIndex: 'timestamp', 
            key: 'timestamp', 
            width: 180,
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm')
        },
        { 
            title: 'Người giải quyết', 
            dataIndex: 'acknowledgedBy', 
            key: 'acknowledgedBy',
            width: 120,
        },
        { 
            title: 'Hành động', 
            key: 'action', 
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Popover
                    title={<Text strong><InfoCircleOutlined /> Chi tiết Khắc phục</Text>}
                    content={
                        <Space direction="vertical" style={{ maxWidth: 350 }}>
                            <Text strong><ToolOutlined /> Nguyên nhân Gốc rễ:</Text>
                            <Text>{record.resolvedData.cause}</Text>
                            <Divider style={{ margin: '8px 0' }} />
                            <Text strong><CheckCircleOutlined /> Hành động Khắc phục:</Text>
                            <Text>{record.resolvedData.action}</Text>
                        </Space>
                    }
                    trigger="click"
                >
                    <Button size="small" icon={<InfoCircleOutlined />}>Xem chi tiết</Button>
                </Popover>
            )
        },
    ]), []);


    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><BookOutlined /> Kho tri thức Lỗi (Knowledge Base)</Title>
            <Text type="secondary">Tra cứu các sự cố đã được giải quyết để tìm hiểu nguyên nhân gốc rễ và hành động khắc phục đã được ghi nhận.</Text>

            <Divider orientation="left">Bộ lọc & Tìm kiếm (Trong {resolvedAlerts.length} bản ghi)</Divider>
            
            {/* Filter Panel */}
            <Card className="tw-shadow-lg">
                <Row gutter={[16, 16]} align="middle">
                    <Col span={8}>
                        <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Tìm kiếm Tự do (Message, Nguyên nhân, Khắc phục):</label>
                        <Input 
                            placeholder="Nhập từ khóa tìm kiếm" 
                            prefix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col span={6}>
                        <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Lọc theo Mã Lỗi:</label>
                        <Select 
                            placeholder="Chọn mã lỗi" 
                            allowClear 
                            showSearch 
                            style={{ width: '100%' }}
                            onChange={setSelectedFaultCode}
                            optionFilterProp="children"
                        >
                            {FAULT_CATALOG.map(fault => (
                                <Option key={fault.code} value={fault.code}>
                                    <Tag color="geekblue">{fault.code}</Tag> {fault.description}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Lọc theo Mã Máy:</label>
                        <Select 
                            placeholder="Chọn máy" 
                            allowClear 
                            showSearch 
                            style={{ width: '100%' }}
                            onChange={setSelectedMachine}
                        >
                            {MACHINE_IDS.map(id => <Option key={id} value={id}>{id}</Option>)}
                        </Select>
                    </Col>
                    <Col span={4} style={{ textAlign: 'right' }}>
                        <Text strong className="tw-text-lg">Kết quả: {filteredData.length} bản ghi</Text>
                    </Col>
                </Row>
            </Card>

            {/* Bảng Tri thức */}
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
                bordered
                size="middle"
                className="tw-shadow-xl"
            />
        </Space>
    );
};

export default FaultKnowledgeBasePage;