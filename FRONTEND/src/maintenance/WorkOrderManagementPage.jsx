// FRONTEND/src/maintenance/WorkOrderManagementPage.jsx
import React, { useState, useMemo } from 'react';
import { Table, Button, Tag, Select, Input, Modal, Form, DatePicker, Row, Col, Card, Space, Popconfirm, InputNumber, Typography } from 'antd';
import { PlusOutlined, EditOutlined, CheckCircleOutlined, SettingOutlined, ToolOutlined, UploadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useWorkOrder, WORK_ORDER_STATUS } from './useWorkOrder';
import { PARTS_CATALOG } from './PartsCatalog';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

// Hàm mock export CSV cho WO (Giả định xuất dữ liệu hiển thị)
const mockExportWOsToCSV = (data, filename = 'work_orders_export.csv') => {
    const exportColumns = [
        { dataIndex: 'id', title: 'Mã WO' },
        { dataIndex: 'machineCode', title: 'Mã Máy' },
        { dataIndex: 'title', title: 'Tiêu đề' },
        { dataIndex: 'type', title: 'Loại' },
        { dataIndex: 'status', title: 'Trạng thái' },
        { dataIndex: 'priority', title: 'Ưu tiên' },
        { dataIndex: 'assignedTo', title: 'Người gán' },
        { dataIndex: 'dueDate', title: 'Hạn chót' },
        { dataIndex: 'completedAt', title: 'Ngày hoàn thành' },
        { dataIndex: 'laborHours', title: 'Giờ công' },
    ];
    
    const headers = exportColumns.map(col => col.title);
    let csv = headers.join(',') + '\n';

    data.forEach(row => {
        const rowData = exportColumns
            .map(col => {
                let value = row[col.dataIndex] || '';
                
                if (col.dataIndex === 'dueDate' || col.dataIndex === 'completedAt') {
                    value = value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '';
                }

                value = String(value).replace(/"/g, '""').replace(/\n/g, ' '); 
                return `"${value}"`;
            })
            .join(',');
        csv += rowData + '\n';
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' }); 
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};


const WorkOrderManagementPage = () => {
    const { workOrders, ASSIGNEES, createWorkOrder, completeWorkOrder, updateWorkOrder, mockBulkImport } = useWorkOrder();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [currentWo, setCurrentWo] = useState(null);
    const [form] = Form.useForm();
    const [filters, setFilters] = useState({ status: null, type: null, machine: null });

    // --- Logic Lọc và Hiển thị Bảng ---
    const filteredOrders = useMemo(() => {
        return workOrders.filter(wo => {
            let match = true;
            if (filters.status && wo.status !== filters.status) match = false;
            if (filters.type && wo.type !== filters.type) match = false;
            if (filters.machine && !wo.machineCode.toLowerCase().includes(filters.machine.toLowerCase())) match = false;
            return match;
        });
    }, [workOrders, filters]);

    // --- Logic Modal Tạo/Chỉnh sửa ---
    const handleOpenModal = (wo) => {
        setCurrentWo(wo);
        setIsModalOpen(true);
        if (wo) {
            form.setFieldsValue({ ...wo, dueDate: dayjs(wo.dueDate) });
        } else {
            form.resetFields();
            form.setFieldsValue({ type: 'CM', priority: 'Trung bình', dueDate: dayjs().add(1, 'day') });
        }
    };

    const handleSave = (values) => {
        if (currentWo) {
            updateWorkOrder(currentWo.id, { ...values, dueDate: values.dueDate.toDate() });
        } else {
            createWorkOrder({ ...values, dueDate: values.dueDate.toDate() });
        }
        setIsModalOpen(false);
        setCurrentWo(null);
    };

    // --- Logic Modal Hoàn thành WO và quản lý phụ tùng + Giờ công ---
    const handleOpenCompleteModal = (wo) => {
        setCurrentWo(wo);
        setIsCompleteModalOpen(true);
        const parts = wo.partsUsed && wo.partsUsed.length > 0 
            ? wo.partsUsed.map(p => ({ key: p.partId, ...p })) 
            : [{ key: dayjs().valueOf() }];

        form.setFieldsValue({ 
            completionNotes: wo.completionNotes, 
            parts: parts,
            laborHours: wo.laborHours || 1, // Lấy giờ công đã lưu hoặc mặc định
        });
    };

    const handleComplete = (values) => {
        const partsUsed = values.parts 
            ? values.parts.filter(p => p.partId).map(p => ({ partId: p.partId, qty: p.qty || 1 }))
            : [];
        
        completeWorkOrder(currentWo.id, { 
            completionNotes: values.completionNotes, 
            partsUsed: partsUsed,
            laborHours: values.laborHours, // TRUYỀN GIỜ CÔNG VÀO HOOK
        });

        setIsCompleteModalOpen(false);
        setCurrentWo(null);
    };
    
    const handleExport = () => {
        mockExportWOsToCSV(filteredOrders, `danh_sach_wo_${dayjs().format('YYYYMMDD')}.csv`);
    };

    // --- Cấu hình Bảng ---
    const statusTag = (status) => {
        let color = 'default';
        if (status === WORK_ORDER_STATUS.PENDING) color = 'volcano';
        else if (status === WORK_ORDER_STATUS.IN_PROGRESS) color = 'blue';
        else if (status === WORK_ORDER_STATUS.COMPLETED) color = 'green';
        return <Tag color={color}>{status}</Tag>;
    };

    const columns = [
        { title: 'Mã WO', dataIndex: 'id', key: 'id', width: 100 },
        { title: 'Mã Máy', dataIndex: 'machineCode', key: 'machineCode', width: 100 },
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title', ellipsis: true },
        { title: 'Loại', dataIndex: 'type', key: 'type', render: (type) => <Tag color={type === 'PM' ? 'cyan' : (type === 'CM' ? 'red' : 'gold')}>{type}</Tag> },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: statusTag },
        { title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', render: (p) => <Tag color={p === 'Cao' ? 'red' : p === 'Trung bình' ? 'orange' : 'green'}>{p}</Tag> },
        { title: 'Người gán', dataIndex: 'assignedTo', key: 'assignedTo', width: 120 },
        { title: 'Hạn chót', dataIndex: 'dueDate', key: 'dueDate', render: (date) => dayjs(date).format('DD/MM/YYYY'), sorter: (a, b) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix() },
        { 
            title: 'Hành động', 
            key: 'action', 
            width: 150, 
            fixed: 'right',
            render: (_, record) => (
                <div className='tw-space-x-2'>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleOpenModal(record)} disabled={record.status === WORK_ORDER_STATUS.COMPLETED}/>
                    {record.status !== WORK_ORDER_STATUS.COMPLETED && (
                        <Button 
                            icon={<CheckCircleOutlined />} 
                            size="small" 
                            type="primary" 
                            onClick={() => handleOpenCompleteModal(record)}
                        >
                            Hoàn thành
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="tw-p-6">
            <h1 className="tw-text-2xl tw-font-bold tw-mb-4 tw-text-gray-800"><ToolOutlined /> Quản lý Lệnh công việc ({workOrders.length} WO)</h1>
            
            <Card className="tw-mb-6 tw-shadow-md">
                <Row gutter={[16, 16]} align="middle">
                    <Col>
                        <Input 
                            placeholder="Mã máy..." 
                            onChange={(e) => setFilters(f => ({ ...f, machine: e.target.value }))}
                            className="tw-w-40"
                            allowClear
                        />
                    </Col>
                    <Col>
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            className="tw-w-40"
                            onChange={(value) => setFilters(f => ({ ...f, status: value }))}
                        >
                            {Object.values(WORK_ORDER_STATUS).map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                    </Col>
                    <Col>
                        <Select
                            placeholder="Loại WO"
                            allowClear
                            className="tw-w-40"
                            onChange={(value) => setFilters(f => ({ ...f, type: value }))}
                        >
                            <Option value="CM">CM (Sự cố)</Option>
                            <Option value="PM">PM (Định kỳ)</Option>
                            <Option value="PdM">PdM (Dự đoán)</Option>
                        </Select>
                    </Col>
                    <Col className='tw-ml-auto'>
                        <Space>
                            <Button 
                                icon={<UploadOutlined />} 
                                onClick={mockBulkImport} // CHỨC NĂNG IMPORT MỚI
                            >
                                Import Lịch sử WO (Mock)
                            </Button>
                            <Button
                                icon={<FileExcelOutlined />} 
                                onClick={handleExport} // Export CSV
                            >
                                Export CSV
                            </Button>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={() => handleOpenModal(null)}
                                className="modern-button"
                            >
                                Tạo WO Mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Table
                dataSource={filteredOrders}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
                className="tw-shadow-xl"
            />

            {/* Modal Tạo/Chỉnh sửa WO giữ nguyên */}
            <Modal
                title={currentWo ? "Chỉnh sửa Lệnh công việc" : "Tạo Lệnh công việc Mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ type: 'CM', priority: 'Trung bình' }}>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="machineCode" label="Mã Máy" rules={[{ required: true, message: 'Vui lòng nhập mã máy (ví dụ: M-101)' }]}>
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="type" label="Loại WO" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="CM">CM (Sự cố)</Option>
                                    <Option value="PM">PM (Định kỳ)</Option>
                                    <Option value="PdM">PdM (Dự đoán)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="priority" label="Ưu tiên" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="Cao">Cao</Option>
                                    <Option value="Trung bình">Trung bình</Option>
                                    <Option value="Thấp">Thấp</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="assignedTo" label="Người Gán">
                        <Select allowClear>
                            {ASSIGNEES.map(a => <Option key={a} value={a}>{a}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="dueDate" label="Hạn chót" rules={[{ required: true, message: 'Vui lòng chọn hạn chót' }]}>
                        <DatePicker showTime format="DD/MM/YYYY HH:mm" className="tw-w-full" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item className="tw-mt-4">
                        <Button type="primary" htmlType="submit" block className="modern-button">
                            {currentWo ? "Lưu Thay Đổi" : "Tạo WO"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Hoàn thành WO và Quản lý Phụ tùng + Giờ công */}
            <Modal
                title={`Hoàn thành WO: ${currentWo?.id}`}
                open={isCompleteModalOpen}
                onCancel={() => setIsCompleteModalOpen(false)}
                footer={null}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleComplete}>
                    {/* TRƯỜNG GIỜ CÔNG MỚI */}
                     <Form.Item 
                        name="laborHours" 
                        label={<Text strong>Giờ công thực tế (Labor Hours)</Text>}
                        rules={[{ required: true, type: 'number', min: 0.1, message: 'Vui lòng nhập giờ công > 0' }]}
                    >
                        <InputNumber min={0.1} step={0.5} style={{ width: '100%' }} suffix="giờ" placeholder="Ví dụ: 2.5 giờ" />
                    </Form.Item>

                    <Form.Item name="completionNotes" label="Ghi chú hoàn thành/Hành động khắc phục" rules={[{ required: true }]}>
                        <Input.TextArea rows={3} placeholder="Mô tả chi tiết công việc đã làm..." />
                    </Form.Item>

                    <h3 className="tw-text-lg tw-font-semibold tw-mt-4 tw-mb-2 tw-flex tw-items-center"><SettingOutlined /> Phụ tùng đã sử dụng (Quản lý Danh mục Phụ tùng)</h3>
                    
                    <Form.List name="parts">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, fieldKey, ...restField }) => (
                                    <Row key={key} gutter={8} align="middle" className="tw-mb-3">
                                        <Col span={10}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'partId']}
                                                fieldKey={[fieldKey, 'partId']}
                                                rules={[{ required: true, message: 'Chọn phụ tùng' }]}
                                                className="tw-mb-0"
                                            >
                                                <Select placeholder="Chọn phụ tùng" showSearch optionFilterProp="children">
                                                    {PARTS_CATALOG.map(p => (
                                                        <Option key={p.id} value={p.id}>{p.name} ({p.id})</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'qty']}
                                                fieldKey={[fieldKey, 'qty']}
                                                initialValue={1}
                                                className="tw-mb-0"
                                            >
                                                <Input type="number" min={1} placeholder="Số lượng" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <span className="tw-text-gray-500">{PARTS_CATALOG.find(p => p.id === form.getFieldValue(['parts', name, 'partId']))?.unit || 'Đơn vị'}</span>
                                        </Col>
                                        <Col span={2}>
                                            <Button type="text" danger onClick={() => remove(name)}>Xóa</Button>
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="tw-mt-2">
                                        Thêm Phụ tùng
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Form.Item className="tw-mt-4">
                        <Button type="primary" htmlType="submit" block className="modern-button">
                            Xác nhận Hoàn thành
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default WorkOrderManagementPage;