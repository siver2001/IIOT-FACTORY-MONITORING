// FRONTEND/src/features/Dashboard/ScadaViewPress.jsx

import React from 'react';
import { Card, Typography, Space, Row, Col, Statistic, Tag, Progress, Button, Spin, Divider } from 'antd';
import { 
    ToolOutlined, ClockCircleOutlined, SettingOutlined, AlertOutlined, 
    CheckCircleOutlined, ThunderboltOutlined, FallOutlined, RiseOutlined,
    SyncOutlined, LoadingOutlined, PoweroffOutlined, ProfileOutlined, 
    BarChartOutlined, WarningOutlined, HeartFilled, HeatMapOutlined
} from '@ant-design/icons';
// IMPORT MOCK IMAGE (Giả định tệp này tồn tại trong assets/scada/)
import pressScadaImage from '../../assets/scada/press_scada_layout.png'; 

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

const ScadaViewPress = ({ machineDetails, liveData }) => {
    // Dữ liệu mock riêng cho Press (Tái sử dụng một số logic từ liveData)
    // Dữ liệu sẽ thay đổi dựa trên logic real-time trong useRealTimeData
    const hydraulicPressure = parseFloat((250 + Math.random() * 50).toFixed(1));
    const ramSpeed = parseFloat((120 + Math.sin(liveData.healthScore / 100 * Math.PI) * 20).toFixed(1)); 
    const oilTemperature = machineDetails.temp; // Tái sử dụng nhiệt độ máy
    const productionCounter = liveData.MTBF; // Tái sử dụng MTBF cho mục đích counter
    const strokeDepth = parseFloat((300 + Math.random() * 5).toFixed(1)); // ĐÃ FIX ReferenceError
    
    // --- Logic Màu sắc và Ngưỡng ---
    const pressureColor = hydraulicPressure > 290 ? '#ff4d4f' : (hydraulicPressure < 255 ? '#faad14' : '#52c41a');
    const tempColor = oilTemperature > 50 ? '#ff4d4f' : (oilTemperature > 45 ? '#faad14' : '#52c41a');
    const ramSpeedColor = ramSpeed < 100 ? '#ff4d4f' : '#52c41a';
    const isRULCritical = machineDetails.RUL < 1000;
    const isError = machineDetails.status === 'ERROR';
    
    const healthProgressColor = machineDetails.healthScore > 80 ? '#52c41a' : (machineDetails.healthScore > 60 ? '#faad14' : '#ff4d4f');

    // Lấy thông tin trạng thái để hiển thị trên SCADA
    const { color, text: statusText, icon: statusIcon } = {
        'RUN': { color: 'green', text: 'ĐANG ÉP', icon: <CheckCircleOutlined /> },
        'IDLE': { color: 'blue', text: 'DỪNG CHỜ', icon: <ClockCircleOutlined /> },
        'ERROR': { color: 'red', text: 'LỖI CRITICAL', icon: <AlertOutlined /> },
    }[machineDetails.status] || { color: 'default', text: 'UNKNOWN', icon: <WarningOutlined /> };


    return (
        <Row gutter={24} style={{ minHeight: 600 }}>
            
            {/* CỘT 1: SCADA VISUALIZATION - TÁI CẤU TRÚC 3 CỘT (4 | 16 | 4) */}
            <Col span={18}>
                <Card 
                    title={<Title level={4} style={{ margin: 0 }}><ToolOutlined /> Màn hình Giám sát Chi tiết (M-PRESS-103)</Title>}
                    className="tw-shadow-xl tw-h-full"
                    extra={
                        <Tag color={color} className={`tw-text-base tw-px-3 tw-py-1 tw-font-bold ${isError ? 'tw-animate-pulse' : ''}`}>
                            {isError ? <AlertOutlined className='tw-mr-2' /> : (machineDetails.status === 'RUN' ? <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} className='tw-mr-2' /> : statusIcon)}
                            {statusText.toUpperCase()}
                        </Tag>
                    }
                >
                    <Row gutter={16} className="tw-h-full">
                        {/* CỘT TRÁI: Dữ liệu Vận hành Thủy lực (span 4) */}
                        <Col span={4} className="tw-h-full">
                            <Title level={5} className="tw-mt-0 tw-mb-2">Thông số Thủy lực</Title>
                            <Divider style={{ margin: '8px 0' }} />
                            
                            <MiniKpiCard 
                                title="Áp suất Dầu"
                                value={hydraulicPressure}
                                unit="bar"
                                color={pressureColor}
                                icon={ThunderboltOutlined}
                                isPulse={hydraulicPressure > 290}
                                subTitle="Ngưỡng Max: 300 bar"
                            />
                            
                            <MiniKpiCard 
                                title="Tốc độ Ram"
                                value={ramSpeed}
                                unit="mm/s"
                                color={ramSpeedColor}
                                icon={RiseOutlined}
                                isPulse={ramSpeed < 100}
                                subTitle={`Chiều sâu: ${strokeDepth} mm`}
                            />

                            <MiniKpiCard 
                                title="Sản lượng Lô"
                                value={productionCounter}
                                unit="chu kỳ"
                                color="#1677ff"
                                icon={CheckCircleOutlined}
                                subTitle="Thời gian chạy liên tục: 15 giờ"
                                precision={0}
                            />
                        </Col>

                        {/* CỘT GIỮA: Hình ảnh SCADA (span 16) */}
                        <Col span={16} className="tw-flex tw-flex-col tw-h-full">
                            <div className="tw-flex-1 tw-w-full tw-rounded-lg tw-overflow-hidden tw-shadow-inner tw-border tw-border-gray-200">
                                <img
                                src={pressScadaImage}
                                alt="SCADA layout"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                />
                            </div>
                        </Col>

                        {/* CỘT PHẢI: Dữ liệu Nhiệt độ & PdM (span 4) */}
                        <Col span={4} className="tw-h-full">
                            <Title level={5} className="tw-mt-0 tw-mb-2">Trạng thái Dầu & PdM</Title>
                            <Divider style={{ margin: '8px 0' }} />
                            
                            <MiniKpiCard 
                                title="Nhiệt độ Dầu"
                                value={oilTemperature}
                                unit="°C"
                                color={tempColor}
                                icon={HeatMapOutlined}
                                isPulse={oilTemperature > 50}
                                subTitle="Ngưỡng Max: 55°C"
                            />

                            <MiniKpiCard 
                                title="Sức khỏe Thủy lực"
                                value={machineDetails.healthScore}
                                unit="/100"
                                color={healthProgressColor}
                                icon={HeartFilled}
                                subTitle={`RUL Ước tính: ${machineDetails.RUL} giờ`}
                            />

                            <Divider style={{ margin: '12px 0' }} />
                             <MiniKpiCard 
                                title="Bộ lọc (Mock)"
                                value="OK"
                                color="#52c41a"
                                icon={CheckCircleOutlined}
                                subTitle="Thời gian hoạt động còn lại: 1000 giờ"
                                precision={0}
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
                            <SyncOutlined /> Khởi động Chu kỳ Ép
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