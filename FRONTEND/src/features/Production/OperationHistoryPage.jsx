// File: FRONTEND/src/features/Production/OperationHistoryPage.jsx

import React, { useState, useMemo } from 'react';
// IMPORT THÊM App
import { Typography, Space, Table, Tag, Row, Col, Card, Select, Button, DatePicker, Divider, message, Statistic, App } from 'antd'; 
import { HistoryOutlined, FilterOutlined, DownloadOutlined } from '@ant-design/icons';
import { useOperationHistory } from '../../hooks/useOperationHistory';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Hàm hỗ trợ export CSV (Giữ nguyên)
const exportToCSV = (data, columns, filename = 'operation_history.csv') => {
    // ... (nội dung hàm exportToCSV giữ nguyên)
    // Lấy tiêu đề cột
    const headers = columns
        .filter(col => col.dataIndex && col.dataIndex !== 'color') // Loại bỏ các cột không cần thiết
        .map(col => col.title);
    
    // Tạo hàng tiêu đề CSV
    let csv = headers.join(',') + '\n';

    // Thêm dữ liệu
    data.forEach(row => {
        const rowData = columns
            .filter(col => col.dataIndex && col.dataIndex !== 'color')
            .map(col => {
                let value = row[col.dataIndex];
                
                // Định dạng lại thời gian cho file xuất
                if (col.dataIndex === 'timestamp') {
                    value = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
                }

                // Đảm bảo giá trị không chứa dấu phẩy hoặc xuống dòng
                value = String(value).replace(/"/g, '""');
                return `"${value}"`;
            })
            .join(',');
        csv += rowData + '\n';
    });

    // Tạo Blob và download file
    // Thêm BOM (Byte Order Mark) cho tiếng Việt (UTF-8)
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

const OperationHistoryPageContent = () => { // Đổi tên component nội dung
    // SỬ DỤNG HOOK useApp() TẠI ĐÂY
    const { message } = App.useApp(); 

    const { historyData, MACHINE_IDS, STATUS_TYPES } = useOperationHistory();
    const [filters, setFilters] = useState({});
    const [dateRange, setDateRange] = useState(null); 

    // Xử lý thay đổi filters (cho Selects)
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Hàm Export (Đã sửa để dùng message từ useApp)
    const handleExport = () => {
        if (filteredData.length === 0) {
            message.warning("Không có dữ liệu để xuất.");
            return;
        }
        exportToCSV(filteredData, columns, `lich_su_van_hanh_${dayjs().format('YYYYMMDD_HHmmss')}.csv`);
        message.success(`Đã xuất ${filteredData.length} bản ghi thành công.`);
    }

    // Áp dụng filter cho dữ liệu hiển thị (Giữ nguyên)
    const filteredData = useMemo(() => {
        return historyData.filter(record => {
            const { machineId, status } = filters;
            let isValid = true;
            
            // Lọc theo Mã Máy
            if (machineId && record.machineId !== machineId) {
                isValid = false;
            }
            // Lọc theo Trạng thái
            if (status && record.status !== status) {
                isValid = false;
            }

            // Lọc theo Khoảng thời gian
            if (dateRange && dateRange.length === 2) {
                const recordTime = dayjs(record.timestamp);
                const [start, end] = dateRange;

                // Kiểm tra xem thời gian bản ghi có nằm trong khoảng [start, end)
                if (start && !recordTime.isSameOrAfter(start, 'second')) {
                    isValid = false;
                }
                if (end && !recordTime.isBefore(end, 'second')) {
                    isValid = false;
                }
            }

            return isValid;
        });
    }, [historyData, filters, dateRange]); 

    // Cột được định nghĩa lại (Giữ nguyên)
    const columns = useMemo(() => ([
        { 
            title: 'Thời gian Sự kiện', 
            dataIndex: 'timestamp', 
            key: 'timestamp', 
            sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
            render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
            width: 200,
            fixed: 'left'
        },
        { 
            title: 'Mã Máy', 
            dataIndex: 'machineId', 
            key: 'machineId',
            width: 150,
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (text, record) => <Tag color={record.color}>{text.toUpperCase()}</Tag>,
            width: 150,
        },
        { 
            title: 'Chi tiết Hoạt động', 
            dataIndex: 'detail', 
            key: 'detail',
            className: 'tw-font-mono tw-text-sm tw-tw-text-gray-700', // Đã sửa classname
        },
    ]), []);


    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><HistoryOutlined /> Lịch sử Vận hành (Data Historian)</Title>

            {/* Panel Lọc Dữ liệu hiện đại */}
            <Card 
                title={<Space><FilterOutlined /> Bộ lọc Dữ liệu</Space>} 
                variant="default" 
                className="tw-shadow-lg"
                style={{ borderRadius: 12 }}
            >
                <Row gutter={[16, 16]}>
                    <Col span={6}>
                        <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Mã Thiết bị:</label>
                        <Select 
                            placeholder="Chọn máy" 
                            style={{ width: '100%' }} 
                            allowClear
                            onChange={(value) => handleFilterChange('machineId', value)}
                        >
                            {MACHINE_IDS.map(id => <Option key={id} value={id}>{id}</Option>)}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Trạng thái:</label>
                        <Select 
                            placeholder="Chọn trạng thái" 
                            style={{ width: '100%' }} 
                            allowClear
                            onChange={(value) => handleFilterChange('status', value)}
                        >
                            {STATUS_TYPES.map(status => <Option key={status} value={status}>{status}</Option>)}
                        </Select>
                    </Col>
                    <Col span={12}>
                        <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Khoảng Thời gian (Chi tiết):</label>
                        <RangePicker 
                            style={{ width: '100%' }} 
                            showTime={{ format: 'HH:mm:ss' }} 
                            format="YYYY-MM-DD HH:mm:ss"
                            onChange={(dates) => setDateRange(dates)}
                        />
                    </Col>
                </Row>
                <Divider style={{ margin: '16px 0' }} />
                <div className="tw-flex tw-justify-end">
                    <Button 
                        type="primary" 
                        icon={<DownloadOutlined />} 
                        onClick={handleExport} // Gọi hàm export
                        disabled={filteredData.length === 0}
                    >
                        Xuất Dữ liệu (.CSV) 
                    </Button>
                </div>
            </Card>

            {/* Bảng Dữ liệu Lịch sử */}
            <Card 
                title={`Kết quả tìm kiếm (${filteredData.length} bản ghi)`}
                variant="default"
                className="tw-shadow-lg"
                style={{ borderRadius: 12 }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="key"
                    pagination={{ pageSize: 15 }}
                    scroll={{ x: 800 }} 
                    bordered
                    size="middle"
                />
            </Card>
        </Space>
    );
};

// Component chính bao bọc nội dung bằng App của Ant Design
const OperationHistoryPage = () => (
    <App>
        <OperationHistoryPageContent />
    </App>
);

export default OperationHistoryPage;