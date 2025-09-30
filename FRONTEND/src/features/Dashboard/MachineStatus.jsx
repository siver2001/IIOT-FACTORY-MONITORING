// FRONTEND/src/features/Dashboard/MachineStatus.jsx

import React, { useMemo, useState } from 'react'; 
import { Card, Col, Row, Typography, Space, Divider, Statistic, Select, Button, Tag, Progress } from 'antd'; 
import { 
    DesktopOutlined, ToolOutlined, ClockCircleOutlined, HeartFilled, 
    ProfileOutlined, BarChartOutlined, HomeOutlined, AlertOutlined, CheckCircleOutlined // ĐÃ THÊM CheckCircleOutlined
} from '@ant-design/icons';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { Link } from 'react-router-dom';

// IMPORT CÁC COMPONENT SCADA MỚI
import ScadaViewCNC from './ScadaViewCNC';
import ScadaViewLaser from './ScadaViewLaser';
import ScadaViewPress from './ScadaViewPress';


const { Title, Text } = Typography;
const { Option } = Select;

// Danh sách máy MOCK được cập nhật để phân biệt loại
const mockMachines = [
    { id: 'M-CNC-101', area: 'Dây chuyền A', model: 'CNC Lathe X1', type: 'CNC', status: 'RUN' },
    { id: 'M-LASER-102', area: 'Dây chuyền B', model: 'Laser Cutter V2', type: 'LASER', status: 'IDLE' },
    { id: 'M-PRESS-103', area: 'Dây chuyền C', model: 'Hydraulic Press HP5', type: 'PRESS', status: 'RUN' },
    { id: 'M-ROBOT-104', area: 'Dây chuyền D', model: 'Assembly Robot R1', type: 'ROBOT', status: 'ERROR' },
];

const getStatusTag = (status) => {
    switch (status) {
        case 'RUN': return { color: 'green', text: 'ĐANG CHẠY', icon: <CheckCircleOutlined /> };
        case 'IDLE':
        case 'UNKNOWN': return { color: 'blue', text: 'DỪNG CHỜ', icon: <ClockCircleOutlined /> };
        case 'ERROR': return { color: 'red', text: 'LỖI', icon: <AlertOutlined /> };
        case 'CRITICAL': return { color: 'red', text: 'CRITICAL', icon: <AlertOutlined /> };
        default: return { color: 'default', text: 'UNKNOWN', icon: <HomeOutlined /> };
    }
};

// Hàm mô phỏng dữ liệu chi tiết cho SCADA View
const deriveMachineData = (machineId, liveData) => {
    const mockMachine = mockMachines.find(m => m.id === machineId);
    
    // Logic hash và noiseFactor giữ nguyên để dữ liệu thay đổi theo real-time data
    const hash = machineId.charCodeAt(machineId.length - 1); 
    const noiseFactor = Math.sin(liveData.healthScore / 100 * Math.PI) * 10;
    
    const baseHealth = 70 + (hash % 15) + noiseFactor;
    const baseRUL = liveData.RUL * 0.8 + (hash * 50);
    const baseOee = liveData.OEE * 0.9 + (hash * 0.5);

    const healthScore = parseFloat(Math.min(100, Math.max(50, baseHealth)).toFixed(1));
    const rul = Math.max(0, Math.round(baseRUL / 100) * 100);
    const oee = parseFloat(Math.min(100, Math.max(50, baseOee)).toFixed(1));
    const currentLoad = parseFloat((50 + (hash * 2) + (noiseFactor * 2)).toFixed(1));

    // Logic mock hiện tại dựa trên tổng số lỗi/chạy của liveData
    let status;
    if (machineId === 'M-CNC-101') { status = liveData.RunningCount > 105 ? 'RUN' : 'IDLE'; }
    else if (machineId === 'M-PRESS-103') { status = liveData.ErrorCount > 10 ? 'ERROR' : 'RUN'; }
    else { status = mockMachine?.status || 'UNKNOWN'; }
    
    return {
        id: machineId,
        area: mockMachine?.area || 'N/A',
        model: mockMachine?.model || 'N/A',
        type: mockMachine?.type || 'UNKNOWN', // THÊM TYPE
        status: status, 
        // Mock Temp & Vibration with small real-time fluctuations
        temp: parseFloat((35 + noiseFactor/5 + hash).toFixed(1)) || 35,
        vibration: parseFloat((0.5 + noiseFactor/10 + hash * 0.1).toFixed(2)) || 0.5,
        healthScore: healthScore,
        RUL: rul, 
        OEE: oee,
        currentLoad: parseFloat(Math.min(100, Math.max(0, currentLoad)).toFixed(1)),
        runningTime: parseFloat((150 + hash * 5 + noiseFactor).toFixed(1))
    };
};


