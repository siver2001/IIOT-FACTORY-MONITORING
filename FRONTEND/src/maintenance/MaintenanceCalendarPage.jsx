// FRONTEND/src/maintenance/MaintenanceCalendarPage.jsx

import React, { useState, useMemo } from 'react';
import { 
    Calendar, Badge, Modal, Tag, Descriptions, Button, 
    // THÊM CÁC IMPORTS CẦN THIẾT CHO FORM EDIT
    Form, Input, Select, DatePicker, Row, Col, Typography, Space, App, Popconfirm, Card, Table 
} from 'antd';
import { useWorkOrder, WORK_ORDER_STATUS } from './useWorkOrder';
import { CalendarOutlined, DownloadOutlined, EditOutlined, DeleteOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { Option } = Select;

// Hàm hỗ trợ export CSV (giữ nguyên)
const exportWOsToCSV = (data, filename = 'maintenance_plan.csv') => {
    const exportColumns = [
        { dataIndex: 'id', title: 'Mã WO' },
        { dataIndex: 'machineCode', title: 'Mã Máy' },
        { dataIndex: 'title', title: 'Tiêu đề' },
        { dataIndex: 'type', title: 'Loại' },
        { dataIndex: 'status', title: 'Trạng thái' },
        { dataIndex: 'priority', title: 'Ưu tiên' },
        { dataIndex: 'assignedTo', title: 'Người gán' },
        { dataIndex: 'dueDate', title: 'Hạn chót' },
        { dataIndex: 'createdAt', title: 'Ngày tạo' },
    ];
    
    const headers = exportColumns.map(col => col.title);
    let csv = headers.join(',') + '\n';

    data.forEach(row => {
        const rowData = exportColumns
            .map(col => {
                let value = row[col.dataIndex] || '';
                
                if (col.dataIndex === 'dueDate' || col.dataIndex === 'createdAt') {
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


const MaintenanceCalendarPageContent = () => {
    // SỬA: Lấy createWorkOrder từ hook
    const { workOrders, deleteWorkOrder, updateWorkOrder, createWorkOrder, ASSIGNEES } = useWorkOrder(); 
    const { message } = App.useApp(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // New state for editing WO
    const [selectedWOs, setSelectedWOs] = useState([]);
    const [selectedWO, setSelectedWO] = useState(null); // WO being edited
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [form] = Form.useForm();
    
    // Gom nhóm WO theo ngày
    const woByDate = useMemo(() => {
        const map = new Map();
        workOrders.forEach(wo => {
            const dateKey = dayjs(wo.dueDate).format('YYYY-MM-DD');
            // Chỉ hiển thị các WO PM và WO CM chưa hoàn thành trên lịch
            if (wo.type === 'PM' || wo.status !== WORK_ORDER_STATUS.COMPLETED) {
                if (!map.has(dateKey)) {
                    map.set(dateKey, []);
                }
                map.get(dateKey).push(wo);
            }
        });
        return map;
    }, [workOrders]);

    // Hàm tùy chỉnh hiển thị nội dung ô ngày (giữ nguyên)
    const dateCellRender = (value) => {
        const dateKey = value.format('YYYY-MM-DD');
        const listData = woByDate.get(dateKey) || [];

        return (
            <ul className="tw-list-none tw-m-0 tw-p-0">
                {listData.slice(0, 3).map((item) => (
                    <li key={item.id} className="tw-mt-1">
                        <Badge color={item.type === 'PM' ? 'cyan' : 'red'} text={`${item.id} - ${item.machineCode}`} />
                    </li>
                ))}
                {listData.length > 3 && <li className="tw-text-xs tw-text-gray-500">+{listData.length - 3} WO khác</li>}
            </ul>
        );
    };

    // Hàm xử lý sự kiện khi click vào một ngày (CẬP NHẬT)
    const onSelect = (value) => {
        const dateKey = value.format('YYYY-MM-DD');
        const WOs = woByDate.get(dateKey) || [];
        
        setSelectedDate(value);
        setSelectedWOs(WOs);
        setIsModalOpen(true); // <--- LUÔN MỞ MODAL
    };

    const statusTag = (status) => {
        let color = 'default';
        if (status === WORK_ORDER_STATUS.PENDING) color = 'volcano';
        else if (status === WORK_ORDER_STATUS.IN_PROGRESS) color = 'blue';
        else if (status === WORK_ORDER_STATUS.COMPLETED) color = 'green';
        return <Tag color={color}>{status}</Tag>;
    };

    // --- LOGIC TẠO MỚI / CHỈNH SỬA / XÓA ---
    
    // HÀM MỚI: Xử lý Add WO (Mở form Edit ở chế độ tạo mới)
    const handleAddWO = () => {
        setIsModalOpen(false); // Đóng modal list
        setSelectedWO(null); // Đảm bảo đang ở chế độ tạo mới
        
        // Chỉnh sửa form để hiển thị WO mới
        form.resetFields(); 
        form.setFieldsValue({
            // Đặt hạn chót mặc định là ngày được chọn
            dueDate: selectedDate, 
            status: WORK_ORDER_STATUS.PENDING,
            priority: 'Trung bình',
        });
        setIsEditModalOpen(true); // Mở modal chỉnh sửa
    };

    const handleEditWO = (wo) => {
        setSelectedWO(wo);
        form.setFieldsValue({ 
            ...wo, 
            dueDate: dayjs(wo.dueDate),
            status: wo.status, 
        });
        setIsModalOpen(false); // Close list modal
        setIsEditModalOpen(true); // Open edit modal
    };
    
    const handleSaveEdit = (values) => {
        const isNew = !selectedWO; 
        
        if (isNew) {
            // TẠO MỚI WO
            createWorkOrder({ 
                ...values, 
                dueDate: values.dueDate.toDate(),
                // Không cần gán ID, hook useWorkOrder sẽ tự tạo
            });
            message.success(`Đã thêm Lệnh công việc mới vào ngày ${selectedDate.format('DD/MM/YYYY')}.`);
        } else {
             // CẬP NHẬT WO HIỆN CÓ
             updateWorkOrder(selectedWO.id, { 
                ...values, 
                dueDate: values.dueDate.toDate() 
            });
            message.info(`Đã cập nhật Lệnh công việc: ${selectedWO.id}.`);
        }
        
        setIsEditModalOpen(false);
        setSelectedWO(null);
        // Cần đóng Modal chỉnh sửa và mở lại Modal list
        // onSelect(selectedDate) sẽ buộc cập nhật lại danh sách WOs hiển thị trong lịch
        onSelect(selectedDate);
    };
    
    const handleDeleteWO = (woId) => {
        deleteWorkOrder(woId);
        // Cập nhật danh sách trong modal ngay lập tức
        const remainingWOs = selectedWOs.filter(wo => wo.id !== woId);
        setSelectedWOs(remainingWOs);
        message.success(`Đã xóa WO ${woId}.`);
        if (remainingWOs.length === 0) {
            setIsModalOpen(false);
        }
    };
    
    // HÀM EXPORT MỚI (giữ nguyên)
    const handleExport = () => {
        const WOsForExport = workOrders.filter(wo => wo.type === 'PM' || wo.status !== WORK_ORDER_STATUS.COMPLETED);
        exportWOsToCSV(WOsForExport, `Lich_Bao_Tri_${dayjs().format('YYYYMMDD')}.csv`);
        message.success(`Đã xuất ${WOsForExport.length} WO ra file CSV.`);
    };
    
    return (
        <div className="tw-p-6">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h1 className="tw-text-2xl tw-font-bold tw-text-gray-800"><CalendarOutlined /> Lịch Bảo trì & Kế hoạch</h1>
                <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={handleExport}
                >
                    Xuất Kế hoạch (CSV)
                </Button>
            </div>
            
            <div className="tw-shadow-xl tw-p-4 tw-bg-white tw-rounded-lg">
                <Calendar 
                    dateCellRender={dateCellRender} 
                    onSelect={onSelect}
                />
            </div>

            {/* Modal DANH SÁCH WO CHO NGÀY ĐƯỢC CHỌN (SỬ DỤNG DESCRIPTIONS) */}
            <Modal
                title={`Công việc cần làm (Hạn chót: ${selectedDate.format('DD/MM/YYYY')})`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)}>Đóng</Button>
                ]}
                width={800}
            >
                <div className="tw-max-h-96 tw-overflow-y-auto tw-space-y-4">
                    {selectedWOs.length > 0 ? (
                        selectedWOs.map(wo => (
                            <Descriptions 
                                key={wo.id} 
                                bordered 
                                column={{ xs: 1, sm: 2, md: 3 }}
                                className="tw-shadow-sm"
                                // SỬ DỤNG TITLE ĐỂ CHỨA CÁC ACTION
                                title={
                                    <div className='tw-flex tw-justify-between tw-items-center'>
                                        <Text strong>{wo.id}: {wo.title}</Text>
                                        <Space size="small">
                                            {statusTag(wo.status)}
                                            {/* ACTION BUTTONS */}
                                            {wo.status !== WORK_ORDER_STATUS.COMPLETED && (
                                                <Button size="small" icon={<EditOutlined />} onClick={() => handleEditWO(wo)}>Sửa</Button>
                                            )}
                                            <Popconfirm
                                                title={`Chắc chắn xóa WO ${wo.id}?`}
                                                onConfirm={() => handleDeleteWO(wo.id)}
                                                okText="Xóa"
                                                cancelText="Hủy"
                                            >
                                                <Button size="small" icon={<DeleteOutlined />} danger />
                                            </Popconfirm>
                                        </Space>
                                    </div>
                                }
                            >
                                <Descriptions.Item label="Mã Máy">{wo.machineCode}</Descriptions.Item>
                                <Descriptions.Item label="Loại"><Tag color={wo.type === 'PM' ? 'cyan' : 'red'}>{wo.type}</Tag></Descriptions.Item>
                                <Descriptions.Item label="Ưu tiên">{wo.priority}</Descriptions.Item>
                                <Descriptions.Item label="Người Gán">{wo.assignedTo || 'Chưa gán'}</Descriptions.Item>
                                <Descriptions.Item label="Hạn chót">{dayjs(wo.dueDate).format('HH:mm DD/MM')}</Descriptions.Item>
                                <Descriptions.Item label="Ngày tạo">{dayjs(wo.createdAt).format('DD/MM/YYYY')}</Descriptions.Item>
                                <Descriptions.Item label="Mô tả" span={3}>{wo.description}</Descriptions.Item>
                            </Descriptions>
                        ))
                    ) : (
                        // NÚT TẠO MỚI NẾU KHÔNG CÓ WO
                        <div className="tw-text-center tw-p-6">
                            <Text type="secondary" className="tw-block tw-mb-4">
                                Không có công việc nào được lên kế hoạch cho ngày {selectedDate.format('DD/MM/YYYY')}.
                            </Text>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                size="large"
                                onClick={handleAddWO}
                            >
                                Tạo Lệnh công việc Mới
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
            
            {/* Modal CHỈNH SỬA WO (Dùng cho cả Edit và Add New) */}
             <Modal
                title={selectedWO ? `Chỉnh sửa Lệnh công việc: ${selectedWO.id}` : `Tạo Lệnh công việc Mới cho ${selectedDate.format('DD/MM/YYYY')}`}
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSaveEdit} initialValues={{ priority: 'Trung bình', type: 'CM' }}>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="machineCode" label="Mã Máy" rules={[{ required: true }]}>
                        <Input disabled={!!selectedWO}/> {/* Không cho sửa mã máy khi edit */}
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="type" label="Loại WO" rules={[{ required: true }]}>
                                <Select disabled={selectedWO?.type === 'CM'}> 
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
                    
                    <Form.Item name="status" label="Trạng thái WO" rules={[{ required: true }]}>
                         <Select>
                            {Object.values(WORK_ORDER_STATUS).map(s => <Option key={s} value={s}>{s}</Option>)}
                         </Select>
                    </Form.Item>
                    
                    <Form.Item name="assignedTo" label="Người Gán">
                        <Select allowClear>
                            {ASSIGNEES.map(a => <Option key={a} value={a}>{a}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="dueDate" label="Hạn chót" rules={[{ required: true }]}>
                        <DatePicker showTime format="DD/MM/YYYY HH:mm" className="tw-w-full" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item className="tw-mt-4">
                        <Button type="primary" htmlType="submit" block>
                            {selectedWO ? 'Lưu Thay Đổi' : 'Tạo WO'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

// Wrapper component để sử dụng hook useApp()
const MaintenanceCalendarPage = () => (
    <App>
        <MaintenanceCalendarPageContent />
    </App>
);

export default MaintenanceCalendarPage;