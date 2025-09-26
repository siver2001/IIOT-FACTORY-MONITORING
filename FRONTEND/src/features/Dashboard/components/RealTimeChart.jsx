// src/features/Dashboard/components/RealTimeChart.jsx
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

const RealTimeChart = ({ data }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // Lấy tốc độ sản xuất của các máy và cập nhật biểu đồ
        // Logic: Giả sử chúng ta chỉ quan tâm đến tốc độ của 3 máy chính
        const latestSpeeds = Object.keys(data)
            .filter(id => ['M01', 'M02', 'M03'].includes(id))
            .map(id => ({
                name: id,
                value: data[id]?.speed || 0,
            }));
        
        // Cập nhật state (ví dụ: chỉ giữ 60 điểm dữ liệu cuối cùng)
        setChartData(prevData => {
            const newEntry = { time: new Date().toLocaleTimeString(), ...latestSpeeds.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {}) };
            return [...prevData, newEntry].slice(-60); 
        });

    }, [data]);

    const getOption = () => ({
        tooltip: { trigger: 'axis' },
        legend: { data: ['M01', 'M02', 'M03'] },
        xAxis: {
            type: 'category',
            data: chartData.map(item => item.time)
        },
        yAxis: { type: 'value', name: 'Tốc độ (Đơn vị/phút)' },
        series: [
            { name: 'M01', type: 'line', smooth: true, data: chartData.map(item => item.M01) },
            { name: 'M02', type: 'line', smooth: true, data: chartData.map(item => item.M02) },
            { name: 'M03', type: 'line', smooth: true, data: chartData.map(item => item.M03) },
        ]
    });

    return <ReactECharts option={getOption()} style={{ height: '100%' }} notMerge={true} lazyUpdate={true} />;
};

export default RealTimeChart;