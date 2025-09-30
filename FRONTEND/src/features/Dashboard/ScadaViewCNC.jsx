// FRONTEND/src/features/Dashboard/ScadaViewCNC.jsx

import React from 'react';
// ĐÃ SỬA: Thêm Divider vào import từ 'antd'
import { Card, Typography, Space, Row, Col, Statistic, Tag, Progress, Button, Spin, Divider } from 'antd'; 
import { 
    ToolOutlined, ClockCircleOutlined, FireOutlined, ThunderboltOutlined, 
    PoweroffOutlined, ArrowUpOutlined, CheckCircleOutlined, WarningOutlined,
    SyncOutlined, LoadingOutlined, ProfileOutlined, SettingOutlined, BarChartOutlined // ĐÃ XÓA Divider khỏi đây
} from '@ant-design/icons';
import cncScadaImage from '../../assets/scada/cnc_scada_layout.png'; // IMPORT HÌNH ẢNH SCADA

const { Title, Text } = Typography;

const ScadaViewCNC = ({ machineDetails, liveData }) => {
    // Dữ liệu mock riêng cho CNC
    const spindleLoad = machineDetails.currentLoad; // Tái sử dụng currentLoad
    const feedRate = parseFloat((500 + Math.sin(liveData.RUL / 500) * 100).toFixed(1));
    const toolLifePercent = Math.min(100, Math.round(machineDetails.healthScore * 1.2)); // Tool life based on health
    const coolantFlow = machineDetails.OEE * 1.5;
    const spindleSpeed = 800 + Math.floor(Math.random() * 200); // RPM
    const motorCurrent = parseFloat((15 + Math.random() * 5).toFixed(1)); // Amps

    const loadColor = spindleLoad > 85 ? 'red' : (spindleLoad > 70 ? 'orange' : 'green');
    const toolLifeColor = toolLifePercent > 60 ? 'green' : (toolLifePercent > 30 ? 'orange' : 'red');
    const tempColor = machineDetails.temp > 45 ? 'red' : (machineDetails.temp > 40 ? 'orange' : 'green');
    const vibrationColor = machineDetails.vibration > 1.5 ? 'red' : (machineDetails.vibration > 1.0 ? 'orange' : 'green');
    const coolantStatusColor = coolantFlow < 100 ? 'red' : 'green';
    
    // Khai báo 2 biến còn thiếu để khắc phục lỗi ReferenceError
    const isRULCritical = machineDetails.RUL < 1000;
    const healthProgressColor = machineDetails.healthScore > 80 ? '#52c41a' : (machineDetails.healthScore > 60 ? '#faad14' : '#ff4d4f');

    const renderStatusLight = (colorClass, condition) => (
        <span className={`tw-h-4 tw-w-4 tw-rounded-full tw-inline-block tw-mr-2 ${condition ? colorClass : 'tw-bg-gray-500'}`} />
    );

    return (
        <Row gutter={24} style={{ minHeight: 600 }}>
            
            {/* CỘT 1: SCADA VISUALIZATION (Main Process Flow) */}
            <Col span={18}>
                <Card 
                    title={<Title level={4} style={{ margin: 0 }}><ToolOutlined /> Màn hình SCADA: Máy Phay CNC 5 trục (M-CNC-101)</Title>}
                    className="tw-shadow-xl tw-h-full"
                    styles={{ body: { padding: 0 } }}
                >
                    <div 
                        className="tw-relative tw-w-full tw-h-[700px] tw-bg-cover tw-bg-center tw-text-white tw-font-mono tw-text-sm" 
                        style={{ backgroundImage: `url(${cncScadaImage})`, backgroundSize: '100% 100%' }}
                    >
                        {/* --- OVERLAYS CÁC CHỈ SỐ TRÊN HÌNH SCADA --- */}

                        {/* TRẠNG THÁI MÁY CHUNG */}
                        <div className="tw-absolute" style={{ top: '1%', left: '1%' }}>
                            <Tag color={machineDetails.status === 'RUN' ? 'green' : (machineDetails.status === 'IDLE' ? 'blue' : 'red')} className="tw-text-lg tw-px-3 tw-py-1">
                                {machineDetails.status === 'RUN' ? <Spin indicator={<LoadingOutlined style={{ fontSize: 18 }} spin />} className='tw-mr-2' /> : (machineDetails.status === 'IDLE' ? <ClockCircleOutlined className='tw-mr-2' /> : <WarningOutlined className='tw-mr-2' />)}
                                {machineDetails.status.toUpperCase()}
                            </Tag>
                        </div>
                        
                        {/* BÀN MÁY / TRẠNG THÁI GIA CÔNG */}
                        <div className="tw-absolute tw-text-left" style={{ top: '32%', left: '20%' }}>
                            <Text className="tw-block tw-text-lg tw-font-bold" style={{color: '#90EE90'}}>GIA CÔNG CHI TIẾT 1</Text>
                            <Text className="tw-block">Thời gian còn lại: {Math.max(0, 15 - (liveData.RunningCount % 15)).toFixed(1)} phút</Text>
                            <Text className="tw-block">Chương trình: PROG_A_001.NC</Text>
                        </div>

                        {/* TRỤC CHÍNH (SPINDLE) */}
                        <div className="tw-absolute tw-text-left" style={{ top: '16%', left: '55%' }}>
                            <Text className={`tw-block tw-text-xl tw-font-bold ${loadColor === 'red' ? 'tw-text-red-500 tw-animate-pulse' : (loadColor === 'orange' ? 'tw-text-orange-400' : 'tw-text-green-400')}`}>
                                Tải Trục Chính: {spindleLoad.toFixed(1)}%
                            </Text>
                            <Text className="tw-block tw-text-lg">Tốc độ: {spindleSpeed} RPM</Text>
                        </div>

                        {/* NHIỆT ĐỘ TRỤC */}
                        <div className="tw-absolute tw-text-left" style={{ top: '27%', left: '55%' }}>
                            <Text className={`tw-block tw-text-xl tw-font-bold ${tempColor === 'red' ? 'tw-text-red-500 tw-animate-pulse' : (tempColor === 'orange' ? 'tw-text-orange-400' : 'tw-text-green-400')}`}>
                                Nhiệt độ Trục: {machineDetails.temp.toFixed(1)}°C
                            </Text>
                        </div>

                        {/* RUNG ĐỘNG */}
                        <div className="tw-absolute tw-text-left" style={{ top: '38%', left: '55%' }}>
                            <Text className={`tw-block tw-text-xl tw-font-bold ${vibrationColor === 'red' ? 'tw-text-red-500 tw-animate-pulse' : (vibrationColor === 'orange' ? 'tw-text-orange-400' : 'tw-text-green-400')}`}>
                                Rung động: {machineDetails.vibration.toFixed(2)} mm/s
                            </Text>
                        </div>

                        {/* HỆ THỐNG LÀM MÁT (COOLANT SYSTEM) */}
                        <div className="tw-absolute tw-text-left" style={{ top: '55%', left: '55%' }}>
                            <div className="tw-flex tw-items-center">
                                {renderStatusLight(coolantStatusColor === 'red' ? 'tw-bg-red-500' : 'tw-bg-green-500', coolantFlow > 0)}
                                <Text className={`tw-text-xl tw-font-bold ${coolantStatusColor === 'red' ? 'tw-text-red-500' : 'tw-text-green-400'}`}>
                                    Bơm Coolant: {coolantFlow > 0 ? 'ON' : 'OFF'}
                                </Text>
                            </div>
                            <Text className="tw-block tw-text-lg">Lưu lượng: {coolantFlow.toFixed(1)} L/phút</Text>
                        </div>

                        {/* DỮ LIỆU ĐIỆN NĂNG */}
                        <div className="tw-absolute tw-text-left" style={{ top: '69%', left: '55%' }}>
                            <Text className="tw-block tw-text-xl tw-font-bold tw-text-blue-400">
                                Dòng điện Motor: {motorCurrent.toFixed(1)} A
                            </Text>
                        </div>

                        {/* TUỔI THỌ DỤNG CỤ (TOOL LIFE) */}
                        <div className="tw-absolute tw-text-left" style={{ top: '80%', left: '55%' }}>
                            <Text className={`tw-block tw-text-xl tw-font-bold ${toolLifeColor === 'red' ? 'tw-text-red-500' : (toolLifeColor === 'orange' ? 'tw-text-orange-400' : 'tw-text-green-400')}`}>
                                Tuổi thọ Dụng cụ: {toolLifePercent}%
                            </Text>
                            <Progress 
                                percent={toolLifePercent} 
                                showInfo={false} 
                                status={toolLifePercent < 30 ? 'exception' : (toolLifePercent < 60 ? 'active' : 'success')}
                                strokeColor={toolLifeColor === 'red' ? '#ff4d4f' : (toolLifeColor === 'orange' ? '#faad14' : '#52c41a')}
                                className="tw-w-32 tw-mt-1"
                            />
                        </div>

                        {/* KPI PdM ở góc */}
                        <div className="tw-absolute tw-p-2 tw-rounded-lg tw-bg-gray-700 tw-text-white" style={{ bottom: '1%', right: '1%' }}>
                            <Statistic title="Health Score" value={machineDetails.healthScore} suffix="/100" valueStyle={{ color: healthProgressColor, fontSize: 18 }} />
                            <Statistic title="RUL (Ước tính)" value={machineDetails.RUL} suffix="giờ" valueStyle={{ color: isRULCritical ? '#ff4d4f' : '#1677ff', fontSize: 18 }} />
                        </div>

                    </div>
                </Card>
            </Col>

            {/* CỘT 2: THÔNG TIN CHI TIẾT & HÀNH ĐỘNG */}
            <Col span={6}>
                <Space direction="vertical" size={16} style={{ display: 'flex' }}>
                    
                    {/* THÔNG TIN MÁY */}
                    <Card size="small" title={<Space><ProfileOutlined /> Thông tin Máy</Space>} className="tw-shadow-md">
                        <p>ID: <Text strong>{machineDetails.id}</Text></p>
                        <p>Model: <Text strong>{machineDetails.model}</Text></p>
                        <p>Khu vực: <Text strong>{machineDetails.area}</Text></p>
                        <p>Thời gian chạy: <Text strong>{machineDetails.runningTime} giờ</Text></p>
                    </Card>

                    {/* HÀNH ĐỘNG ĐIỀU KHIỂN */}
                    <Card size="small" title={<Space><SettingOutlined /> Điều khiển & Vận hành</Space>} className="tw-shadow-md">
                        <Button type="primary" block className="tw-mb-2" disabled={machineDetails.status === 'RUN'}>
                            <SyncOutlined /> Khởi động Máy
                        </Button>
                        <Button type="primary" danger block className="tw-mb-2" disabled={machineDetails.status !== 'RUN'}>
                            <PoweroffOutlined /> Dừng Khẩn cấp
                        </Button>
                        <Button type="default" block>
                            <BarChartOutlined /> Xem biểu đồ xu hướng
                        </Button>
                    </Card>

                    {/* CẢNH BÁO */}
                    <Card size="small" title={<Space><WarningOutlined /> Cảnh báo Hiện tại</Space>} className="tw-shadow-md tw-border-l-4 tw-border-red-500">
                        {machineDetails.status === 'ERROR' ? (
                            <Text type="danger"><WarningOutlined /> Lỗi giao tiếp trục Z!</Text>
                        ) : (
                            <Text type="success">Không có cảnh báo</Text>
                        )}
                        <Divider style={{ margin: '10px 0' }} />
                        <Text type="secondary" className='tw-block tw-text-xs'>Cảnh báo cuối: Quá nhiệt Spindle (10:30 AM)</Text>
                    </Card>
                    
                </Space>
            </Col>
        </Row>
    );
};

export default ScadaViewCNC;