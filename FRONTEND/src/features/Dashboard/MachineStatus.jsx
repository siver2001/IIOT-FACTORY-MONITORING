// FRONTEND/src/features/Dashboard/MachineStatus.jsx

import React, { useMemo } from 'react'; 
import { Card, Col, Row, Table, Tag, Typography, Button, Space, Divider, Statistic } from 'antd';
import { CheckCircleOutlined, StopOutlined, AlertOutlined, LoadingOutlined, DesktopOutlined, ClockCircleOutlined, ProfileOutlined } from '@ant-design/icons';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { Link } from 'react-router-dom'; // Import Link

const { Title } = Typography;

// Mock Data cho danh sách máy (Giữ nguyên bên ngoài)
const mockMachines = Array.from({ length: 10 }, (_, i) => ({
    id: `M-CNC-${101 + i}`,
    area: 'Dây chuyền A',
    model: `CNC Lathe ${i + 1}`,
    status: i % 3 === 0 ? 'ERROR' : i % 3 === 1 ? 'IDLE' : 'RUN',
    temp: 35 + i + (i % 2 === 0 ? 10 : 0), // Mock Temp
    vibration: 0.5 + i * 0.1 + (i % 3 === 0 ? 1.5 : 0), // Mock Vibration
}));

// Hàm logic để xác định trạng thái (Nhận data qua tham số)
const getStatusData = (machineId, data) => {
    // Mô phỏng data real-time ảnh hưởng đến trạng thái
    if (data.ErrorCount > 10 && machineId.includes('CNC-102')) return 'CRITICAL';
    if (data.RunningCount < 105 && machineId.includes('CNC-101')) return 'IDLE';
    return mockMachines.find(m => m.id === machineId)?.status || 'UNKNOWN';
};

const getStatusTag = (status) => {
    switch (status) {
        case 'RUN':
            return <Tag icon={<CheckCircleOutlined />} color="green">ĐANG CHẠY</Tag>;
        case 'IDLE':
        case 'UNKNOWN': 
            return <Tag icon={<ClockCircleOutlined />} color="blue">DỪNG CHỜ</Tag>;
        case 'ERROR':
            return <Tag icon={<AlertOutlined />} color="red">LỖI</Tag>;
        case 'CRITICAL':
            return <Tag icon={<StopOutlined />} color="red" style={{ fontWeight: 'bold' }}>CRITICAL</Tag>;
        default:
            return <Tag color="default">UNKNOWN</Tag>;
    }
};

const MachineStatus = () => {
    const liveData = useRealTimeData();
    
    // FIX LỖI HOOK: Định nghĩa columns trong useMemo để sử dụng liveData
    const machineColumns = useMemo(() => ([
        { title: 'Mã Máy', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id.localeCompare(b.id), width: 150 },
        { title: 'Khu vực', dataIndex: 'area', key: 'area', width: 120 },
        { title: 'Model', dataIndex: 'model', key: 'model', width: 150 },
        {
            title: 'Trạng thái (LIVE)',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => {
                const liveStatus = getStatusData(record.id, liveData); 
                return getStatusTag(liveStatus);
            },
            sorter: (a, b) => a.status.localeCompare(b.status),
            filters: [{ text: 'RUN', value: 'RUN' }, { text: 'ERROR', value: 'ERROR' }],
            onFilter: (value, record) => getStatusData(record.id, liveData) === value, 
            width: 150
        },
        {
            title: 'Nhiệt độ',
            dataIndex: 'temp',
            key: 'temp',
            render: (text) => <Tag color={text > 40 ? 'volcano' : 'green'}>{text}°C</Tag>,
            sorter: (a, b) => a.temp - b.temp,
            width: 120
        },
        {
            title: 'Rung động (Vib)',
            dataIndex: 'vibration',
            key: 'vibration',
            render: (text) => <Tag color={text > 1.5 ? 'red' : 'blue'}>{text} mm/s</Tag>,
            sorter: (a, b) => a.vibration - b.vibration,
            width: 130
        },
        {
            title: 'Hồ sơ', // Thay đổi tên cột
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Link to={`/maintenance/profile/${record.id}`}>
                    <Button size="small" icon={<ProfileOutlined />}>
                        Xem Hồ sơ
                    </Button>
                </Link>
            ),
        },
    ]), [liveData]); // Dependency array: Re-calculate columns khi liveData thay đổi

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><DesktopOutlined /> Giám sát Trạng thái Máy Móc Trực tiếp</Title>
            <Divider orientation="left">Thông tin Tổng quan & Lọc</Divider>
            
            <Row gutter={16}>
                <Col span={6}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #1677ff' }}>
                        <Statistic title="Máy đang Chạy" value={liveData.RunningCount} prefix={<CheckCircleOutlined style={{ color: 'green' }} />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #ff4d4f' }}>
                        <Statistic title="Máy đang Lỗi" value={liveData.ErrorCount} prefix={<StopOutlined style={{ color: 'red' }} />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #faad14' }}>
                        <Statistic title="Tổng số Máy" value={liveData.MachineCount} prefix={<LoadingOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Bảng Trạng thái Chi tiết (Real-time)</Divider>
            <Table
                columns={machineColumns}
                dataSource={mockMachines}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ y: 500 }}
                size="large"
                bordered
            />
        </Space>
    );
};
export default MachineStatus;