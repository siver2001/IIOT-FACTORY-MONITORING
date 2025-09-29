// FRONTEND/src/features/Alerts/FaultCatalogManagementPage.jsx

import React, { useState, useMemo } from 'react';
import { 
    // FIX: ĐÃ THÊM Row và Col vào import
    Typography, Space, Table, Tag, Button, Modal, Form, Input, Select, Popconfirm, Divider, Card, Row, Col 
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, TagOutlined } from '@ant-design/icons';
import { useFaultCatalog, FAULT_CATEGORIES } from '../../hooks/useFaultCatalog';
import PermissionGuard from '../../components/PermissionGuard'; 

const { Title, Text } = Typography;
const { Option } = Select;

// Định nghĩa Cấp độ quyền hạn cần thiết: Chỉ Admin (0) và Manager (1) được phép CRUD
const REQUIRED_LEVEL = 1; 

const FaultCatalogManagementPage = () => {
    // Lấy FAULT_CATALOG động và các hàm quản lý
    const { FAULT_CATALOG, saveFaultCode, deleteFaultCode } = useFaultCatalog();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentFault, setCurrentFault] = useState(null);
    const [form] = Form.useForm();

    const handleOpenModal = (fault) => {
        setCurrentFault(fault);
        setIsModalVisible(true);
        if (fault) {
            form.setFieldsValue(fault);
        } else {
            form.resetFields();
            form.setFieldsValue({ priority: 'Warning', category: 'Tùy chỉnh' });
        }
    };

    const handleSave = (values) => {
        const isNew = !currentFault;
        // Gọi hàm saveFaultCode từ hook
        const result = saveFaultCode(values, isNew);
        if (result) {
            setIsModalVisible(false);
            setCurrentFault(null);
        }
    };
    
    // Cấu hình bảng
    const columns = useMemo(() => [
        { title: 'Mã Lỗi', dataIndex: 'code', key: 'code', width: 120, fixed: 'left', render: (text) => <Tag color="geekblue" style={{ fontWeight: 'bold' }}>{text}</Tag> },
        { title: 'Mô tả Chi tiết', dataIndex: 'description', key: 'description', ellipsis: true },
        { 
            title: 'Hạng mục', 
            dataIndex: 'category', 
            key: 'category', 
            width: 150,
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        { 
            title: 'Độ ưu tiên', 
            dataIndex: 'priority', 
            key: 'priority', 
            width: 130,
            render: (p) => <Tag color={p === 'Critical' ? 'red' : p === 'Error' ? 'volcano' : 'gold'}>{p}</Tag>
        },
        { 
            title: 'Hành động', 
            key: 'action', 
            width: 180, 
            fixed: 'right',
            render: (_, record) => (
                // Bảo vệ nút CRUD
                <PermissionGuard requiredLevel={REQUIRED_LEVEL}>
                    <Space size="small">
                        <Button icon={<EditOutlined />} size="small" onClick={() => handleOpenModal(record)}>Sửa</Button>
                        <Popconfirm
                            title={`Xác nhận xóa Mã lỗi ${record.code}?`}
                            onConfirm={() => deleteFaultCode(record.code)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
                        </Popconfirm>
                    </Space>
                </PermissionGuard>
            ),
        },
    ], [deleteFaultCode]);

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><TagOutlined /> Quản lý Danh mục Mã Lỗi (Fault Catalog)</Title>
            <Text type="secondary">
                Đây là danh sách mã lỗi được sử dụng trong việc Giải quyết Cảnh báo và tạo Lệnh công việc. Danh mục này đảm bảo tính nhất quán của dữ liệu lỗi.
            </Text>
            
            <PermissionGuard requiredLevel={REQUIRED_LEVEL} hideIfNoPermission={false}>
                <Divider />
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => handleOpenModal(null)}
                    className="tw-mb-4"
                >
                    Thêm Mã Lỗi Mới
                </Button>
            </PermissionGuard>

            <Table
                columns={columns}
                dataSource={FAULT_CATALOG}
                rowKey="code"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
                bordered
            />

            {/* Modal Thêm/Sửa Mã Lỗi */}
            <Modal
                title={currentFault ? `Chỉnh sửa Mã lỗi: ${currentFault.code}` : "Thêm Mã Lỗi Mới"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item 
                        name="code" 
                        label="Mã Lỗi (Ví dụ: TE-001)" 
                        rules={[{ required: true, message: 'Vui lòng nhập Mã lỗi' }]}
                    >
                        <Input disabled={!!currentFault} style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả Chi tiết" rules={[{ required: true }]}>
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    
                    {/* SỬ DỤNG ROW VÀ COL */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="category" label="Hạng mục Lỗi">
                                <Select>
                                    {FAULT_CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="priority" label="Độ ưu tiên">
                                <Select>
                                    <Option value="Critical">Critical</Option>
                                    <Option value="Error">Error</Option>
                                    <Option value="Warning">Warning</Option>
                                    <Option value="Info">Info</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {currentFault ? "Lưu Thay Đổi" : "Thêm Mã Lỗi"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
};

export default FaultCatalogManagementPage;