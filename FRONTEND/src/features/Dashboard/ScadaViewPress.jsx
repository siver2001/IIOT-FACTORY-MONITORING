// FRONTEND/src/features/Dashboard/ScadaViewPress.jsx

import React from 'react';
import { Card, Typography, Space, Row, Col, Statistic, Tag, Progress, Divider, Button, Spin } from 'antd';
import { 
    ToolOutlined, ClockCircleOutlined, SettingOutlined, AlertOutlined, 
    CheckCircleOutlined, ThunderboltOutlined, FallOutlined, RiseOutlined,
    SyncOutlined, LoadingOutlined, PoweroffOutlined, ProfileOutlined, 
    BarChartOutlined, WarningOutlined,
} from '@ant-design/icons';
// IMPORT MOCK IMAGE (Giả định tệp này tồn tại trong assets/scada/)
import pressScadaImage from '../../assets/scada/press_scada_layout.png'; 

const { Title, Text } = Typography;

const ScadaViewPress = ({ machineDetails, liveData }) => {
    // Dữ liệu mock riêng cho Press (Tái sử dụng một số logic từ liveData)
    // Dữ liệu sẽ thay đổi dựa trên logic real-time trong useRealTimeData
    const hydraulicPressure = parseFloat((250 + Math.random() * 50).toFixed(1));
    const ramSpeed = parseFloat((120 + Math.sin(liveData.healthScore / 100 * Math.PI) * 20).toFixed(1)); 
    const oilTemperature = machineDetails.temp; // Tái sử dụng nhiệt độ máy
    const productionCounter = liveData.MTBF; // Tái sử dụng MTBF cho mục đích counter
    
    // --- Logic Màu sắc và Ngưỡng ---
    const pressureColor = hydraulicPressure > 290 ? 'red' : (hydraulicPressure < 255 ? 'orange' : 'green');
    const tempColor = oilTemperature > 50 ? 'red' : (oilTemperature > 45 ? 'orange' : 'green');
    const ramSpeedColor = ramSpeed < 100 ? 'red' : 'green';
    const isRULCritical = machineDetails.RUL < 1000;
    
    const renderStatusLight = (colorClass, condition) => (
        <span className={`tw-h-4 tw-w-4 tw-rounded-full tw-inline-block tw-mr-2 ${condition ? colorClass : 'tw-bg-gray-500'}`} />
    );

    // Lấy thông tin trạng thái để hiển thị trên SCADA
    const { color, text: statusText, icon: statusIcon } = {
        'RUN': { color: 'green', text: 'ĐANG ÉP', icon: <CheckCircleOutlined /> },
        'IDLE': { color: 'blue', text: 'DỪNG CHỜ', icon: <ClockCircleOutlined /> },
        'ERROR': { color: 'red', text: 'LỖI', icon: <AlertOutlined /> },
    }[machineDetails.status] || { color: 'default', text: 'UNKNOWN', icon: <WarningOutlined /> };


    return (
        <Row gutter={24} style={{ minHeight: 600 }}>
            
            {/* CỘT 1: SCADA VISUALIZATION (Main Process Flow) - RỘNG (span 18) */}
            <Col span={18}>
                <Card 
                    title={<Title level={4} style={{ margin: 0 }}><ToolOutlined /> Màn hình SCADA: Máy Ép Thủy lực (M-PRESS-103)</Title>}
                    className="tw-shadow-xl tw-h-full"
                    styles={{ body: { padding: 0 } }}
                >
                    <div 
                        className="tw-relative tw-w-full tw-h-[700px] tw-bg-cover tw-bg-center tw-text-white tw-font-mono tw-text-sm" 
                        // SỬ DỤNG HÌNH ẢNH NỀN
                        style={{ backgroundImage: `url(${pressScadaImage})`, backgroundSize: '100% 100%', minHeight: 600 }}
                    >
                        {/* --- OVERLAYS CÁC CHỈ SỐ TRÊN HÌNH SCADA --- */}

                        {/* TRẠNG THÁI MÁY CHUNG (Góc trên trái) */}
                        <div className="tw-absolute" style={{ top: '1%', left: '1%' }}>
                            <Tag 
                                color={color} 
                                className={`tw-text-lg tw-px-3 tw-py-1 ${machineDetails.status === 'ERROR' ? 'alert-active-flash tw-animate-pulse' : ''}`}
                            >
                                {machineDetails.status === 'RUN' ? <Spin indicator={<LoadingOutlined style={{ fontSize: 18 }} spin />} className='tw-mr-2' /> : statusIcon}
                                {statusText.toUpperCase()}
                            </Tag>
                        </div>

                        {/* ÁP SUẤT THỦY LỰC (Góc trên phải) */}
                        <div className="tw-absolute tw-text-right" style={{ top: '5%', right: '5%' }}>
                            <Text className="tw-block tw-text-xl tw-font-bold" style={{color: '#90EE90'}}>ÁP SUẤT DẦU</Text>
                            <div className="tw-flex tw-items-center tw-justify-end tw-mt-1">
                                {renderStatusLight(pressureColor === 'red' ? 'tw-bg-red-500' : (pressureColor === 'orange' ? 'tw-bg-orange-400' : 'tw-bg-green-500'), hydraulicPressure > 250)}
                                <Text className={`tw-text-2xl tw-font-bold ${pressureColor === 'red' ? 'tw-text-red-500 tw-animate-pulse' : (pressureColor === 'orange' ? 'tw-text-orange-400' : 'tw-text-green-400')}`}>
                                    {hydraulicPressure.toFixed(1)} bar
                                </Text>
                            </div>
                            <Text className="tw-block tw-text-lg">Ngưỡng Max: 300 bar</Text>
                        </div>
                        
                        {/* TỐC ĐỘ RAM (Gần trục chính) */}
                        <div className="tw-absolute tw-text-center" style={{ top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <Text className="tw-block tw-text-xl tw-font-bold" style={{color: '#90EE90'}}>TỐC ĐỘ RAM</Text>
                            <Text className={`tw-block tw-text-3xl tw-font-bold ${ramSpeedColor === 'red' ? 'tw-text-red-500 tw-animate-pulse' : 'tw-text-blue-400'}`}>
                                {ramSpeed.toFixed(1)} mm/s
                            </Text>
                            <Text className="tw-block tw-text-lg">Chiều sâu: {strokeDepth} mm</Text>
                        </div>
                        
                        {/* NHIỆT ĐỘ DẦU (Gần bơm/bộ nguồn) */}
                        <div className="tw-absolute tw-text-left" style={{ bottom: '25%', left: '15%' }}>
                            <Text className="tw-block tw-text-xl tw-font-bold" style={{color: '#90EE90'}}>NHIỆT ĐỘ DẦU</Text>
                            <div className="tw-flex tw-items-center tw-mt-1">
                                {renderStatusLight(tempColor === 'red' ? 'tw-bg-red-500' : (tempColor === 'orange' ? 'tw-bg-orange-400' : 'tw-bg-green-500'), oilTemperature > 40)}
                                <Text className={`tw-text-2xl tw-font-bold ${tempColor === 'red' ? 'tw-text-red-500 tw-animate-pulse' : (tempColor === 'orange' ? 'tw-text-orange-400' : 'tw-text-green-400')}`}>
                                    {oilTemperature.toFixed(1)}°C
                                </Text>
                            </div>
                        </div>
                        
                        {/* KPI PdM ở góc (Tương tự CNC/Laser) */}
                        <div className="tw-absolute tw-p-2 tw-rounded-lg tw-bg-gray-700 tw-text-white" style={{ bottom: '1%', right: '1%' }}>
                            <Statistic 
                                title="Health Score" 
                                value={machineDetails.healthScore} 
                                suffix="/100" 
                                valueStyle={{ color: machineDetails.healthScore > 80 ? '#52c41a' : (machineDetails.healthScore > 60 ? '#faad14' : '#ff4d4f'), fontSize: 18 }} 
                            />
                            <Statistic 
                                title="RUL (Ước tính)" 
                                value={machineDetails.RUL} 
                                suffix="giờ" 
                                valueStyle={{ color: isRULCritical ? '#ff4d4f' : '#1677ff', fontSize: 18 }} 
                            />
                            <Divider style={{ margin: '8px 0', borderColor: '#333' }} />
                            <Statistic 
                                title="Sản lượng Lô" 
                                value={productionCounter} 
                                suffix=" chu kỳ" 
                                valueStyle={{ color: '#faad14', fontSize: 18 }} 
                            />
                        </div>

                    </div>
                </Card>
            </Col>

            {/* CỘT 2: THÔNG TIN CHI TIẾT & HÀNH ĐỘNG (span 6) */}
            <Col span={6}>
                <Space direction="vertical" size={16} style={{ display: 'flex' }}>
                    
                    {/* THÔNG TIN MÁY (Tương tự CNC/Laser) */}
                    <Card size="small" title={<Space><ProfileOutlined /> Thông tin Máy</Space>} className="tw-shadow-md">
                        <p>ID: <Text strong>{machineDetails.id}</Text></p>
                        <p>Model: <Text strong>{machineDetails.model}</Text></p>
                        <p>Khu vực: <Text strong>{machineDetails.area}</Text></p>
                        <p>Thời gian chạy: <Text strong>{machineDetails.runningTime} giờ</Text></p>
                    </Card>

                    {/* HÀNH ĐỘNG ĐIỀU KHIỂN (Tương tự CNC/Laser) */}
                    <Card size="small" title={<Space><SettingOutlined /> Điều khiển & Vận hành</Space>} className="tw-shadow-md">
                        <Button type="primary" block className="tw-mb-2" disabled={machineDetails.status === 'RUN'}>
                            <SyncOutlined /> Khởi động Chu kỳ Ép
                        </Button>
                        <Button type="primary" danger block className="tw-mb-2" disabled={machineDetails.status !== 'RUN'}>
                            <PoweroffOutlined /> Dừng Khẩn cấp
                        </Button>
                        <Button type="default" block>
                            <BarChartOutlined /> Xem biểu đồ xu hướng
                        </Button>
                    </Card>

                    {/* CẢNH BÁO (Tương tự CNC/Laser) */}
                    <Card size="small" title={<Space><WarningOutlined /> Cảnh báo Hiện tại</Space>} className="tw-shadow-md tw-border-l-4 tw-border-red-500">
                        {machineDetails.status === 'ERROR' ? (
                            <Text type="danger"><WarningOutlined /> Lỗi Áp suất Thủy lực bất thường!</Text>
                        ) : (
                            <Text type="success">Không có cảnh báo</Text>
                        )}
                        <Divider style={{ margin: '10px 0' }} />
                        <Text type="secondary" className='tw-block tw-text-xs'>Cảnh báo cuối: Nhiệt độ dầu vượt ngưỡng (12:05 PM)</Text>
                    </Card>
                    
                </Space>
            </Col>
        </Row>
    );
};

export default ScadaViewPress;