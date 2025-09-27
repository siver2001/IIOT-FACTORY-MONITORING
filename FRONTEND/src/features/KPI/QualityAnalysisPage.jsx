// File: FRONTEND/src/features/KPI/QualityAnalysisPage.jsx

import React, { useMemo } from 'react';
import { Typography, Space, Card, Row, Col, Statistic, Select, Divider, Tag } from 'antd';
import { 
    CheckCircleOutlined, 
    AlertOutlined, 
    StarOutlined, // <-- ĐÃ THAY THẾ BullseyeOutlined
    FallOutlined, 
    RiseOutlined 
} from '@ant-design/icons'; 
import { Line, Doughnut } from 'react-chartjs-2'; // <-- ĐÃ DỌN DẸP, LOẠI BỎ Scatter
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement,
    Filler // Cần cho Line Chart
} from 'chart.js';

import { useQualityAnalysis } from '../../hooks/useQualityAnalysis';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const { Title: AntdTitle } = Typography;
const { Option } = Select;

const QualityAnalysisPage = () => {
    const { qualityData, controlChartData, PRODUCT_TYPES } = useQualityAnalysis();
    
    // =================================================================
    // 1. Dữ liệu Xu hướng Tỷ lệ Lỗi (Defect Rate Trend)
    // =================================================================
    const defectTrendData = {
        labels: qualityData.monthlyHistory.map(h => h.month),
        datasets: [
            {
                label: 'Tỷ lệ Lỗi (%)',
                data: qualityData.monthlyHistory.map(h => h.defectRate),
                borderColor: '#ff4d4f', // Màu đỏ cho lỗi
                backgroundColor: 'rgba(255, 77, 79, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y'
            },
            {
                label: 'Mục tiêu (1.0%)',
                data: qualityData.monthlyHistory.map(() => qualityData.summary.targetDefect),
                borderColor: '#52c41a', // Màu xanh cho mục tiêu
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                yAxisID: 'y'
            },
        ],
    };

    const defectTrendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 0,
                max: 3.0,
                title: { display: true, text: 'Defect Rate (%)' }
            }
        },
        plugins: {
            tooltip: { mode: 'index', intersect: false }
        }
    };
    
    // =================================================================
    // 2. Dữ liệu Phân bổ Lỗi (Defect Distribution)
    // =================================================================
    const defectDistributionData = useMemo(() => ({
        labels: qualityData.defectDistribution.map(d => d.type),
        datasets: [
            {
                data: qualityData.defectDistribution.map(d => d.count),
                backgroundColor: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f'],
                hoverOffset: 4
            }
        ]
    }), [qualityData.defectDistribution]);
    
    // =================================================================
    // 3. Dữ liệu Biểu đồ Kiểm soát (I-Chart Mock)
    // =================================================================
    const controlChartLineData = {
        labels: controlChartData.data.map(d => d.sample),
        datasets: [
            {
                label: 'Giá trị Đo lường',
                data: controlChartData.data.map(d => d.value),
                borderColor: '#1677ff',
                backgroundColor: 'rgba(22, 119, 255, 0.5)',
                pointRadius: 5,
                fill: false,
                type: 'line',
            },
            {
                label: 'UCL (Giới hạn trên)',
                data: controlChartData.data.map(() => controlChartData.UCL),
                borderColor: 'red',
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                type: 'line',
            },
            {
                label: 'LCL (Giới hạn dưới)',
                data: controlChartData.data.map(() => controlChartData.LCL),
                borderColor: 'red',
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                type: 'line',
            },
            {
                label: 'AVG (Trung bình)',
                data: controlChartData.data.map(() => controlChartData.AVG),
                borderColor: '#52c41a',
                pointRadius: 0,
                fill: false,
                type: 'line',
            },
        ]
    };
    
    const controlChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 5,
                max: 15,
                title: { display: true, text: 'Đơn vị Đo lường (mm)' }
            }
        }
    };

    // Style cho Defect Rate
    const getDefectColor = (rate, target) => rate > target ? '#cf1322' : '#3f8600';


    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <AntdTitle level={3}><CheckCircleOutlined /> Phân tích Chất lượng Sản phẩm</AntdTitle>

            <Divider orientation="left">Bộ lọc & Tổng quan KPI</Divider>
            
            {/* Control Panel and KPI Summary */}
            <Row gutter={24}>
                {/* Control Panel */}
                <Col span={6}>
                    <Card title="Bộ lọc Sản phẩm" variant="default" className="tw-shadow-md">
                        <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Chọn Sản phẩm:</label>
                        <Select defaultValue={PRODUCT_TYPES[0]} style={{ width: '100%' }}>
                            {PRODUCT_TYPES.map(p => <Option key={p} value={p}>{p}</Option>)}
                        </Select>
                        <div className="tw-mt-4">
                            <label className="tw-block tw-mb-1 tw-text-sm tw-font-medium">Khoảng thời gian:</label>
                            <Select defaultValue="Last 6 Months" style={{ width: '100%' }}>
                                <Option value="Last 6 Months">6 Tháng gần nhất</Option>
                                <Option value="YTD">Từ đầu năm</Option>
                            </Select>
                        </div>
                    </Card>
                </Col>
                
                {/* KPI Cards */}
                <Col span={18}>
                    <Row gutter={24}>
                        <Col span={8}>
                            <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #52c41a' }}>
                                <Statistic
                                    title="Tỷ lệ Đạt (Yield)"
                                    value={qualityData.summary.yieldRate}
                                    precision={2}
                                    suffix="%"
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<RiseOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #ff4d4f' }}>
                                <Statistic
                                    title="Tỷ lệ Lỗi (Defect Rate)"
                                    value={qualityData.summary.defectRate}
                                    precision={2}
                                    suffix="%"
                                    valueStyle={{ color: getDefectColor(qualityData.summary.defectRate, qualityData.summary.targetDefect) }}
                                    prefix={<FallOutlined />}
                                />
                                <Tag 
                                    color={getDefectColor(qualityData.summary.defectRate, qualityData.summary.targetDefect)} 
                                    className="tw-mt-2"
                                >
                                    Mục tiêu: {qualityData.summary.targetDefect}%
                                </Tag>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card variant="borderless" className="tw-shadow-md" style={{ borderLeft: '4px solid #1677ff' }}>
                                <Statistic
                                    title="Tổng Sản lượng"
                                    value={qualityData.summary.totalProduced}
                                    prefix={<StarOutlined />}
                                />
                                <Statistic
                                    title="Tổng số Lỗi"
                                    value={qualityData.summary.totalDefects}
                                    valueStyle={{ color: '#ff4d4f', fontSize: 18 }}
                                    prefix={<AlertOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
            
            <Divider orientation="left">Phân tích Chuyên sâu</Divider>

            {/* Row 2: Trend Chart and Defect Distribution */}
            <Row gutter={24}>
                {/* Defect Rate Trend */}
                <Col span={14}>
                    <Card title="Xu hướng Tỷ lệ Lỗi so với Mục tiêu" className="tw-shadow-lg" variant="default" style={{ borderRadius: 12 }}>
                        <div style={{ height: 350 }}>
                            <Line data={defectTrendData} options={defectTrendOptions} />
                        </div>
                    </Card>
                </Col>
                
                {/* Defect Distribution Doughnut Chart */}
                <Col span={10}>
                    <Card title="Phân bổ Loại lỗi" className="tw-shadow-lg" variant="default" style={{ borderRadius: 12 }}>
                        <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Doughnut
                                data={defectDistributionData}
                                options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right' } } }}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Row 3: Control Chart */}
            <Row gutter={24}>
                <Col span={24}>
                    <Card title="Biểu đồ Kiểm soát Chất lượng (I-Chart Mock)" className="tw-shadow-lg" variant="default" style={{ borderRadius: 12 }}>
                        <div style={{ height: 400 }}>
                            <Line data={controlChartLineData} options={controlChartOptions} />
                        </div>
                        <div className="tw-mt-4">
                            <Tag color={controlChartData.data.some(d => d.value > controlChartData.UCL || d.value < controlChartData.LCL) ? 'red' : 'green'}>
                                Tình trạng: {controlChartData.data.some(d => d.value > controlChartData.UCL || d.value < controlChartData.LCL) ? 'NGOÀI TẦM KIỂM SOÁT' : 'ĐANG KIỂM SOÁT'}
                            </Tag>
                        </div>
                    </Card>
                </Col>
            </Row>

        </Space>
    );
};

export default QualityAnalysisPage;