import React, { useState } from 'react';
import { Typography, Space, Table, Button, Tag, Modal, Form, Input, InputNumber, Divider, Statistic } from 'antd';
// THÊM EyeOutlined
import { BuildOutlined, PlayCircleOutlined, StopOutlined, PlusOutlined, SettingOutlined, EyeOutlined } from '@ant-design/icons'; 
import { useBatch } from './useBatch';
import BatchReportModal from './BatchReportModal'; // <-- IMPORT MỚI

const { Title } = Typography;

const BatchControl = () => {
    const { batches, runningBatch, isSimulating, createBatch, startBatch, stopBatch } = useBatch();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false); // <-- State mới cho Modal Report
    const [selectedBatch, setSelectedBatch] = useState(null); // <-- State mới lưu lô được chọn
    const [form] = Form.useForm();

    const handleCreate = (values) => {
        if (createBatch(values)) {
            setIsModalVisible(false);
            form.resetFields();
        }
    };
    
    // Hàm hiển thị báo cáo
    const handleViewReport = (batch) => {
        setSelectedBatch(batch);
        setIsReportModalVisible(true);
    }

    const columns = [
        { title: 'Mã Lô', dataIndex: 'id', key: 'id' },
        { title: 'Tên Lô', dataIndex: 'name', key: 'name' },
        { title: 'Mục tiêu (Qty)', dataIndex: 'targetQty', key: 'targetQty' },
        { 
            title: 'Hiện tại (Qty)', 
            dataIndex: 'currentQty', 
            key: 'currentQty',
            render: (qty, record) => (
                <Statistic 
                    value={qty} 
                    suffix={` / ${record.targetQty}`} 
                    valueStyle={{ fontSize: 14 }}
                />
            )
        },
        { title: 'Thời gian Bắt đầu', dataIndex: 'startTime', key: 'startTime' },
        { 
            title: 'Tóm tắt Yield', // <-- CỘT MỚI
            key: 'summary',
            render: (_, record) => {
                if (record.report) {
                    const color = record.report.yieldRate > 95 ? 'success' : 'error';
                    return (
                        <Tag color={color} style={{ fontSize: 12, padding: '5px 10px' }}>
                            Yield: {record.report.yieldRate}%
                        </Tag>
                    );
                }
                return '-';
            }
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status', 
            render: (status) => (
                <Tag color={status === 'Running' ? 'processing' : status === 'Completed' ? 'success' : 'default'}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {record.status === 'New' && (
                        <Button 
                            size="small" 
                            icon={<PlayCircleOutlined />} 
                            onClick={() => startBatch(record.id)} 
                            disabled={runningBatch}
                            type="primary"
                        >
                            Bắt đầu
                        </Button>
                    )}
                    {record.status === 'Running' && (
                        <Button 
                            size="small" 
                            icon={<StopOutlined />} 
                            onClick={stopBatch} 
                            danger
                        >
                            Dừng
                        </Button>
                    )}
                    {/* NÚT XEM BÁO CÁO MỚI */}
                    {(record.status === 'Completed' || record.status === 'Stopped') && (
                         <Button 
                            size="small" 
                            icon={<EyeOutlined />} 
                            onClick={() => handleViewReport(record)}
                        >
                            Xem Báo cáo
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><SettingOutlined /> Quản lý & Mô phỏng Lô Sản phẩm (Batch)</Title>
            
            <Divider orientation="left">Thông tin Lô Sản xuất</Divider>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setIsModalVisible(true)}
                >
                    Tạo Lô Mới
                </Button>
                {runningBatch && (
                    <Tag 
                        icon={isSimulating ? <BuildOutlined spin /> : <StopOutlined />} 
                        color={isSimulating ? 'processing' : 'error'} 
                        style={{ fontSize: 16, padding: '5px 10px' }}
                    >
                        {isSimulating ? `Đang Sản xuất Lô: ${runningBatch.name}` : `Lô ${runningBatch.name} Đang Dừng`}
                    </Tag>
                )}
            </div>
            
            <Table
                columns={columns}
                dataSource={batches}
                rowKey="id"
                pagination={false}
                bordered
            />

            {/* Modal Tạo Lô Mới (Giữ nguyên) */}
            <Modal
                title="Tạo Lô Sản phẩm Mới"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreate}
                >
                    <Form.Item
                        name="name"
                        label="Tên Lô Sản phẩm"
                        rules={[{ required: true, message: 'Vui lòng nhập tên lô!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="targetQty"
                        label="Số lượng Mục tiêu"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            Tạo Lô
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            
            {/* Modal Báo cáo Chi tiết MỚI */}
            <BatchReportModal 
                isVisible={isReportModalVisible}
                onCancel={() => setIsReportModalVisible(false)}
                batch={selectedBatch}
            />
        </Space>
    );
};

export default BatchControl;