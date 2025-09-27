import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card, Typography } from 'antd';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend, 
    Filler 
} from 'chart.js';

// Đảm bảo các thành phần đã được đăng ký (chỉ một lần)
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const { Title: AntdTitle } = Typography;

const HealthChart = ({ history }) => {
    const chartData = {
        labels: history.map(d => d.time),
        datasets: [
            {
                label: 'Sức khỏe Máy',
                data: history.map(d => d.health),
                borderColor: '#1890ff',
                backgroundColor: 'rgba(24, 144, 255, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 0,
                max: 100,
                title: { display: true, text: 'Health Score (Điểm)' }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: { mode: 'index', intersect: false }
        }
    };

    return (
        <Card title="Xu hướng Sức khỏe Thiết bị (24h)">
            <div style={{ height: 350 }}>
                <Line data={chartData} options={options} />
            </div>
        </Card>
    );
};

export default HealthChart;