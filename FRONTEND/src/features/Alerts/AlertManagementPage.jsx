import React, { useState, useMemo } from 'react';
// THÊM DatePicker vào import
import { Typography, Space, Table, Tag, Row, Col, Card, Select, Button, Modal, Form, Input, Divider, Statistic, DatePicker } from 'antd'; 
import { 
    AlertOutlined, HistoryOutlined, CheckCircleOutlined, WarningOutlined, 
    StopOutlined, BellOutlined, CheckOutlined, CloseOutlined, UserOutlined, DownloadOutlined , SelectOutlined
} from '@ant-design/icons';
import { useAlertManagement, FAULT_CATALOG } from '../../hooks/useAlertManagement';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import { App } from 'antd'; 

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker; // DÙNG RangePicker

// Hàm hỗ trợ export CSV (Giữ nguyên)
const exportAlertsToCSV = (data, columns, filename = 'alert_history.csv') => {
    // Lấy tiêu đề cột (chỉ các cột cần thiết)
    const exportColumns = [
        { dataIndex: 'timestamp', title: 'Thời gian' },
        { dataIndex: 'machineId', title: 'Mã Máy' },
        { dataIndex: 'severity', title: 'Mức độ' },
        { dataIndex: 'message', title: 'Thông báo' },
        { dataIndex: 'status', title: 'Trạng thái' },
        { dataIndex: 'acknowledgedBy', title: 'Người Xác nhận' },
        { dataIndex: 'faultCode', title: 'Mã Lỗi' },
        { dataIndex: 'resolvedNotes', title: 'Ghi chú Giải quyết' }, // Chứa JSON string
    ];
    
    const headers = exportColumns.map(col => col.title);
    let csv = headers.join(',') + '\n';

    data.forEach(row => {
        const rowData = exportColumns
            .map(col => {
                let value = row[col.dataIndex] || '';
                
                if (col.dataIndex === 'timestamp') {
                    value = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
                } else if (col.dataIndex === 'resolvedNotes' && value) {
                    try {
                        const notes = JSON.parse(value);
                        // Định dạng nội dung ghi chú thành chuỗi dễ đọc
                        value = `[NGUYÊN NHÂN]: ${notes.cause} | [HÀNH ĐỘNG]: ${notes.action}`;
                    } catch (e) {
                        value = 'Ghi chú không hợp lệ';
                    }
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

const getSeverityTag = (severity) => {
    const colorMap = {
        'Critical': 'volcano',
        'Error': 'red',
        'Warning': 'gold',
    };
    return <Tag color={colorMap[severity]}>{severity.toUpperCase()}</Tag>;
};


const AlertManagementPageContent = () => {
    const { username } = useAuth();
    const { message } = App.useApp();
    const { 
        kpiSummary, MACHINE_IDS, SEVERITIES, getFilteredAlerts, updateAlertStatus
    } = useAlertManagement(); 

    // === FILTER STATES MỚI ===
    const [filters, setFilters] = useState({
        status: 'Active', // Default filter
        severity: null,
        machineId: null,
        dateRange: null, 
    });

    // LẤY DỮ LIỆU ĐÃ LỌC từ hook
    const alerts = useMemo(() => getFilteredAlerts(filters), [filters, getFilteredAlerts]);


    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentAlert, setCurrentAlert] = useState(null);
    const [form] = Form.useForm();


    // === FILTER HANDLERS ===
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }

    // ==================== Modal Logic và Actions ====================
    const handleActionClick = (record, action) => {
        setCurrentAlert(record);
        if (action === 'resolve') {
            setIsModalVisible(true);
            try {
                // Lấy resolvedInfo, chú ý cập nhật key từ resolvedNotes
                const info = record.resolvedInfo ? JSON.parse(record.resolvedInfo) : { cause: '', action: '', faultCode: null };
                form.setFieldsValue({ cause: info.cause, action: info.action, faultCode: info.faultCode });
            } catch (e) {
                 form.setFieldsValue({ cause: '', action: '', faultCode: null });
            }
        } else if (action === 'acknowledge') {
            // Không cần faultCode khi chỉ xác nhận
            handleFinalResolve(record, 'Acknowledged', null, null); 
        }
    };

    const handleFinalResolve = (alert, status, notes = null, faultCode = null) => {
        
        updateAlertStatus(alert.id, status, username, notes, faultCode);
        setIsModalVisible(false);
        setCurrentAlert(null);
        message.success(`Đã cập nhật trạng thái cảnh báo ${alert.machineId} sang ${status}.`);
    };
    // Hàm xử lý Form Submit
    const onResolveFormSubmit = (values) => {
        const { cause, action, faultCode } = values;
        const notes = { cause, action };
        handleFinalResolve(currentAlert, 'Resolved', notes, faultCode);
    }
    
    // Xử lý Export (Giữ nguyên)
    const handleExport = () => {
        if (alerts.length === 0) {
            message.warning("Không có dữ liệu để xuất.");
            return;
        }
        const filename = `danh_sach_canh_bao_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
        const columns = [
            { dataIndex: 'timestamp', title: 'Thời gian' },
            { dataIndex: 'machineId', title: 'Mã Máy' },
            { dataIndex: 'severity', title: 'Mức độ' },
            { dataIndex: 'message', title: 'Thông báo Chi tiết' },
            { dataIndex: 'status', title: 'Trạng thái' },
            { dataIndex: 'acknowledgedBy', title: 'Người Xác nhận' },
            { dataIndex: 'resolvedNotes', title: 'Ghi chú Giải quyết' },
        ];
        exportAlertsToCSV(alerts, columns, filename); 
        message.success(`Đã xuất ${alerts.length} bản ghi thành công.`);
    }

    // ==================== Table Definition (Giữ nguyên) ====================
    const columns = useMemo(() => ([
        { 
            title: 'Thời gian', 
            dataIndex: 'timestamp', 
            key: 'timestamp', 
            sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
            width: 180,
            fixed: 'left'
        },
        { title: 'Mã Máy', dataIndex: 'machineId', key: 'machineId', width: 120 },
        { title: 'Mức độ', dataIndex: 'severity', key: 'severity', render: getSeverityTag, width: 120 },
        { title: 'Thông báo Chi tiết', dataIndex: 'message', key: 'message' },
        { 
            title: 'Mã Lỗi', // CỘT MÃ LỖI
            dataIndex: 'faultCode', 
            key: 'faultCode',
            width: 100,
            render: (text) => text ? <Tag color="geekblue">{text}</Tag> : '-'
        },
        { 
            title: 'Người Xác nhận', 
            dataIndex: 'acknowledgedBy', 
            key: 'acknowledgedBy',
            width: 150,
            render: (text) => text ? <Tag icon={<UserOutlined />} color="blue">{text}</Tag> : '-'
        },
        { 
            title: 'Ghi chú Giải quyết', 
            dataIndex: 'resolvedInfo', // Đổi tên key
            key: 'resolvedInfo',
            render: (text) => text ? <span className='tw-text-green-600'>Đã ghi chú</span> : <span className='tw-text-gray-400'>Chưa có</span>,
            width: 150,
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status', 
            render: (status) => (
                <Tag color={status === 'Active' ? 'red' : status === 'Acknowledged' ? 'gold' : 'green'}>
                    {status.toUpperCase()}
                </Tag>
            ),
            width: 120,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 250,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    {/* ... (các button giữ nguyên) */}
                    {record.status === 'Active' && (
                        <Button 
                            size="small" 
                            icon={<CheckOutlined />} 
                            onClick={() => handleActionClick(record, 'acknowledge')}
                            type="primary"
                        >
                            Xác nhận ({username})
                        </Button>
                    )}
                    {(record.status === 'Active' || record.status === 'Acknowledged') && (
                        <Button 
                            size="small" 
                            icon={<CloseOutlined />} 
                            onClick={() => handleActionClick(record, 'resolve')}
                            danger={record.status === 'Active'}
                            type="default"
                        >
                            Giải quyết
                        </Button>
                    )}
                     {record.status === 'Resolved' && (
                         <Button size="small" onClick={() => handleActionClick(record, 'resolve')}>Xem chi tiết</Button>
                    )}
                </Space>
            ),
        },
    ]), [username]);


    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><BellOutlined /> Quản lý & Lịch sử Cảnh báo (Alerts)</Title>

            <Divider orientation="left">Tổng quan Cảnh báo</Divider>
            
            {/* KPI Cards (Giữ nguyên) */}
            <Row gutter={24}>
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #1677ff' }}>
                        <Statistic title="Tổng số Cảnh báo" value={kpiSummary.totalAlerts} prefix={<HistoryOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #ff4d4f' }}>
                        <Statistic title="Đang Hoạt động (Active)" value={kpiSummary.activeCount} prefix={<StopOutlined />} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #faad14' }}>
                        <Statistic title="Cảnh báo Đã xác nhận" value={kpiSummary.acknowledgedCount} prefix={<WarningOutlined />} valueStyle={{ color: '#faad14' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #52c41a' }}>
                        <Statistic title="Mức độ Quan trọng (Critical)" value={kpiSummary.criticalCount} prefix={<AlertOutlined />} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Bộ lọc & Danh sách</Divider>
            
            {/* Filter Panel */}
            <Row gutter={[16, 16]} align="middle">
                <Col span={4}>
                    <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Trạng thái:</label>
                    <Select 
                        defaultValue={filters.status} 
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange('status', value)}
                    >
                        <Option value="Active">Đang Hoạt động</Option>
                        <Option value="Acknowledged">Đã xác nhận</Option>
                        <Option value="Resolved">Đã giải quyết</Option>
                        <Option value="All">Tất cả</Option>
                    </Select>
                </Col>
                <Col span={4}>
                    <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Mức độ:</label>
                    <Select 
                        placeholder="Tất cả mức độ" 
                        allowClear 
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange('severity', value)}
                    >
                        {SEVERITIES.map(s => <Option key={s} value={s}>{s}</Option>)}
                    </Select>
                </Col>
                <Col span={5}>
                    <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Mã Máy:</label>
                    <Select 
                        placeholder="Tất cả máy" 
                        allowClear 
                        showSearch 
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange('machineId', value)}
                    >
                        {MACHINE_IDS.map(id => <Option key={id} value={id}>{id}</Option>)}
                    </Select>
                </Col>
                {/* THÊM BỘ LỌC THỜI GIAN */}
                <Col span={7}>
                    <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Khoảng Thời gian (Chi tiết):</label>
                    <RangePicker
                        style={{ width: '100%' }}
                        // Cho phép chọn giờ, phút, giây
                        showTime={{ format: 'HH:mm:ss' }}
                        format="YYYY-MM-DD HH:mm:ss"
                        onChange={(dates) => handleFilterChange('dateRange', dates)}
                    />
                </Col>
                <Col span={4} style={{ textAlign: 'right' }}>
                    <Statistic title="Số lượng hiển thị" value={alerts.length} suffix={`/${kpiSummary.totalAlerts}`} style={{ marginRight: 10 }} />
                    <Button 
                        type="primary" 
                        icon={<DownloadOutlined />} 
                        onClick={handleExport}
                        disabled={alerts.length === 0}
                    >
                        Xuất Excel
                    </Button>
                </Col>
            </Row>

            {/* Alert Table (Giữ nguyên) */}
            <Table
                columns={columns}
                dataSource={alerts}
                rowKey="id"
                pagination={{ pageSize: 15 }}
                scroll={{ x: 1300, y: 500 }}
                bordered
                size="middle"
                rowClassName={(record) => (
                    record.status === 'Active' ? 'tw-bg-red-50' : 
                    record.status === 'Acknowledged' ? 'tw-bg-yellow-50' : ''
                )}
            />

            {/* Modal Giải quyết Cảnh báo (Giữ nguyên) */}
             <Modal
                title={`Giải quyết Cảnh báo ${currentAlert?.machineId}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onResolveFormSubmit} // SỬ DỤNG HÀM MỚI
                    initialValues={{ cause: '', action: '', faultCode: null }}
                >
                    <p>Cảnh báo: <strong>{currentAlert?.message}</strong></p>
                    <p>Thời gian: {dayjs(currentAlert?.timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
                    <Divider />
                    
                    {/* THÊM LỰA CHỌN MÃ LỖI */}
                    <Form.Item
                        name="faultCode"
                        label={<Text strong><SelectOutlined /> 3. Mã Lỗi Đã Khắc phục (Fault Catalog)</Text>}
                        rules={[{ required: true, message: 'Vui lòng chọn mã lỗi!' }]}
                    >
                        <Select
                            placeholder="Chọn mã lỗi từ danh mục..."
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {FAULT_CATALOG.map(fault => (
                                <Option 
                                    key={fault.code} 
                                    value={fault.code}
                                    label={`${fault.code} - ${fault.description}`}
                                >
                                    <Tag color="geekblue">{fault.code}</Tag> {fault.description} ({fault.category})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    {/* Trường ghi chú nguyên nhân */}
                    <Form.Item
                        name="cause"
                        label="1. Nguyên nhân Gốc rễ của Lỗi"
                        rules={[{ required: true, message: 'Vui lòng mô tả nguyên nhân gốc rễ!' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Ví dụ: Cảm biến bị hỏng do tiếp xúc lâu với nhiệt độ cao..." />
                    </Form.Item>
                    
                    {/* Trường ghi chú hành động khắc phục */}
                    <Form.Item
                        name="action"
                        label="2. Hành động Khắc phục/Giải quyết"
                        rules={[{ required: true, message: 'Vui lòng mô tả hành động khắc phục!' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Ví dụ: Đã thay thế cảm biến loại chịu nhiệt tốt hơn và hiệu chỉnh lại tần suất giám sát..." />
                    </Form.Item>
                    
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" block icon={<CheckCircleOutlined />}>
                            Xác nhận Giải quyết ({username})
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
};

// Wrapper component để sử dụng hook useApp()
const AlertManagementPage = () => (
    <App>
        <AlertManagementPageContent />
    </App>
);

export default AlertManagementPage;