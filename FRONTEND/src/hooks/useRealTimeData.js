// FRONTEND/src/hooks/useRealTimeData.js

import { useState, useCallback, useEffect } from 'react';
import { faker } from '@faker-js/faker';

// Hàm mô phỏng tính RUL (Remaining Useful Life) dựa trên Health Score
// Giả định: Health Score 100% -> RUL Max (5000 giờ), Health Score 40% -> RUL Min (500 giờ)
const getMockRUL = (healthScore) => {
    const maxRUL = 5000;
    const minRUL = 500;
    const decayRate = (maxRUL - minRUL) / 60; // Decay over 60 points (100 to 40)

    if (healthScore >= 100) return maxRUL;
    if (healthScore <= 40) return minRUL;
    
    // Tuyến tính hóa: 500 + (HealthScore - 40) * decayRate
    const rul = minRUL + (healthScore - 40) * decayRate;
    return parseFloat(rul.toFixed(0));
};

// Hàm mô phỏng việc fetch/nhận dữ liệu real-time
const generateMockData = () => {
    const healthScore = parseFloat((faker.number.float({ min: 45, max: 99, multipleOf: 0.1 })).toFixed(1));
    const rulHours = getMockRUL(healthScore);
    
    return ({
        // KPI Tổng quan
        OEE: parseFloat((faker.number.float({ min: 65, max: 95, multipleOf: 0.1 })).toFixed(1)),
        MTBF: faker.number.int({ min: 100, max: 500 }), // Giờ
        MachineCount: 150,
        RunningCount: faker.number.int({ min: 100, max: 130 }),
        ErrorCount: faker.number.int({ min: 2, max: 15 }),
        
        // Dữ liệu SỨC KHỎE THIẾT BỊ MỚI
        healthScore: healthScore,
        RUL: rulHours, // THÊM RUL
        healthHistory: Array.from({ length: 12 }, (_, i) => ({
            time: `${i * 2}:00`,
            // Sức khỏe giảm dần từ 90 về 70
            health: parseFloat((95 - i * 2 + faker.number.float({ min: -2, max: 2, multipleOf: 0.1 })).toFixed(1)),
        })),

        // Dữ liệu cho biểu đồ Line Chart
        performanceHistory: Array.from({ length: 12 }, (_, i) => ({
            time: `${i * 2}:00`,
            // FIX 3: Thay thế precision bằng multipleOf 
            value: parseFloat((faker.number.float({ min: 70, max: 100, multipleOf: 0.5 })).toFixed(1)),
        })),
        
        // Log Cảnh báo (Mock)
        liveAlerts: Array.from({ length: 5 }, () => ({
            id: faker.string.uuid(),
            time: new Date().toLocaleTimeString(),
            machineId: `M-${faker.number.int({ min: 101, max: 150 })}`,
            message: faker.helpers.arrayElement(['High Temperature', 'Motor Vibration Warning', 'Low Pressure Alert', 'Communication Loss']),
            severity: faker.helpers.arrayElement(['Error', 'Warning', 'Critical']),
        })).sort(() => Math.random() - 0.5), // Xáo trộn để có vẻ real-time
    });
};

export const useRealTimeData = (refreshRate = 2000) => {
    const [data, setData] = useState(generateMockData());

    useEffect(() => {
        // Mô phỏng kết nối WebSocket/Polling
        const interval = setInterval(() => {
            setData(generateMockData());
            console.log('Real-time data refreshed.');
        }, refreshRate);

        // Dọn dẹp khi component unmount
        return () => clearInterval(interval);
    }, [refreshRate]);

    return data;
};