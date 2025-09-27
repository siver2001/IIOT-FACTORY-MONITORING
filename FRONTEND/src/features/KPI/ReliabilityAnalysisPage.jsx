import React, { useMemo, useState } from 'react';
import { Typography, Space, Card, Row, Col, Statistic, Table, Tag, Select, Divider } from 'antd';
import { BarChartOutlined, ClockCircleOutlined, ToolOutlined, RiseOutlined, AlertOutlined  } from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
} from 'chart.js';

import { useReliabilityAnalysis } from '../../hooks/useReliabilityAnalysis';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { Title: AntdTitle } = Typography;
const { Option } = Select;

const ReliabilityAnalysisPage = () => {
    const { data } = useReliabilityAnalysis();
    const [selectedMachine, setSelectedMachine] = useState(data.machines[0].machineId);

    // Dữ liệu máy được chọn
    const machineData = useMemo(() => {
        return data.machines.find(m => m.machineId === selectedMachine) || data.machines[0];
    }, [selectedMachine, data.machines]);


    // Dữ liệu biểu đồ MTBF vs MTTR
    const barChartData = {
        labels: machineData.history.map(h => h.month),
        datasets: [
            {
                label: 'MTBF (giờ)',
                data: machineData.history.map(h => h.mtbf),
                backgroundColor: '#1677ff',
                yAxisID: 'y1',
            },
            {
                label: 'MTTR (giờ)',
                data: machineData.history.map(h => h.mttr),
                backgroundColor: '#ff4d4f',
                yAxisID: 'y2',
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
            y1: { 
                type: 'linear', 
                position: 'left', 
                title: { display: true, text: 'MTBF (giờ)' },
                beginAtZero: false,
                grid: { drawOnChartArea: false } 
            },
            y2: { 
                type: 'linear', 
                position: 'right', 
                title: { display: true, text: 'MTTR (giờ)' },
                grid: { drawOnChartArea: false }
            },
        },
    };

    // Định nghĩa cột cho bảng chi tiết
    const columns = useMemo(() => ([
        { title: 'ID Máy', dataIndex: 'machineId', key: 'machineId', width: 120 },
        { title: 'Model', dataIndex: 'model', key: 'model', width: 200 },
        { title: 'Khu vực', dataIndex: 'area', key: 'area', width: 150 },
        { 
            title: 'MTBF (giờ)', 
            dataIndex: 'mtbf', 
            key: 'mtbf',
            render: (text) => <Tag color={text > 500 ? 'green' : 'red'} style={{ fontSize: 13, padding: '5px 10px' }}>{text}</Tag>,
            sorter: (a, b) => a.mtbf - b.mtbf,
            width: 150,
        },
        { 
            title: 'MTTR (giờ)', 
            dataIndex: 'mttr', 
            key: 'mttr', 
            render: (text) => <Tag color={text < 3 ? 'green' : 'red'} style={{ fontSize: 13, padding: '5px 10px' }}>{text}</Tag>,
            sorter: (a, b) => a.mttr - b.mttr,
            width: 150,
        },
        { title: 'Số lần Hỏng', dataIndex: 'failureCount', key: 'failureCount', width: 150 },
        { title: 'Tổng giờ chạy', dataIndex: 'totalRunningHours', key: 'totalRunningHours' },
    ]), []);

    // Hàm tùy chỉnh style cho thống kê
    const getMTTRColor = (value) => value < 3 ? '#3f8600' : '#cf1322';


    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <AntdTitle level={3}><BarChartOutlined /> Phân tích Độ tin cậy (MTBF/MTTR)</AntdTitle>

            <Divider orientation="left">Tóm tắt Tổng hợp</Divider>
            
            {/* KPI Summary Cards */}
            <Row gutter={24}>
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-lg" style={{ borderLeft: '4px solid #1677ff' }}>
                        <Statistic
                            title="MTBF Trung bình"
                            value={data.summary.totalMTBF}
                            precision={1}
                            suffix=" giờ"
                            valueStyle={{ color: '#1677ff' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-lg" style={{ borderLeft: '4px solid #ff4d4f' }}>
                        <Statistic
                            title="MTTR Trung bình"
                            value={data.summary.totalMTTR}
                            precision={1}
                            suffix=" giờ"
                            valueStyle={{ color: getMTTRColor(data.summary.totalMTTR) }}
                            prefix={<ToolOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-lg" style={{ borderLeft: '4px solid #faad14' }}>
                        <Statistic
                            title="Tổng số lần Hỏng"
                            value={data.summary.totalFailureCount}
                            suffix=" lần"
                            prefix={<AlertOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" className="tw-shadow-lg" style={{ borderLeft: '4px solid #52c41a' }}>
                        <Statistic
                            title="Tỷ lệ Vận hành (%)"
                            value={data.summary.availability}
                            precision={1}
                            suffix="%"
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<RiseOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Phân tích Xu hướng MTBF/MTTR</Divider>
            
            {/* Biểu đồ Xu hướng */}
            <Card 
                title={
                    <Space>
                        Biểu đồ So sánh MTBF/MTTR (6 tháng)
                        <Select 
                            defaultValue={selectedMachine} 
                            style={{ width: 200 }}
                            onChange={setSelectedMachine}
                        >
                            {data.machines.map(m => (
                                <Option 
                                    key={m.machineId} 
                                    value={m.machineId} 
                                    label={`${m.machineId} - ${m.model}`} 
                                >
                                    {m.machineId} - {m.model} {}
                                </Option>
                            ))}
                        </Select>
                    </Space>
                }
                className="tw-shadow-lg"
                style={{ borderRadius: 12 }}
                variant="default"
            >
                <div style={{ height: 400 }}>
                    <Bar data={barChartData} options={barChartOptions} />
                </div>
            </Card>

            <Divider orientation="left">Dữ liệu Độ tin cậy Chi tiết</Divider>
            
            {/* Bảng Chi tiết */}
            <Table
                columns={columns}
                dataSource={data.machines}
                rowKey="machineId"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
                bordered
            />
        </Space>
    );
};

export default ReliabilityAnalysisPage;