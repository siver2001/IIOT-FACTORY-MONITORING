// FRONTEND/src/features/Dashboard/ScadaViewLaser.jsx

import React from 'react';
// ĐÃ SỬA: Import tất cả các components cần thiết
import { Card, Typography, Space, Row, Col, Statistic, Tag, Progress, Button, Spin, Divider } from 'antd'; 
import { 
    FireOutlined, BulbOutlined, StockOutlined, SettingOutlined, 
    ClockCircleOutlined, ThunderboltOutlined, CheckCircleOutlined,
    WarningOutlined, SyncOutlined, LoadingOutlined, ProfileOutlined, 
    PoweroffOutlined, BarChartOutlined 
} from '@ant-design/icons';
import laserScadaImage from '../../assets/scada/laser_scada_layout.png'; // IMPORT HÌNH ẢNH SCADA

const { Title, Text } = Typography;

const ScadaViewLaser = ({ machineDetails, liveData }) => {
    // Dữ liệu mock riêng cho Laser
    const laserPower = machineDetails.healthScore * 0.8; 
    const gasPressure = parseFloat((15 + Math.random() * 2).toFixed(1));
    const chillerTemp = parseFloat((20 + Math.random() * 5).toFixed(1));
    const cuttingSpeed = machineDetails.OEE * 10;
    const waterFlow = parseFloat((10 + Math.random() * 2).toFixed(1)); // L/min

    const powerColor = laserPower < 60 ? 'red' : (laserPower < 80 ? 'orange' : 'green');
    const gasColor = gasPressure < 16 ? 'red' : 'green';
    const chillerTempColor = chillerTemp > 25 ? 'red' : (chillerTemp > 22 ? 'orange' : 'green');

    // FIX LỖI: Định nghĩa isRULCritical và healthProgressColor
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
                    title={<Title level={4} style={{ margin: 0 }}><FireOutlined /> Màn hình SCADA: Máy Cắt Laser Fiber (M-LASER-102)</Title>}
                    className="tw-shadow-xl tw-h-full"
                    styles={{ body: { padding: 0 } }}
                >
                    <div 
                        className="tw-relative tw-w-full tw-h-[700px] tw-bg-cover tw-bg-center tw-text-white tw-font-mono tw-text-sm" 
                        style={{ backgroundImage: `url(${laserScadaImage})`, backgroundSize: '100% 100%' }}
                    >
                        {/* --- OVERLAYS CÁC CHỈ SỐ TRÊN HÌNH SCADA --- */}

                        {/* TRẠNG THÁI MÁY CHUNG */}
                        <div className="tw-absolute" style={{ top: '1%', left: '1%' }}>
                            <Tag color={machineDetails.status === 'RUN' ? 'green' : (machineDetails.status === 'IDLE' ? 'blue' : 'red')} className="tw-text-lg tw-px-3 tw-py-1">
                                {machineDetails.status === 'RUN' ? <Spin indicator={<LoadingOutlined style={{ fontSize: 18 }} spin />} className='tw-mr-2' /> : (machineDetails.status === 'IDLE' ? <ClockCircleOutlined className='tw-mr-2' /> : <WarningOutlined className='tw-mr-2' />)}
                                {machineDetails.status.toUpperCase()}
                            </Tag>
                        </div>

                        {/* NGUỒN LASER */}
                        <div className="tw-absolute tw-text-left" style={{ top: '10%', left: '7%' }}>
                            <Text className="tw-block tw-text-xl tw-font-bold" style={{color: '#90EE90'}}>NGUỒN LASER</Text>
                            <div className="tw-flex tw-items-center tw-mt-1">
                                {renderStatusLight(powerColor === 'red' ? 'tw-bg-red-500' : (powerColor === 'orange' ? 'tw-bg-orange-400' : 'tw-bg-green-500'), laserPower > 0)}
                                <Text className={`tw-text-xl tw-font-bold ${powerColor === 'red' ? 'tw-text-red-500' : (powerColor === 'orange' ? 'tw-text-orange-400' : 'tw-text-green-400')}`}>
                                    POWER: {laserPower.toFixed(1)}%
                                </Text>
                            </div>
                            <Text className="tw-block tw-text-lg">Điện áp: 380V</Text>
                        </div>

                        {/* KHÍ TRỢ GIÚP (ASSIST GAS) */}
                        <div className="tw-absolute tw-text-left" style={{ top: '10%', left: '35%' }}>
                            <Text className="tw-block tw-text-xl tw-font-bold" style={{color: '#90EE90'}}>KHÍ TRỢ GIÚP</Text>
                            <div className="tw-flex tw-items-center tw-mt-1">
                                {renderStatusLight(gasColor === 'red' ? 'tw-bg-red-500' : 'tw-bg-green-500', gasPressure > 10)}
                                <Text className={`tw-text-xl tw-font-bold ${gasColor === 'red' ? 'tw-text-red-500' : 'tw-text-green-400'}`}>
                                    ÁP SUẤT: {gasPressure.toFixed(1)} bar
                                </Text>
                            </div>
                            <Text className="tw-block tw-text-lg">Loại khí: N2</Text>
                        </div>

                        {/* ĐẦU CẮT (CUTTING HEAD) */}
                        <div className="tw-absolute tw-text-left" style={{ top: '45%', left: '40%' }}>
                            <Text className="tw-block tw-text-xl tw-font-bold" style={{color: '#90EE90'}}>ĐẦU CẮT</Text>
                            <Text className="tw-block tw-text-lg">Tốc độ cắt: {cuttingSpeed.toFixed(1)} mm/s</Text>
                            <Text className="tw-block tw-text-lg">Focus Lens: OK</Text>
                        </div>

                        {/* HỆ THỐNG LÀM MÁT (CHILLER) */}
                        <div className="tw-absolute tw-text-left" style={{ top: '70%', left: '7%' }}>
                            <Text className="tw-block tw-text-xl tw-font-bold" style={{color: '#90EE90'}}>CHILLER</Text>
                            <div className="tw-flex tw-items-center tw-mt-1">
                                {renderStatusLight(chillerTempColor === 'red' ? 'tw-bg-red-500' : (chillerTempColor === 'orange' ? 'tw-bg-orange-400' : 'tw-bg-green-500'), chillerTemp < 28)}
                                <Text className={`tw-text-xl tw-font-bold ${chillerTempColor === 'red' ? 'tw-text-red-500' : (chillerTempColor === 'orange' ? 'tw-text-orange-400' : 'tw-text-green-400')}`}>
                                    NHIỆT ĐỘ: {chillerTemp.toFixed(1)}°C
                                </Text>
                            </div>
                            <Text className="tw-block tw-text-lg">Lưu lượng nước: {waterFlow.toFixed(1)} L/phút</Text>
                        </div>

                        {/* BÀN MÁY */}
                        <div className="tw-absolute tw-text-left" style={{ top: '80%', left: '70%' }}>
                            <Text className="tw-block tw-text-xl tw-font-bold" style={{color: '#90EE90'}}>BÀN MÁY</Text>
                            <Text className="tw-block tw-text-lg">Vị trí X: 1200mm</Text>
                            <Text className="tw-block tw-text-lg">Vị trí Y: 800mm</Text>
                        </div>

                        {/* KPI PdM ở góc */}
                        <div className="tw-absolute tw-p-2 tw-rounded-lg tw-bg-gray-700 tw-text-white" style={{ bottom: '1%', right: '1%' }}>
                            <Statistic title="Health Score (Nguồn)" value={machineDetails.healthScore} suffix="/100" valueStyle={{ color: healthProgressColor, fontSize: 18 }} />
                            <Statistic title="RUL (Nguồn)" value={machineDetails.RUL} suffix="giờ" valueStyle={{ color: isRULCritical ? '#ff4d4f' : '#1677ff', fontSize: 18 }} />
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
                            <SyncOutlined /> Khởi động Cắt
                        </Button>
                        <Button type="primary" danger block className="tw-mb-2" disabled={machineDetails.status !== 'RUN'}>
                            <PoweroffOutlined /> Dừng Laser
                        </Button>
                        <Button type="default" block>
                            <BarChartOutlined /> Xem biểu đồ xu hướng
                        </Button>
                    </Card>

                    {/* CẢNH BÁO */}
                    <Card size="small" title={<Space><WarningOutlined /> Cảnh báo Hiện tại</Space>} className="tw-shadow-md tw-border-l-4 tw-border-red-500">
                        {chillerTemp > 25 ? (
                            <Text type="danger"><WarningOutlined /> Nhiệt độ Chiller cao!</Text>
                        ) : (
                            <Text type="success">Không có cảnh báo</Text>
                        )}
                        <Divider style={{ margin: '10px 0' }} />
                        <Text type="secondary" className='tw-block tw-text-xs'>Cảnh báo cuối: Áp suất khí thấp (11:15 AM)</Text>
                    </Card>
                    
                </Space>
            </Col>
        </Row>
    );
};

export default ScadaViewLaser;