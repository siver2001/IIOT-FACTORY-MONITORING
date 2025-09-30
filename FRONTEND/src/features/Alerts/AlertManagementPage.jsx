// FRONTEND/src/features/Alerts/AlertManagementPage.jsx

import React, { useState, useMemo } from 'react';
import { Typography, Space, Table, Tag, Row, Col, Card, Select, Button, Modal, Form, Input, Divider, Statistic, DatePicker } from 'antd'; 
import { 
    AlertOutlined, HistoryOutlined, CheckCircleOutlined, WarningOutlined, 
    StopOutlined, BellOutlined, CheckOutlined, CloseOutlined, UserOutlined, DownloadOutlined , SelectOutlined
} from '@ant-design/icons';
// FIX: Chỉ import useAlertManagement, lấy FAULT_CATALOG qua hook
import { useAlertManagement } from '../../hooks/useAlertManagement'; 
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import { App } from 'antd'; 

// FIX: Đảm bảo Text được destructuring
const { Title, Text } = Typography; 
const { Option } = Select;
const { RangePicker } = DatePicker; 

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
        { dataIndex: 'resolvedInfo', title: 'Ghi chú Giải quyết' }, // Chứa JSON string
    ];
    
    const headers = exportColumns.map(col => col.title);
    let csv = headers.join(',') + '\n';

    data.forEach(row => {
        const rowData = exportColumns
            .map(col => {
                let value = row[col.dataIndex] || '';
                
                if (col.dataIndex === 'timestamp') {
                    value = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
                } else if (col.dataIndex === 'resolvedInfo' && value) {
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
        kpiSummary, MACHINE_IDS, SEVERITIES, getFilteredAlerts, updateAlertStatus, resolveAlertAndCreateWO,
        FAULT_CATALOG // FIX: Lấy catalog động từ hook
    } = useAlertManagement(); 

    // === FILTER STATES ===
    const [filters, setFilters] = useState({
        status: 'Active', 
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
            // FIX: Thực hiện quy trình nghiêm ngặt: Active -> Acknowledged -> Resolved
            if (record.status === 'Active') {
                 message.warning('Vui lòng Xác nhận cảnh báo trước khi Giải quyết.');
                 return;
            }
            
            setIsModalVisible(true);
            try {
                // Khi mở modal, nếu đã có faultCode, phải đặt nó vào mảng cho Select mode="tags"
                let initialFaultCode = record.faultCode ? [record.faultCode] : [];

                // Đảm bảo parse JSON an toàn
                const info = record.resolvedInfo ? JSON.parse(record.resolvedInfo) : { cause: '', action: '', faultCode: initialFaultCode };
                
                // Nếu đang ở trạng thái Resolved và xem chi tiết, faultCode sẽ là string, ta phải bọc nó lại.
                if (typeof info.faultCode === 'string' && info.faultCode) {
                    initialFaultCode = [info.faultCode];
                } else if (Array.isArray(info.faultCode)) {
                    initialFaultCode = info.faultCode;
                }

                form.setFieldsValue({ 
                    cause: info.cause, 
                    action: info.action, 
                    faultCode: initialFaultCode 
                });
            } catch (e) {
                 form.setFieldsValue({ cause: '', action: '', faultCode: [] });
            }
        } else if (action === 'acknowledge') {
            updateAlertStatus(record.id, 'Acknowledged', username); 
            message.success(`Đã xác nhận cảnh báo ${record.machineId}.`);
        }
    };

    // Hàm xử lý Form Submit (Gọi hàm giải quyết VÀ tạo WO tự động)
    const onResolveFormSubmit = (values) => {
        // FIX: Xử lý giá trị faultCode: Lấy phần tử đầu tiên vì mode="tags" trong trường này chỉ dùng 1 giá trị
        const faultCodeValue = Array.isArray(values.faultCode) && values.faultCode.length > 0
            ? values.faultCode[0]
            : null;
        
        if (!faultCodeValue) {
             message.error('Mã Lỗi không được để trống.');
             return;
        }

        // Gọi hàm mới: Giải quyết Alert VÀ Tự động Tạo WO
        resolveAlertAndCreateWO(currentAlert.id, { ...values, faultCode: faultCodeValue }, username);
        setIsModalVisible(false);
        setCurrentAlert(null);
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
            { dataIndex: 'resolvedInfo', title: 'Ghi chú Giải quyết' },
        ];
        exportAlertsToCSV(alerts, columns, filename); 
        message.success(`Đã xuất ${alerts.length} bản ghi thành công.`);
    }

    // ==================== Table Definition (Logic Hành động đã sửa) ====================
    const columns = useMemo(() => ([
        { 
            title: 'Thời gian', 
            dataIndex: 'timestamp', 
            key: 'timestamp', 
            sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
            width: 170, 
            fixed: 'left'
        },
        { title: 'Mã Máy', dataIndex: 'machineId', key: 'machineId', width: 100 }, // Giảm từ 120 xuống 100
        { title: 'Mức độ', dataIndex: 'severity', key: 'severity', render: getSeverityTag, width: 100 }, // Giảm từ 120 xuống 100
        { title: 'Thông báo Chi tiết', dataIndex: 'message', key: 'message' }, // ĐÃ XÓA 'width' để cột này tự mở rộng
        { 
            title: 'Mã Lỗi', 
            dataIndex: 'faultCode', 
            key: 'faultCode',
            width: 90, 
            render: (text) => text ? <Tag color="geekblue">{text}</Tag> : '-'
        },
        { 
            title: 'Người Xác nhận', 
            dataIndex: 'acknowledgedBy', 
            key: 'acknowledgedBy',
            width: 130, // Giảm từ 150 xuống 130
            render: (text) => text ? <Tag icon={<UserOutlined />} color="blue">{text}</Tag> : '-'
        },
        
        // CỘT MỚI: MTTA (Thời gian phản hồi)
        { 
            title: 'MTTA (Phản hồi)', 
            key: 'mtta', 
            width: 130, // Tối ưu hóa độ rộng
            render: (_, record) => {
                if (record.acknowledgedAt) {
                    const diffMinutes = dayjs(record.acknowledgedAt).diff(dayjs(record.timestamp), 'minute');
                    const hours = Math.floor(diffMinutes / 60);
                    const minutes = diffMinutes % 60;
                    return <Tag color="blue">{hours}h {minutes}m</Tag>;
                }
                return '-';
            }
        },

        // CỘT MỚI: MTTR (Thời gian xử lý)
        { 
            title: 'MTTR (Xử lý)', 
            key: 'mttr', 
            width: 120, // Tối ưu hóa độ rộng
            render: (_, record) => {
                if (record.status === 'Resolved' && record.acknowledgedAt && record.resolvedInfo) {
                    const resolvedTime = dayjs(record.timestamp); 
                    const acknowledgedTime = dayjs(record.acknowledgedAt);
                    const diffMinutes = resolvedTime.diff(acknowledgedTime, 'minute');
                    
                    if (diffMinutes <= 0) return <Tag color="green">0h 0m</Tag>;
                    
                    const hours = Math.floor(diffMinutes / 60);
                    const minutes = diffMinutes % 60;
                    
                    return <Tag color="green">{hours}h {minutes}m</Tag>;
                }
                return '-';
            }
        },
        
        { 
            title: 'Ghi chú Giải quyết', 
            dataIndex: 'resolvedInfo', 
            key: 'resolvedInfo',
            render: (text) => text ? <span className='tw-text-green-600'>Đã ghi chú</span> : <span className='tw-text-gray-400'>Chưa có</span>,
            width: 120,
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
            width: 100, 
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 180,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    {/* Nút Xác nhận: CHỈ hiển thị khi Active */}
                    {record.status === 'Active' && (
                        <Button 
                            size="small" 
                            icon={<CheckOutlined />} 
                            onClick={() => handleActionClick(record, 'acknowledge')}
                            type="primary"
                        >
                            Xác nhận 
                        </Button>
                    )}
                    
                    {/* Nút Giải quyết & Tạo WO: CHỈ hiển thị khi ĐÃ Xác nhận (Acknowledged) */}
                    {record.status === 'Acknowledged' && (
                        <Button 
                            size="small" 
                            icon={<CloseOutlined />} 
                            onClick={() => handleActionClick(record, 'resolve')}
                            type="primary"
                        >
                            Giải quyết & Tạo WO
                        </Button>
                    )}
                     
                     {/* Xem chi tiết cho trạng thái Resolved */}
                     {record.status === 'Resolved' && (
                         <Button size="small" onClick={() => handleActionClick(record, 'resolve')}>Xem chi tiết</Button>
                    )}
                </Space>
            ),
        },
    ]), [username, updateAlertStatus, resolveAlertAndCreateWO]);


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
                {/* BỘ LỌC THỜI GIAN */}
                <Col span={7}>
                    <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Khoảng Thời gian (Chi tiết):</label>
                    <RangePicker
                        style={{ width: '100%' }}
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

            {/* Modal Giải quyết Cảnh báo (Đã cập nhật Select) */}
             <Modal
                title={`Giải quyết Cảnh báo ${currentAlert?.machineId}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onResolveFormSubmit} 
                    // initialValues sẽ được set trong handleActionClick
                >
                    <p>Cảnh báo: <strong>{currentAlert?.message}</strong></p>
                    <p>Thời gian: {dayjs(currentAlert?.timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
                    <Divider />
                    
                    {/* LỰA CHỌN MÃ LỖI (Mục 1) */}
                    <Form.Item
                        name="faultCode"
                        label={<Text strong><SelectOutlined /> 1. Mã Lỗi Đã Khắc phục (Thêm tùy ý)</Text>}
                        // Rule yêu cầu giá trị là mảng (do mode="tags")
                        rules={[{ required: true, type: 'array', min: 1, message: 'Vui lòng chọn hoặc nhập Mã lỗi!' }]} 
                    >
                        <Select
                            placeholder="Chọn hoặc gõ Mã lỗi mới (VD: TE-006)..."
                            showSearch
                            allowClear
                            mode="tags" // FIX: Cho phép người dùng tự thêm mã lỗi
                            maxTagCount={1} // Chỉ cho phép chọn 1 mã lỗi
                            filterOption={(input, option) =>
                                (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {/* Dùng FAULT_CATALOG động từ hook */}
                            {FAULT_CATALOG.map(fault => (
                                <Option 
                                    key={fault.code} 
                                    value={fault.code} // Giá trị option là mã lỗi
                                    label={`${fault.code} - ${fault.description}`}
                                >
                                    <Tag color="geekblue">{fault.code}</Tag> {fault.description} ({fault.category})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    {/* Trường ghi chú nguyên nhân (Mục 2) */}
                    <Form.Item
                        name="cause"
                        label="2. Nguyên nhân Gốc rễ của Lỗi"
                        rules={[{ required: true, message: 'Vui lòng mô tả nguyên nhân gốc rễ!' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Ví dụ: Cảm biến bị hỏng do tiếp xúc lâu với nhiệt độ cao..." />
                    </Form.Item>
                    
                    {/* Trường ghi chú hành động khắc phục (Mục 3) */}
                    <Form.Item
                        name="action"
                        label="3. Hành động Khắc phục/Giải quyết"
                        rules={[{ required: true, message: 'Vui lòng mô tả hành động khắc phục!' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Ví dụ: Đã thay thế cảm biến loại chịu nhiệt tốt hơn và hiệu chỉnh lại tần suất giám sát..." />
                    </Form.Item>
                    
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" block icon={<CheckCircleOutlined />}>
                            Xác nhận Giải quyết & Tạo WO ({username})
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