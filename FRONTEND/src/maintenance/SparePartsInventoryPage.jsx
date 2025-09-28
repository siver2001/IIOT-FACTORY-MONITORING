// FRONTEND/src/maintenance/SparePartsInventoryPage.jsx

import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Typography, Space, Table, Button, Tag, Modal, Form, Input, InputNumber, 
    Divider, Statistic, Row, Col, Card, Popconfirm, Select, Avatar, App, message, Popover
} from 'antd';
import { 
    PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, 
    DownloadOutlined, UploadOutlined, StockOutlined, ShopOutlined, AlertOutlined, QrcodeOutlined, PrinterOutlined, WarningOutlined, ThunderboltOutlined,
    LinkOutlined // <--- Đã thêm LinkOutlined
} from '@ant-design/icons';
import { useSpareParts, PART_CATEGORIES } from './useSpareParts';
import dayjs from 'dayjs';
import { faker } from '@faker-js/faker'; 
import { QRCodeCanvas as QRCode } from 'qrcode.react'; 

const { Title, Text } = Typography;
const { Option } = Select;

// Hàm mock export CSV (giữ nguyên)
const mockExportToCSV = (data, filename = 'spare_parts_inventory.csv') => {
    const exportColumns = [
        { dataIndex: 'id', title: 'Mã Vật tư' },
        { dataIndex: 'name', title: 'Tên Vật tư' },
        { dataIndex: 'stock', title: 'Số lượng Tồn' },
        { dataIndex: 'unit', title: 'Đơn vị' },
        { dataIndex: 'minStock', title: 'Ngưỡng Tối thiểu' },
        { dataIndex: 'location', title: 'Vị trí Kho' },
        { dataIndex: 'vendor', title: 'Nhà cung cấp' },
        { dataIndex: 'status', title: 'Trạng thái Tồn kho' },
    ];
    
    const headers = exportColumns.map(col => col.title);
    let csv = headers.join(',') + '\n';

    data.forEach(row => {
        const rowData = exportColumns
            .map(col => {
                let value = row[col.dataIndex] || '';
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

// Component QR Code In ấn Tùy chỉnh (ĐÃ SỬA LINK)
const PrintableQRCode = ({ part }) => {
    // URL Mock cho QR Code: Chứa QR ID của vật tư
    const qrData = `SP-INVENTORY:${part.qrCodeId}`; 

    // Sử dụng ref để in ấn
    const printRef = useRef();

    const handlePrint = () => {
        const printContent = printRef.current;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>In Mã QR</title>');
        // Thêm CSS in ấn cơ bản
        printWindow.document.write('<style>@media print { body { margin: 0; } .print-area { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; border: 1px solid black; width: 300px; height: 350px; font-family: Arial, sans-serif; } .header { font-size: 14px; font-weight: bold; margin-bottom: 10px; } .info { font-size: 10px; margin-top: 5px; } }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <Space direction="vertical" style={{ display: 'flex' }}>
            <div ref={printRef} className="print-area tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-5 tw-border tw-border-dashed tw-border-gray-400 tw-rounded">
                <div className="header tw-text-lg tw-font-bold tw-mb-2">{part.name}</div>
                {part.qrCodeId ? <QRCode value={qrData} size={150} level="H" /> : <Text type="danger">Mã QR chưa được tạo</Text>} 
                
                {/* HIỂN THỊ THÔNG TIN CHI TIẾT TRÊN BẢN IN */}
                <div className="info tw-text-xs tw-mt-3">Mã ID: {part.id}</div>
                <div className="info tw-text-xs">Loại: {part.category}</div> 
                <div className="info tw-text-xs">Tồn kho: {part.stock} {part.unit}</div> 
                <div className="info tw-text-xs">Vị trí: {part.location}</div>
                <div className="info tw-text-xs">Trạng thái: <Tag color={part.color} style={{ margin: 0 }}>{part.status}</Tag></div>
                
                <div className="info tw-text-xs">QR ID: {part.qrCodeId ? part.qrCodeId.slice(0, 10) + '...' : 'N/A'}</div>
            </div>
            
            <Space className="tw-mt-2">
                {part.qrCodeId && (
                    <Button icon={<PrinterOutlined />} type="default" onClick={handlePrint}>
                        In Mã QR này
                    </Button>
                )}
                {/* NÚT XEM CHI TIẾT VẬT TƯ (ĐÃ SỬA LINK) */}
                <Button 
                    icon={<LinkOutlined />} 
                    type="dashed" 
                    // Dẫn đến trang quản lý kho vật tư
                    onClick={() => window.open(`/maintenance/inventory`, '_blank')}
                >
                    Xem Trang Quản lý Kho
                </Button>
            </Space>
        </Space>
    );
};

// COMPONENT MỚI: Image Preview trên hover (giữ nguyên)
const ImageZoomPreview = ({ url, name }) => (
    <Popover
        content={<img src={url} alt={name} style={{ width: 200, height: 'auto', borderRadius: 4 }} />}
        title={name}
        trigger="hover"
        placement="right"
    >
        {/* Sử dụng Avatar cho hình ảnh nhỏ trong bảng */}
        <Avatar src={url} shape="square" size={40} icon={<ShopOutlined />} />
    </Popover>
);


const SparePartsInventoryPageContent = () => {
    const { parts, savePart, deletePart, mockImport, summary, getPartByQrId, PART_CATEGORIES, generateQrCode } = useSpareParts();
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isQRModalVisible, setIsQRModalVisible] = useState(false);
    const [currentPart, setCurrentPart] = useState(null);
    const [qrPart, setQrPart] = useState(null); 
    const [form] = Form.useForm();
    const [filters, setFilters] = useState({ name: '', status: null, category: null }); 
    const [isScannerActive, setIsScannerActive] = useState(false); 
    const [scannedQrId, setScannedQrId] = useState(''); 
    
    // HÀM MỚI: Xử lý tạo QR Code (giữ nguyên)
    const handleCreateQrCode = (record) => {
        generateQrCode(record.id, record.name);
    };


    // --- Logic CRUD & Modal (giữ nguyên) ---
    const handleAdd = () => {
        setCurrentPart(null);
        form.resetFields();
        form.setFieldsValue({ category: PART_CATEGORIES[0] || 'Vòng bi/Bạc đạn' });
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setCurrentPart(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleSave = (values) => {
        savePart({ ...values, image: currentPart?.image || values.image || 'https://picsum.photos/seed/new/50/50' }, !currentPart);
        setIsModalVisible(false);
    };
    
    // --- Logic Export/Scan (CẬP NHẬT MODAL SAU KHI QUÉT) ---
    const handleExport = () => {
        mockExportToCSV(parts, `kho_vat_tu_${dayjs().format('YYYYMMDD')}.csv`);
        message.success('Đã xuất dữ liệu kho vật tư thành công!');
    };
    
    const handleScan = () => {
        setIsScannerActive(true);
        // Mô phỏng quá trình quét và nhận QR ID sau 2 giây
        setTimeout(() => {
            setIsScannerActive(false);
            
            // Chỉ quét các vật tư ĐÃ CÓ QR ID
            const partsWithQr = parts.filter(p => p.qrCodeId);
            if (partsWithQr.length === 0) {
                 message.error('Không có vật tư nào có mã QR để quét (Mock).');
                 return;
            }
            
            const mockQrId = partsWithQr[faker.number.int({ min: 0, max: partsWithQr.length - 1 })].qrCodeId;
            setScannedQrId(mockQrId);
            
            const partInfo = getPartByQrId(mockQrId);
            if (partInfo) {
                // HIỂN THỊ ĐẦY ĐỦ THÔNG TIN REAL-TIME SAU KHI LOOKUP
                Modal.info({
                    title: `Thông tin Vật tư (Real-time): ${partInfo.id}`,
                    content: (
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>Tên Vật tư: {partInfo.name}</Text>
                            <Text>Loại Vật tư: <Tag color="blue">{partInfo.category}</Tag></Text>
                            <Text>Số lượng Tồn kho: <Text strong>{partInfo.stock} {partInfo.unit}</Text></Text>
                            <Text>Vị trí Kho: {partInfo.location}</Text>
                            <Text>Trạng thái Tồn: <Tag color={partInfo.color}>{partInfo.status.toUpperCase()}</Tag></Text>
                            <Divider style={{ margin: '8px 0' }} />
                            <Text type="secondary">Mô tả: {partInfo.description}</Text>
                            {/* NÚT XEM CHI TIẾT VẬT TƯ (ĐÃ SỬA LINK) */}
                            <Button 
                                icon={<LinkOutlined />} 
                                type="link" 
                                // Dẫn đến trang quản lý kho vật tư
                                onClick={() => window.open(`/maintenance/inventory`, '_blank')}
                            >
                                Xem Trang Quản lý Kho
                            </Button>
                        </Space>
                    ),
                });
            } else {
                 message.error('Mã QR không hợp lệ hoặc vật tư không tồn tại trong hệ thống.');
            }
        }, 2000);
    };


    // --- Logic Hiển thị QR Code In ấn (giữ nguyên) ---
    const handleShowQR = (record) => {
        setQrPart(record);
        setIsQRModalVisible(true);
    };


    // --- Logic Lọc (giữ nguyên) ---
    const filteredParts = useMemo(() => {
        return parts.filter(p => {
            let match = true;
            if (filters.name && !p.name.toLowerCase().includes(filters.name.toLowerCase())) match = false;
            if (filters.status && filters.status !== 'All' && p.status !== filters.status) match = false;
            if (filters.category && filters.category !== 'All' && p.category !== filters.category) match = false; 
            return match;
        });
    }, [parts, filters]);


    // --- Cấu hình Bảng (giữ nguyên) ---
    const columns = [
        { 
            title: 'QR Code', 
            key: 'qrCode', 
            width: 150,
            fixed: 'left',
            render: (_, record) => (
                record.qrCodeId ? (
                    <Button 
                        icon={<QrcodeOutlined />} 
                        size="small" 
                        onClick={() => handleShowQR(record)}
                        type="default"
                    >
                        In QR ({record.id})
                    </Button>
                ) : (
                     <Popconfirm
                        title={`Bạn có chắc chắn muốn tạo Mã QR mới cho ${record.id}?`}
                        onConfirm={() => handleCreateQrCode(record)}
                        okText="Tạo QR"
                        cancelText="Hủy"
                    >
                         <Button 
                            icon={<ThunderboltOutlined />} 
                            size="small" 
                            type="dashed"
                            danger
                        >
                            Tạo QR
                        </Button>
                    </Popconfirm>
                )
            )
        },
        { 
            title: 'Hình ảnh', 
            dataIndex: 'image', 
            key: 'image', 
            width: 120,
            render: (url, record) => <ImageZoomPreview url={url} name={record.name} />
        },
        { title: 'Mã Vật tư', dataIndex: 'id', key: 'id', width: 120, sorter: (a, b) => a.id.localeCompare(b.id) },
        { title: 'Tên Vật tư', dataIndex: 'name', key: 'name', ellipsis: true },
        { 
            title: 'Loại Vật tư', 
            dataIndex: 'category', 
            key: 'category', 
            width: 150, 
            render: (text) => <Tag color="blue">{text}</Tag> ,
            filters: PART_CATEGORIES.map(c => ({ text: c, value: c })),
            onFilter: (value, record) => record.category === value,
        },
        { 
            title: 'Tồn kho', 
            dataIndex: 'stock', 
            key: 'stock', 
            width: 100,
            render: (text) => <Text strong>{text}</Text>,
            sorter: (a, b) => a.stock - b.stock
        },
        { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', width: 80 },
        { title: 'Vị trí', dataIndex: 'location', key: 'location', width: 120 },
        { 
            title: 'Trạng thái Tồn', 
            dataIndex: 'status', 
            key: 'status', 
            width: 150,
            render: (status, record) => (
                <Tag color={record.color} icon={<StockOutlined />}>
                    {status.toUpperCase()} (Min: {record.minStock})
                </Tag>
            ),
            filters: [{ text: 'Critical Low', value: 'Critical Low' }, { text: 'Low Stock', value: 'Low Stock' }, { text: 'Normal', value: 'Normal' }],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    {/* CRUD: Chỉnh sửa */}
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                    {/* CRUD: Xóa */}
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa vật tư này?"
                        onConfirm={() => deletePart(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><StockOutlined /> Quản lý Kho Vật tư Bảo trì</Title>

            <Divider orientation="left">Tổng quan Tồn kho & Thao tác Quét</Divider>
            
            {/* KPI Summary Cards giữ nguyên */}
            <Row gutter={24}>
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #1677ff' }}>
                        <Statistic title="Tổng số Vật tư Khác nhau" value={parts.length} prefix={<ShopOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #ff4d4f' }}>
                        <Statistic 
                            title="Nguy hiểm (Critical Low)" 
                            value={summary.criticalCount} 
                            prefix={<AlertOutlined />} 
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #faad14' }}>
                        <Statistic 
                            title="Cảnh báo (Low Stock)" 
                            value={summary.lowStockCount} 
                            prefix={<WarningOutlined />} 
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                 <Col span={6} className="tw-flex tw-justify-center tw-items-center">
                    <Button 
                        type="default" 
                        size="large"
                        icon={<QrcodeOutlined />} 
                        onClick={handleScan}
                        loading={isScannerActive}
                    >
                        {isScannerActive ? 'Đang Quét...' : 'Quét Mã QR (Mock)'}
                    </Button>
                </Col>
            </Row>

            <Divider orientation="left">Danh sách Vật tư & Thao tác</Divider>

            {/* Control Panel: BỘ LỌC (giữ nguyên) */}
            <Card className="tw-shadow-md">
                <Row gutter={[16, 16]} align="middle">
                    <Col span={6}>
                        <Input 
                            placeholder="Tìm kiếm theo Tên Vật tư" 
                            prefix={<SearchOutlined />}
                            onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
                            allowClear
                        />
                    </Col>
                    {/* BỘ LỌC CATEGORY */}
                    <Col span={4}>
                         <Select
                            placeholder="Lọc theo Loại Vật tư"
                            allowClear
                            onChange={(value) => setFilters(f => ({ ...f, category: value }))}
                            style={{ width: '100%' }}
                        >
                            <Option value="All">Tất cả Loại</Option>
                            {PART_CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                        </Select>
                    </Col>
                    {/* BỘ LỌC STATUS */}
                     <Col span={4}>
                        <Select
                            placeholder="Lọc Trạng thái"
                            allowClear
                            onChange={(value) => setFilters(f => ({ ...f, status: value }))}
                            style={{ width: '100%' }}
                        >
                            <Option value="Critical Low">Critical Low</Option>
                            <Option value="Low Stock">Low Stock</Option>
                            <Option value="Normal">Normal</Option>
                            <Option value="All">Tất cả</Option>
                        </Select>
                    </Col>
                    <Col span={10} style={{ textAlign: 'right' }}>
                        <Space>
                            <Button 
                                icon={<UploadOutlined />} 
                                onClick={mockImport}
                            >
                                Nhập Excel (Mock)
                            </Button>
                            <Button 
                                icon={<DownloadOutlined />} 
                                onClick={handleExport}
                            >
                                Xuất Excel
                            </Button>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={handleAdd}
                            >
                                Thêm Vật tư Mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>


            <Table
                columns={columns}
                dataSource={filteredParts}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1300 }}
                bordered
                className="tw-shadow-xl"
            />

            {/* Modal Thêm/Sửa Vật tư (giữ nguyên) */}
            <Modal
                title={currentPart ? "Chỉnh sửa Vật tư" : "Thêm Vật tư Mới"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                okText={currentPart ? "Lưu Thay Đổi" : "Thêm Vật tư"}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Tên Vật tư" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    {/* TRƯỜNG CATEGORY MỚI TRONG MODAL */}
                    <Form.Item name="category" label="Loại Vật tư" rules={[{ required: true }]}>
                         <Select placeholder="Chọn loại vật tư">
                            {PART_CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                        </Select>
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="stock" label="Số lượng Tồn" rules={[{ required: true, type: 'number', min: 0 }]}>
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="unit" label="Đơn vị" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="location" label="Vị trí Kho">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="vendor" label="Nhà cung cấp">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="description" label="Mô tả Chi tiết">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                     <Form.Item name="image" label="Link Hình ảnh (Mock)">
                        <Input placeholder="URL hình ảnh (Ảnh mock sẽ được gán nếu trống)" />
                    </Form.Item>
                </Form>
            </Modal>
            
            {/* Modal In QR Code */}
            <Modal
                title={<Title level={4}><PrinterOutlined /> In Mã QR Vật tư: {qrPart?.id}</Title>}
                open={isQRModalVisible}
                onCancel={() => setIsQRModalVisible(false)}
                footer={null}
                width={400}
            >
                {qrPart && <PrintableQRCode part={qrPart} />}
            </Modal>
        </Space>
    );
};

const SparePartsInventoryPage = () => (
    <App>
        <SparePartsInventoryPageContent />
    </App>
);

export default SparePartsInventoryPage;