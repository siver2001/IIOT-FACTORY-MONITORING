// FRONTEND/src/features/Dashboard/ScadaViewLaser.jsx

import React from 'react';
// ĐÃ SỬA: Import tất cả các components cần thiết
import { Card, Typography, Space, Row, Col, Statistic, Tag, Progress, Button, Spin, Divider } from 'antd'; 
import { 
    FireOutlined, BulbOutlined, StockOutlined, SettingOutlined, 
    ClockCircleOutlined, ThunderboltOutlined, CheckCircleOutlined,
    WarningOutlined, SyncOutlined, LoadingOutlined, ProfileOutlined, 
    PoweroffOutlined, BarChartOutlined, AlertOutlined, HeartFilled,
    HeatMapOutlined, FallOutlined, RiseOutlined 
} from '@ant-design/icons';
import laserScadaImage from '../../assets/scada/laser_scada_layout.png'; 

const { Title, Text } = Typography;

// Component Mini KPI Card
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

const ScadaViewLaser = ({ machineDetails, liveData }) => {
    // Dữ liệu mock riêng cho Laser
    const laserPower = machineDetails.healthScore * 0.8; 
    const gasPressure = parseFloat((15 + Math.random() * 2).toFixed(1));
    const chillerTemp = parseFloat((20 + Math.random() * 5).toFixed(1));
    const cuttingSpeed = machineDetails.OEE * 10;
    const waterFlow = parseFloat((10 + Math.random() * 2).toFixed(1)); // L/min

    const powerColor = laserPower < 60 ? '#ff4d4f' : (laserPower < 80 ? '#faad14' : '#52c41a');
    const gasColor = gasPressure < 16 ? '#ff4d4f' : '#52c41a';
    const chillerTempColor = chillerTemp > 25 ? '#ff4d4f' : (chillerTemp > 22 ? '#faad14' : '#52c41a');

    // FIX LỖI: Định nghĩa isRULCritical và healthProgressColor
    const isRULCritical = machineDetails.RUL < 1000;
    const healthProgressColor = machineDetails.healthScore > 80 ? '#52c41a' : (machineDetails.healthScore > 60 ? '#faad14' : '#ff4d4f');
    const isError = machineDetails.status === 'ERROR';

    // Lấy thông tin trạng thái để hiển thị trên SCADA
    const { color, text: statusText, icon: statusIcon } = {
        'RUN': { color: 'green', text: 'ĐANG CẮT', icon: <CheckCircleOutlined /> },
        'IDLE': { color: 'blue', text: 'DỪNG CHỜ', icon: <ClockCircleOutlined /> },
        'ERROR': { color: 'red', text: 'LỖI CRITICAL', icon: <AlertOutlined /> },
    }[machineDetails.status] || { color: 'default', text: 'UNKNOWN', icon: <WarningOutlined /> };


    return (
        <Row gutter={24} style={{ minHeight: '72vh' }}>
            
            {/* CỘT 1: SCADA VISUALIZATION - TÁI CẤU TRÚC 3 CỘT (4 | 16 | 4) */}
            <Col span={18}>
                <Card 
                    title={<Title level={4} style={{ margin: 0 }}><FireOutlined /> Màn hình Giám sát Chi tiết (M-LASER-102)</Title>}
                    className="tw-shadow-xl tw-h-full"
                    extra={
                        <Tag color={color} className={`tw-text-base tw-px-3 tw-py-1 tw-font-bold ${isError ? 'tw-animate-pulse' : ''}`}>
                            {isError ? <AlertOutlined className='tw-mr-2' /> : (machineDetails.status === 'RUN' ? <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} className='tw-mr-2' /> : statusIcon)}
                            {statusText.toUpperCase()}
                        </Tag>
                    }
                >
                    <Row gutter={16} className="tw-h-full">
                        {/* CỘT TRÁI: Dữ liệu Vận hành Laser (span 4) */}
                        <Col span={4} className="tw-h-full">
                            <Title level={5} className="tw-mt-0 tw-mb-2">Thông số Cắt & Nguồn</Title>
                            <Divider style={{ margin: '8px 0' }} />
                            
                            <MiniKpiCard 
                                title="Công suất Laser"
                                value={laserPower}
                                unit="%"
                                color={powerColor}
                                icon={FireOutlined}
                                isPulse={laserPower < 60}
                                subTitle="Đang cắt thép không gỉ"
                            />
                            
                            <MiniKpiCard 
                                title="Tốc độ Cắt"
                                value={cuttingSpeed}
                                unit="mm/s"
                                color="#1677ff"
                                icon={RiseOutlined}
                                subTitle="Vị trí X: 1200mm, Y: 800mm"
                            />

                            <MiniKpiCard 
                                title="Áp suất Khí trợ"
                                value={gasPressure}
                                unit="bar"
                                color={gasColor}
                                icon={BulbOutlined}
                                isPulse={gasPressure < 16}
                                subTitle="Loại khí: N2"
                                precision={1}
                            />
                        </Col>

                        {/* CỘT GIỮA: Hình ảnh SCADA (span 16) */}
                        <Col span={16} className="tw-flex tw-flex-col tw-h-full">
                            <div className="tw-flex-1 tw-w-full tw-rounded-lg tw-overflow-hidden tw-shadow-inner tw-border tw-border-gray-200">
                                <img
                                src={laserScadaImage}
                                alt="SCADA layout"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                />
                            </div>
                        </Col>

                        {/* CỘT PHẢI: Dữ liệu Chiller/Sức khỏe (span 4) */}
                        <Col span={4} className="tw-h-full">
                            <Title level={5} className="tw-mt-0 tw-mb-2">Trạng thái Chiller & PdM</Title>
                            <Divider style={{ margin: '8px 0' }} />
                            
                            <MiniKpiCard 
                                title="Nhiệt độ Chiller"
                                value={chillerTemp}
                                unit="°C"
                                color={chillerTempColor}
                                icon={HeatMapOutlined}
                                isPulse={chillerTemp > 25}
                                subTitle="Ngưỡng Max: 28°C"
                            />

                            <MiniKpiCard 
                                title="Lưu lượng Nước"
                                value={waterFlow}
                                unit="L/phút"
                                color="#1677ff"
                                icon={FallOutlined}
                                subTitle="Đảm bảo làm mát nguồn laser"
                            />

                            <Divider style={{ margin: '12px 0' }} />
                             <MiniKpiCard 
                                title="Health Score (Nguồn)"
                                value={machineDetails.healthScore}
                                unit="/100"
                                color={healthProgressColor}
                                icon={HeartFilled}
                                subTitle={`RUL Ước tính: ${machineDetails.RUL} giờ`}
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