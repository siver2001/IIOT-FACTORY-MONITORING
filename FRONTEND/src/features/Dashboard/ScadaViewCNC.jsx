// FRONTEND/src/features/Dashboard/ScadaViewCNC.jsx

import React from 'react';
import { Card, Typography, Space, Row, Col, Statistic, Tag, Progress, Button, Spin, Divider } from 'antd'; 
import { 
    ToolOutlined, ClockCircleOutlined, ThunderboltOutlined, 
    PoweroffOutlined, ArrowUpOutlined, CheckCircleOutlined, WarningOutlined,
    SyncOutlined, LoadingOutlined, ProfileOutlined, SettingOutlined, BarChartOutlined,
    HeatMapOutlined, FallOutlined, RiseOutlined, AlertOutlined, HeartFilled  
} from '@ant-design/icons';
import cncScadaImage from '../../assets/scada/cnc_scada_layout.png'; 

const { Title, Text } = Typography;

// Component Mini KPI Card mới
const MiniKpiCard = ({ title, value, unit, color, icon: Icon, subTitle, isPulse = false, precision = 1 }) => (
    <Card 
        size="small" 
        variant="borderless" 
        className={`tw-shadow-md tw-mb-2 ${isPulse ? 'tw-animate-pulse tw-border-l-4 tw-border-red-500' : ''}`}
        styles={{ body: { padding: '10px 12px' } }}
    >
        <Statistic
            title={title}
            value={value}
            precision={precision}
            suffix={unit}
            prefix={Icon ? <Icon style={{ color: color, fontSize: 18 }} /> : null}
            valueStyle={{ color: color, fontSize: 20, fontWeight: 'bold' }}
        />
        {subTitle && <Text type="secondary" className="tw-block tw-text-xs tw-mt-1">{subTitle}</Text>}
    </Card>
);


