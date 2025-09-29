// FRONTEND/src/maintenance/MachineProfilePage.jsx

import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    Typography, Tabs, Card, Descriptions, Tag, Row, Col, Divider, Space, Table, 
    Button, Modal, Form, Input, Select, Popconfirm, Statistic, Upload, App
} from 'antd';
import { 
    DesktopOutlined, SettingOutlined, HistoryOutlined, AlertOutlined, ToolOutlined, 
    LinkOutlined, DeleteOutlined, FileTextOutlined, ClockCircleOutlined, 
    HeartFilled, FallOutlined, PlusOutlined, ThunderboltOutlined, UploadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import Hooks
import { useAssetManagement } from '../hooks/useAssetManagement';
import { useOperationHistory } from '../hooks/useOperationHistory';
import { useAlertManagement } from '../hooks/useAlertManagement';
import { useWorkOrder } from './useWorkOrder';
import { useDocumentManagement } from '../hooks/useDocumentManagement';
import { useRealTimeData } from '../hooks/useRealTimeData'; 

// Import Component FTA & Header
import FailureTreeAnalysis from './FailureTreeAnalysis';
import PageHeaderWithBreadcrumb from '../components/PageHeaderWithBreadcrumb';


const { Title, Text } = Typography;
const { Option } = Select;


const MachineProfilePageContent = () => {
    const { message } = App.useApp();
    const { id } = useParams();
    const machineId = id || 'M-CNC-101'; 
    
    // Hooks
    const { assets } = useAssetManagement();
    const { historyData } = useOperationHistory();
    const { alerts } = useAlertManagement();
    const { workOrders } = useWorkOrder();
    const { getDocumentsByMachine, addDocument, deleteDocument } = useDocumentManagement(); 
    const liveData = useRealTimeData(); 

    // Lọc dữ liệu (Đã có logic phòng vệ || [])
    const machineAsset = useMemo(() => assets.find(a => a.id === machineId), [assets, machineId]);
    const machineHistory = useMemo(() => (historyData || []).filter(h => h.machineId === machineId), [historyData, machineId]);
    const machineAlerts = useMemo(() => (alerts || []).filter(a => a.machineId === machineId), [alerts, machineId]);
    const machineWOs = useMemo(() => (workOrders || []).filter(wo => wo.machineCode === machineId), [workOrders, machineId]);
    const machineDocs = useMemo(() => getDocumentsByMachine(machineId), [getDocumentsByMachine, machineId]); 

    // Lấy RUL Mock
    const mockRUL = liveData.RUL; 
    const mockHealthScore = liveData.healthScore;
    const isRULCritical = mockRUL < 1000;

    const [isDocModalVisible, setIsDocModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [uploadFile, setUploadFile] = useState(null); // State để giữ file mock
    
    if (!machineAsset) {
        return <Title level={4}>Không tìm thấy hồ sơ máy cho ID: {machineId}</Title>;
    }

    // --- Logic Tải lên Tài liệu ---
    const handleBeforeUpload = (file) => {
        setUploadFile(file); // Lưu tệp vào state (mock)
        return false; // Ngăn chặn việc tải lên mặc định của Ant Design
    };

    const handleAddDocument = (values) => {
        if (!uploadFile) {
            message.error('Vui lòng chọn tệp để tải lên.');
            return;
        }
        
        // Gọi hàm mock addDocument với metadata file
        addDocument({ 
            ...values, 
            name: uploadFile.name, // Lấy tên file thực tế
            machineId: machineId, 
            uploadedBy: 'admin_factory' 
        });
        
        // Reset trạng thái
        setIsDocModalVisible(false);
        setUploadFile(null); 
        form.resetFields();
    };

    // --- Cấu hình Bảng ---
    const historyColumns = [
        { title: 'Thời gian', dataIndex: 'timestamp', key: 'timestamp', render: (t) => dayjs(t).format('YYYY-MM-DD HH:mm:ss') },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s, r) => <Tag color={r.color}>{s}</Tag> },
        { title: 'Chi tiết', dataIndex: 'detail', key: 'detail', ellipsis: true },
    ];

    const alertColumns = [
        { title: 'Thời gian', dataIndex: 'timestamp', key: 'timestamp', render: (t) => dayjs(t).format('HH:mm DD/MM') },
        { title: 'Mức độ', dataIndex: 'severity', key: 'severity', render: (s) => <Tag color={s === 'Critical' ? 'red' : 'gold'}>{s}</Tag> },
        { title: 'Thông báo', dataIndex: 'message', key: 'message', ellipsis: true },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Resolved' ? 'green' : 'volcano'}>{s}</Tag> },
    ];
    
    const woColumns = [
        { title: 'Mã WO', dataIndex: 'id', key: 'id', width: 100 },
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title', ellipsis: true },
        { title: 'Loại', dataIndex: 'type', key: 'type', render: (t) => <Tag color={t === 'PM' ? 'cyan' : 'red'}>{t}</Tag> },
        { title: 'Hạn chót', dataIndex: 'dueDate', key: 'dueDate', render: (d) => dayjs(d).format('DD/MM/YYYY') },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Hoàn thành' ? 'green' : 'blue'}>{s}</Tag> },
    ];
    
    const docColumns = [
        { title: 'Tên Tài liệu', dataIndex: 'name', key: 'name', render: (text, record) => (
            <a href={record.link} target="_blank" rel="noopener noreferrer">
                <FileTextOutlined /> {text}
            </a>
        )},
        { title: 'Loại', dataIndex: 'type', key: 'type', width: 120 },
        { title: 'Ngày tải lên', dataIndex: 'uploadedDate', key: 'uploadedDate', render: (d) => dayjs(d).format('DD/MM/YYYY'), width: 150 },
        { 
            title: 'Hành động', 
            key: 'action', 
            width: 100, 
            render: (_, record) => (
                <Popconfirm
                    title="Chắc chắn muốn xóa tài liệu này?"
                    onConfirm={() => deleteDocument(record.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
            )
        },
    ];
    
    // ĐỊNH NGHĨA MẢNG ITEMS CHO TABS
    const tabItems = [
        {
            key: '1',
            label: <Space><HistoryOutlined /> Lịch sử Vận hành ({machineHistory.length})</Space>,
            children: (
                <Table 
                    dataSource={machineHistory} 
                    columns={historyColumns} 
                    rowKey="key" 
                    pagination={{ pageSize: 5 }} 
                    size="small" 
                    scroll={{ y: 250 }} 
                />
            )
        },
        {
            key: '2',
            label: <Space><AlertOutlined /> Lịch sử Cảnh báo ({machineAlerts.length})</Space>,
            children: (
                <Table 
                    dataSource={machineAlerts} 
                    columns={alertColumns} 
                    rowKey="id" 
                    pagination={{ pageSize: 5 }} 
                    size="small" 
                    scroll={{ y: 250 }} 
                />
            )
        },
        {
            key: '3',
            label: <Space><ToolOutlined /> Lịch sử Lệnh công việc ({machineWOs.length})</Space>,
            children: (
                <Table 
                    dataSource={machineWOs} 
                    columns={woColumns} 
                    rowKey="id" 
                    pagination={{ pageSize: 5 }} 
                    size="small" 
                    scroll={{ y: 250 }} 
                />
            )
        },
        {
            key: '4',
            label: <Space><ThunderboltOutlined /> Phân tích Cây Lỗi (Mock)</Space>,
            children: <FailureTreeAnalysis machineId={machineId} /> 
        },
        {
            key: '5',
            label: <Space><FileTextOutlined /> Tài liệu Kỹ thuật ({machineDocs.length})</Space>,
            children: (
                <>
                    <div className="tw-flex tw-justify-end tw-mb-4">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDocModalVisible(true)}>
                            Thêm Tài liệu
                        </Button>
                    </div>
                    <Table 
                        dataSource={machineDocs} 
                        columns={docColumns} 
                        rowKey="id" 
                        pagination={false} 
                        size="small" 
                        scroll={{ y: 250 }}
                    />
                </>
            )
        },
    ];

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            
            {/* FIX 1: THÊM PAGE HEADER VỚI NÚT QUAY LẠI */}
            <PageHeaderWithBreadcrumb 
                title={`Hồ sơ Máy Toàn diện: ${machineId} (${machineAsset.name})`}
                icon={<DesktopOutlined />}
            />
            
            {/* KPI RUL & HEALTH SCORE */}
            <Row gutter={24}>
                <Col span={8}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #52c41a' }}>
                        <Statistic
                            title="Health Score (Real-time)"
                            value={mockHealthScore}
                            precision={1}
                            suffix="/100"
                            prefix={<HeartFilled />}
                            valueStyle={{ color: mockHealthScore > 80 ? '#52c41a' : '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: `4px solid ${isRULCritical ? '#ff4d4f' : '#1677ff'}` }}>
                        <Statistic
                            title="RUL (Tuổi thọ Còn lại Ước tính)"
                            value={mockRUL}
                            suffix=" giờ chạy"
                            prefix={isRULCritical ? <FallOutlined /> : <ClockCircleOutlined />}
                            valueStyle={{ color: isRULCritical ? '#cf1322' : '#1677ff' }}
                        />
                        <Text type="secondary">
                            (Dựa trên mô hình PdM Mock)
                        </Text>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #faad14' }}>
                        <Statistic
                            title="Số Lệnh công việc Đang chờ"
                            value={machineWOs.filter(wo => wo.status !== 'Hoàn thành').length}
                            prefix={<ToolOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                        <Link to="/maintenance/work-orders">
                            <Text type="secondary" className="tw-block tw-mt-2">
                                Chuyển đến Quản lý WO
                            </Text>
                        </Link>
                    </Card>
                </Col>
            </Row>
            
            {/* THÔNG TIN TÀI SẢN CƠ BẢN */}
            <Card title={<Text strong><SettingOutlined /> Thông tin Tài sản & Bảo hành</Text>} className="tw-shadow-md">
                <Descriptions bordered column={3} size="small">
                    <Descriptions.Item label="Model">{machineAsset.model}</Descriptions.Item>
                    <Descriptions.Item label="Nhà sản xuất">{machineAsset.manufacturer}</Descriptions.Item>
                    <Descriptions.Item label="Vị trí">{machineAsset.location}</Descriptions.Item>
                    <Descriptions.Item label="Ngày Mua">{machineAsset.purchaseDate}</Descriptions.Item>
                    <Descriptions.Item label="Bảo hành">{machineAsset.isUnderWarranty ? <Tag color="green">CÒN BH</Tag> : <Tag color="red">HẾT BH</Tag>}</Descriptions.Item>
                    <Descriptions.Item label="Hạn BH">{machineAsset.warrantyEndDate}</Descriptions.Item>
                    <Descriptions.Item label="PM Kế tiếp"><Tag color="volcano"><ClockCircleOutlined /> {machineAsset.nextPMDate}</Tag></Descriptions.Item>
                    <Descriptions.Item label="Chu kỳ PM">{machineAsset.maintenanceCycle} ngày</Descriptions.Item>
                </Descriptions>
            </Card>

            <Divider orientation="left">Dữ liệu Chức năng Tích hợp</Divider>
            
            {/* TABS DỮ LIỆU TÍCH HỢP */}
            <Tabs 
                defaultActiveKey="1" 
                size="large" 
                className="tw-shadow-xl tw-bg-white tw-rounded-lg tw-p-2"
                items={tabItems} 
            />

            {/* Modal Thêm Tài liệu (FIX 2: Tải file thay vì link) */}
            <Modal
                title="Tải lên Tài liệu Kỹ thuật"
                open={isDocModalVisible}
                onCancel={() => { setIsDocModalVisible(false); setUploadFile(null); form.resetFields(); }}
                footer={[
                    <Button key="back" onClick={() => { setIsDocModalVisible(false); setUploadFile(null); form.resetFields(); }}>Hủy</Button>,
                    <Button 
                        key="submit" 
                        type="primary" 
                        onClick={() => form.submit()}
                        disabled={!uploadFile} // Vô hiệu hóa nút nếu chưa chọn file
                    >
                        Tải lên & Lưu
                    </Button>
                ]}
            >
                <Form form={form} layout="vertical" onFinish={handleAddDocument}>
                    
                    {/* TRƯỜNG UPLOAD FILE MOCK */}
                    <Form.Item label={<Text strong>1. Chọn Tệp (PDF, DWG, Image)</Text>} required>
                         <Upload 
                            name="file"
                            beforeUpload={handleBeforeUpload} // Ngăn tải lên thực tế
                            onRemove={() => setUploadFile(null)}
                            maxCount={1}
                            fileList={uploadFile ? [{ uid: uploadFile.uid, name: uploadFile.name, status: 'done' }] : []}
                        >
                            <Button icon={<UploadOutlined />}>Chọn tệp từ máy tính</Button>
                        </Upload>
                        <Text type="secondary" className="tw-block tw-mt-1">
                            Tên tệp sẽ được lưu: {uploadFile ? <Tag color="blue">{uploadFile.name}</Tag> : 'Chưa chọn tệp'}
                        </Text>
                    </Form.Item>

                    <Form.Item name="type" label={<Text strong>2. Phân loại Tài liệu</Text>} rules={[{ required: true, message: 'Vui lòng chọn loại tài liệu' }]}>
                        <Select placeholder="Chọn loại">
                            <Option value="PDF">Sách hướng dẫn (PDF)</Option>
                            <Option value="Diagram">Sơ đồ/Bản vẽ</Option>
                            <Option value="Image">Hình ảnh/Ảnh chụp</Option>
                            <Option value="Other">Khác</Option>
                        </Select>
                    </Form.Item>
                    
                    <Form.Item label="Gắn cho Máy" initialValue={machineId} name="machineId" hidden>
                        <Input disabled />
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
};

// Wrapper để sử dụng App context
const MachineProfilePage = () => (
    <App>
        <MachineProfilePageContent />
    </App>
);

export default MachineProfilePage;