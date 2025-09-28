// FRONTEND/src/Admin/AssetManagementPage.jsx

import React, { useState } from 'react';
import { 
    // Đã thêm Popconfirm
    Typography, Space, Table, Card, Row, Col, Statistic, Tag, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Popconfirm 
} from 'antd';
import { 
    // Đã thêm PlusOutlined và DeleteOutlined
    ClusterOutlined, ClockCircleOutlined, SettingOutlined, EditOutlined, ToolOutlined, ProfileOutlined, PlusOutlined, DeleteOutlined 
} from '@ant-design/icons';
import { useAssetManagement } from '../hooks/useAssetManagement';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom'; // Import Link

const { Title } = Typography;
const { Option } = Select;

// Giá trị khởi tạo cho tài sản mới
const initialNewAsset = {
    id: `A-${Date.now().toString().slice(-4)}`, 
    name: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    location: 'Khu A',
    purchaseDate: dayjs(),
    warrantyEndDate: dayjs().add(1, 'year'),
    isUnderWarranty: 'Yes',
    lastPMDate: dayjs(),
    nextPMDate: dayjs().add(90, 'day'),
    maintenanceCycle: 90,
};


const AssetManagementPage = () => {
    // Giả định hook useAssetManagement đã được cập nhật để lộ ra addAsset và deleteAsset
    // (Trong hệ thống thật, bạn phải thêm logic addAsset và deleteAsset vào useAssetManagement.js)
    const { assets, assetSummary, updateAsset, deleteAsset, addAsset } = useAssetManagement(); 
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentAsset, setCurrentAsset] = useState(null);
    const [isNewAsset, setIsNewAsset] = useState(false); // TRẠNG THÁI MỚI
    const [form] = Form.useForm();

    // HÀM MỚI: Mở modal để thêm mới
    const handleAdd = () => {
        const newAssetData = initialNewAsset;
        setCurrentAsset(newAssetData);
        setIsNewAsset(true);
        form.setFieldsValue({
            ...newAssetData,
            purchaseDate: dayjs(newAssetData.purchaseDate),
            warrantyEndDate: dayjs(newAssetData.warrantyEndDate),
            lastPMDate: dayjs(newAssetData.lastPMDate),
            nextPMDate: dayjs(newAssetData.nextPMDate),
            isUnderWarranty: 'Yes', // Mặc định là "Còn bảo hành"
        });
        setIsModalVisible(true);
    };


    const handleEdit = (record) => {
        setCurrentAsset(record);
        setIsNewAsset(false); // Chế độ chỉnh sửa
        form.setFieldsValue({
            ...record,
            purchaseDate: dayjs(record.purchaseDate),
            warrantyEndDate: dayjs(record.warrantyEndDate),
            lastPMDate: dayjs(record.lastPMDate),
            nextPMDate: dayjs(record.nextPMDate),
            isUnderWarranty: record.isUnderWarranty ? 'Yes' : 'No', // Map boolean sang string cho Select
        });
        setIsModalVisible(true);
    };

    const handleSave = (values) => {
        const payload = {
            ...currentAsset, // Giữ lại các thuộc tính không hiển thị trên form (như serialNumber)
            ...values,
            purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
            warrantyEndDate: values.warrantyEndDate.format('YYYY-MM-DD'),
            lastPMDate: values.lastPMDate.format('YYYY-MM-DD'),
            nextPMDate: values.nextPMDate.format('YYYY-MM-DD'),
            isUnderWarranty: values.isUnderWarranty === 'Yes',
        };

        if (isNewAsset) {
            // Giả định addAsset tồn tại trong hook
            addAsset(payload); 
        } else {
            updateAsset(payload);
        }
        setIsModalVisible(false);
        setIsNewAsset(false);
        setCurrentAsset(null);
    };

    // HÀM MỚI: Xử lý xóa (Giả định deleteAsset tồn tại trong hook)
    const handleDelete = (assetId) => {
        if (deleteAsset) {
            deleteAsset(assetId);
        }
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
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Link to={`/maintenance/profile/${record.id}`}>
                        <Button size="small" icon={<ProfileOutlined />}>Hồ sơ</Button>
                    </Link>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                    {/* CHỨC NĂNG MỚI: Xóa Tài sản */}
                    <Popconfirm
                        title={`Xóa tài sản ${record.id}?`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button size="small" icon={<DeleteOutlined />} danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><ClusterOutlined /> Quản lý Tài sản (Asset Management)</Title>
            
            {/* KPI Cards */}
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

            {/* NÚT THÊM MỚI */}
             <Row gutter={24}>
                 <Col span={24} style={{ textAlign: 'right' }}>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={handleAdd}
                    >
                        Thêm Tài sản Mới
                    </Button>
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
            
            {/* Modal Thêm/Chỉnh sửa */}
            <Modal
                title={isNewAsset ? "Thêm Tài sản Mới" : `Chỉnh sửa Tài sản: ${currentAsset?.id}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                okText={isNewAsset ? "Thêm Tài sản" : "Lưu Thay đổi"}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    
                    {/* Chỉ hiển thị Mã Tài sản nếu đang thêm mới */}
                    {isNewAsset && (
                         <Form.Item name="id" label="Mã Tài sản (Tự động)">
                            <Input disabled />
                        </Form.Item>
                    )}
                    
                    <Form.Item name="location" label="Vị trí lắp đặt" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

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
                            <Form.Item name="manufacturer" label="Nhà sản xuất">
                                <Input />
                            </Form.Item>
                        </Col>
                         {/* TRƯỜNG MỚI: Trạng thái Bảo hành */}
                         <Col span={12}>
                            <Form.Item name="isUnderWarranty" label="Trạng thái Bảo hành" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="Yes">Còn bảo hành</Option>
                                    <Option value="No">Hết bảo hành</Option>
                                </Select>
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
                    
                    <Form.Item name="maintenanceCycle" label="Chu kỳ Bảo dưỡng (ngày)">
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    
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
                </Form>
            </Modal>
        </Space>
    );
};

export default AssetManagementPage;