const ScadaViewCNC = ({ machineDetails, liveData }) => {
    // Dữ liệu mock riêng cho CNC
    const spindleLoad = machineDetails.currentLoad; // Tái sử dụng currentLoad
    const feedRate = parseFloat((500 + Math.sin(liveData.RUL / 500) * 100).toFixed(1));
    const toolLifePercent = Math.min(100, Math.round(machineDetails.healthScore * 1.2)); 
    const coolantFlow = machineDetails.OEE * 1.5;
    const spindleSpeed = 800 + Math.floor(Math.random() * 200); // RPM
    const motorCurrent = parseFloat((15 + Math.random() * 5).toFixed(1)); // Amps

    const loadColor = spindleLoad > 85 ? '#ff4d4f' : (spindleLoad > 70 ? '#faad14' : '#52c41a');
    const toolLifeColor = toolLifePercent > 60 ? '#52c41a' : (toolLifePercent > 30 ? '#faad14' : '#ff4d4f');
    const tempColor = machineDetails.temp > 45 ? '#ff4d4f' : (machineDetails.temp > 40 ? '#faad14' : '#52c41a');
    const vibrationColor = machineDetails.vibration > 1.5 ? '#ff4d4f' : (machineDetails.vibration > 1.0 ? '#faad14' : '#52c41a');
    const isRULCritical = machineDetails.RUL < 1000;
    const healthProgressColor = machineDetails.healthScore > 80 ? '#52c41a' : (machineDetails.healthScore > 60 ? '#faad14' : '#ff4d4f');
    const isError = machineDetails.status === 'ERROR';

    const renderStatusLight = (colorClass, condition) => (
        <span className={`tw-h-4 tw-w-4 tw-rounded-full tw-inline-block tw-mr-2 ${condition ? colorClass : 'tw-bg-gray-500'}`} />
    );

    // Lấy thông tin trạng thái để hiển thị trên SCADA
    const { color, text: statusText, icon: statusIcon } = {
        'RUN': { color: 'green', text: 'ĐANG GIA CÔNG', icon: <CheckCircleOutlined /> },
        'IDLE': { color: 'blue', text: 'DỪNG CHỜ', icon: <ClockCircleOutlined /> },
        'ERROR': { color: 'red', text: 'LỖI CRITICAL', icon: <AlertOutlined /> },
    }[machineDetails.status] || { color: 'default', text: 'UNKNOWN', icon: <WarningOutlined /> };


    return (
        <Row gutter={24} style={{ minHeight: '72vh' }}>
            
            {/* CỘT 1: SCADA VISUALIZATION (Main Process Flow) - TÁI CẤU TRÚC 3 CỘT (4 | 16 | 4) */}
            <Col span={18}>
                <Card 
                    title={<Title level={4} style={{ margin: 0 }}><ToolOutlined /> Màn hình Giám sát Chi tiết (M-CNC-101)</Title>}
                    className="tw-shadow-xl tw-h-full"
                    extra={
                        <Tag color={color} className={`tw-text-base tw-px-3 tw-py-1 tw-font-bold ${isError ? 'tw-animate-pulse' : ''}`}>
                            {isError ? <AlertOutlined className='tw-mr-2' /> : (machineDetails.status === 'RUN' ? <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} className='tw-mr-2' /> : statusIcon)}
                            {statusText.toUpperCase()}
                        </Tag>
                    }
                >
                    <Row gutter={16} className="tw-h-full">
                        {/* CỘT TRÁI: Dữ liệu Vận hành/Sản xuất (span 4) */}
                        <Col span={4} className="tw-h-full">
                            <Title level={5} className="tw-mt-0 tw-mb-2">Thông số Trục chính</Title>
                            <Divider style={{ margin: '8px 0' }} />
                            
                            <MiniKpiCard 
                                title="Tải Trục chính"
                                value={spindleLoad}
                                unit="%"
                                color={loadColor}
                                icon={ArrowUpOutlined}
                                isPulse={spindleLoad > 85}
                                subTitle={`Tốc độ: ${spindleSpeed} RPM`}
                            />
                            
                            <MiniKpiCard 
                                title="Tuổi thọ Dụng cụ"
                                value={toolLifePercent}
                                unit="%"
                                color={toolLifeColor}
                                icon={ToolOutlined}
                                isPulse={toolLifePercent < 30}
                                subTitle={<Progress 
                                            percent={toolLifePercent} 
                                            showInfo={false} 
                                            size="small"
                                            strokeColor={toolLifeColor}
                                        />}
                            />

                            <MiniKpiCard 
                                title="Tốc độ Feed"
                                value={feedRate}
                                unit="mm/phút"
                                color="#1677ff"
                                icon={RiseOutlined}
                                subTitle={`Thời gian còn lại: ${Math.max(0, 15 - (liveData.RunningCount % 15)).toFixed(1)} phút`}
                                precision={0}
                            />
                        </Col>

                        {/* CỘT GIỮA: Hình ảnh SCADA (span 16) */}
                        <Col span={16} className="tw-flex tw-flex-col tw-h-full">
                            <div className="tw-flex-1 tw-w-full tw-rounded-lg tw-overflow-hidden tw-shadow-inner tw-border tw-border-gray-200">
                                <img
                                src={cncScadaImage /* hoặc laserScadaImage / pressScadaImage */}
                                alt="SCADA layout"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                />
                            </div>
                        </Col>

                        {/* CỘT PHẢI: Dữ liệu Nền tảng/Bảo trì (span 4) */}
                        <Col span={4} className="tw-h-full">
                            <Title level={5} className="tw-mt-0 tw-mb-2">Trạng thái Phụ trợ</Title>
                            <Divider style={{ margin: '8px 0' }} />
                            
                            <MiniKpiCard 
                                title="Nhiệt độ Trục"
                                value={machineDetails.temp}
                                unit="°C"
                                color={tempColor}
                                icon={HeatMapOutlined}
                                isPulse={machineDetails.temp > 45}
                                subTitle="Ngưỡng Max: 50°C"
                            />

                            <MiniKpiCard 
                                title="Rung động"
                                value={machineDetails.vibration}
                                unit="mm/s"
                                color={vibrationColor}
                                icon={FallOutlined}
                                isPulse={machineDetails.vibration > 1.5}
                                subTitle="Ngưỡng Cảnh báo: 1.5 mm/s"
                                precision={2}
                            />

                            <MiniKpiCard 
                                title="Dòng điện Motor"
                                value={motorCurrent}
                                unit="A"
                                color="#1677ff"
                                icon={ThunderboltOutlined}
                                subTitle={`Coolant: ${coolantFlow > 0 ? 'ON' : 'OFF'}`}
                            />
                            
                            <Divider style={{ margin: '12px 0' }} />
                             <MiniKpiCard 
                                title="Health Score"
                                value={machineDetails.healthScore}
                                unit="/100"
                                color={healthProgressColor}
                                icon={HeartFilled}
                                subTitle={`RUL: ${machineDetails.RUL} giờ`}
                            />
                        </Col>
                    </Row>
                </Card>
            </Col>

            {/* CỘT 2: THÔNG TIN CHI TIẾT & HÀNH ĐỘNG (span 6) - GIỮ NGUYÊN */}
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
                        {isError ? (
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