const MachineScadaPage = () => {
    const liveData = useRealTimeData();
    const [selectedMachineId, setSelectedMachineId] = useState(mockMachines[0].id);

    // Tạo mảng options cho Select
    const machineOptions = useMemo(() => {
        return mockMachines.map(m => ({
            value: m.id,
            label: `${m.id} - ${m.model}`,
        }));
    }, []);

    const machineDetails = useMemo(() => {
        return deriveMachineData(selectedMachineId, liveData);
    }, [selectedMachineId, liveData]);

    const { color, text: statusText, icon: statusIcon } = getStatusTag(machineDetails.status);
    
    const isRULCritical = machineDetails.RUL < 1000;
    const healthProgressColor = machineDetails.healthScore > 80 ? '#52c41a' : (machineDetails.healthScore > 60 ? '#faad14' : '#ff4d4f');

    // HÀM CHỌN COMPONENT SCADA
    const renderScadaView = () => {
        switch (machineDetails.type) {
            case 'CNC':
                return <ScadaViewCNC machineDetails={machineDetails} liveData={liveData} />;
            case 'LASER':
                return <ScadaViewLaser machineDetails={machineDetails} liveData={liveData} />;
            case 'PRESS':
                return <ScadaViewPress machineDetails={machineDetails} liveData={liveData} />;
            default:
                return (
                    <Card><Title level={4}>SCADA view không khả dụng cho loại máy {machineDetails.type} (Chỉ hỗ trợ CNC, LASER, PRESS).</Title></Card>
                );
        }
    }

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><DesktopOutlined /> Màn hình Giám sát SCADA Trực tiếp</Title>
            
            {/* Control & Selection Panel */}
            <Card title="Chọn Thiết bị & Thông tin Tổng quan" variant="default" className="tw-shadow-md">
                <Row gutter={24} align="middle">
                    <Col span={6}>
                        <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Máy đang giám sát:</label>
                        <Select
                            value={selectedMachineId} 
                            style={{ width: '100%' }}
                            onChange={setSelectedMachineId}
                            showSearch
                            options={machineOptions}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic 
                            title="Trạng thái Hiện tại" 
                            value={statusText} 
                            prefix={statusIcon}
                            valueStyle={{ color: color === 'default' ? '#000' : color }}
                        />
                    </Col>
                    <Col span={4}>
                         <Statistic 
                            title="Health Score" 
                            value={machineDetails.healthScore} 
                            suffix="/100"
                            prefix={<HeartFilled />}
                            valueStyle={{ color: healthProgressColor }}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="RUL (Tuổi thọ còn lại)"
                            value={machineDetails.RUL}
                            suffix=" giờ"
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: isRULCritical ? '#cf1322' : '#1677ff' }}
                        />
                    </Col>
                    <Col span={6} style={{ textAlign: 'right' }}>
                        <Space>
                            <Button type="default" icon={<AlertOutlined />} size="large" onClick={() => console.log('Chuyển đến Log Lỗi')}>
                                Xem Alert Log
                            </Button>
                             <Link to={`/maintenance/profile/${selectedMachineId}`}>
                                <Button type="default" icon={<ProfileOutlined />} size="large">
                                    Hồ sơ Máy
                                </Button>
                            </Link>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Divider orientation="left"><ToolOutlined /> Màn hình SCADA Chi tiết ({machineDetails.type})</Divider>

            {/* KHU VỰC RENDER COMPONENT SCADA MỚI */}
            {renderScadaView()}
            
        </Space>
    );
};

export default MachineScadaPage;