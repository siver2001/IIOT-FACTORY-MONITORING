import React, { useState } from 'react';
import { Typography, Space, Table, Card, Row, Col, Statistic, Tag, Button, Modal, Form, Input, Select, DatePicker } from 'antd';
import { ClusterOutlined, ClockCircleOutlined, SettingOutlined, EditOutlined, ToolOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAssetManagement } from '../hooks/useAssetManagement';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const AssetManagementPage = () => {
    const { assets, assetSummary, updateAsset } = useAssetManagement();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentAsset, setCurrentAsset] = useState(null);
    const [form] = Form.useForm();

    const handleEdit = (record) => {
        setCurrentAsset(record);
        form.setFieldsValue({
            ...record,
            purchaseDate: dayjs(record.purchaseDate),
            warrantyEndDate: dayjs(record.warrantyEndDate),
            lastPMDate: dayjs(record.lastPMDate),
            nextPMDate: dayjs(record.nextPMDate),
            isUnderWarranty: record.isUnderWarranty ? 'Yes' : 'No',
        });
        setIsModalVisible(true);
    };

    const handleSave = (values) => {
        const updatedAsset = {
            ...currentAsset,
            ...values,
            purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
            warrantyEndDate: values.warrantyEndDate.format('YYYY-MM-DD'),
            lastPMDate: values.lastPMDate.format('YYYY-MM-DD'),
            nextPMDate: values.nextPMDate.format('YYYY-MM-DD'),
            isUnderWarranty: values.isUnderWarranty === 'Yes',
        };
        updateAsset(updatedAsset);
        setIsModalVisible(false);
    };

    const columns = [
        { title: 'Mã Tài sản', dataIndex: 'id', key: 'id', fixed: 'left' },
        { title: 'Tên & Model', key: 'name', render: (text, record) => (
            <Space direction="vertical" size={0}>
                <strong>{record.name}</strong>
                <Tag color="cyan">{record.model}</Tag>
            </Space>
        )},
        { title: 'Nhà sản xuất', dataIndex: 'manufacturer', key: 'manufacturer' },
        { 
            title: 'Bảo hành', 
            key: 'warranty', 
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Tag color={record.isUnderWarranty ? 'green' : 'red'}>
                        {record.isUnderWarranty ? 'Còn BH' : 'Hết BH'}
                    </Tag>
                    <small>Hết hạn: {dayjs(record.warrantyEndDate).format('YYYY-MM-DD')}</small>
                </Space>
            )
        },
        { 
            title: 'Bảo dưỡng (PM)', 
            key: 'pm', 
            render: (text, record) => {
                const isDueSoon = dayjs(record.nextPMDate).diff(dayjs(), 'day') <= 30;
                return (
                    <Space direction="vertical" size={0}>
                        <Tag color={isDueSoon ? 'volcano' : 'blue'}>
                            {isDueSoon ? 'SẮP ĐẾN HẠN' : 'Chu kỳ: ' + record.maintenanceCycle + ' ngày'}
                        </Tag>
                        <small>PM Kế tiếp: {dayjs(record.nextPMDate).format('YYYY-MM-DD')}</small>
                    </Space>
                )
            }
        },
        { title: 'Vị trí', dataIndex: 'location', key: 'location', width: 100 },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: 100,
            render: (_, record) => (
                <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
            ),
        },
    ];

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><ClusterOutlined /> Quản lý Tài sản (Asset Management)</Title>

            <Row gutter={24}>
                <Col span={8}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #1677ff' }}>
                        <Statistic title="Tổng số Tài sản" value={assetSummary.totalAssets} prefix={<ClusterOutlined />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #ff4d4f' }}>
                        <Statistic 
                            title="Sắp hết BH (30 ngày)" 
                            value={assetSummary.soonToExpireWarranty.length} 
                            prefix={<ClockCircleOutlined />} 
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #faad14' }}>
                        <Statistic 
                            title="Sắp đến hạn PM (30 ngày)" 
                            value={assetSummary.soonDuePM.length} 
                            prefix={<ToolOutlined />} 
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={assets}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1200 }}
                bordered
            />

            {/* Modal Chỉnh sửa Tài sản */}
            <Modal
                title={`Chỉnh sửa Tài sản: ${currentAsset?.id}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                okText="Lưu Thay đổi"
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Tên Tài sản" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="model" label="Model" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="purchaseDate" label="Ngày Mua">
                                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="warrantyEndDate" label="Ngày Hết BH">
                                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                             <Form.Item name="lastPMDate" label="PM Cuối">
                                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="nextPMDate" label="PM Kế tiếp" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="maintenanceCycle" label="Chu kỳ Bảo dưỡng (ngày)">
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
};

export default AssetManagementPage;