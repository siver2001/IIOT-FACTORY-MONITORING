// FRONTEND/src/hooks/useOperationHistory.js

import { useState, useMemo } from 'react';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

const MACHINE_IDS = ['M-CNC-101', 'M-LASER-102', 'M-PRESS-103', 'M-ROBOT-104', 'M-WELD-105'];
const STATUS_TYPES = ['Running', 'Idle', 'Maintenance', 'Error'];

// Hàm tạo 100 bản ghi lịch sử mock (Giữ nguyên)
const generateMockHistory = (count = 100) => {
    const history = [];
    let currentTime = new Date();
    currentTime.setDate(currentTime.getDate() - 7); // Bắt đầu từ 7 ngày trước

    for (let i = 0; i < count; i++) {
        currentTime.setMinutes(currentTime.getMinutes() + faker.number.int({ min: 10, max: 60 }));
        
        const machineId = faker.helpers.arrayElement(MACHINE_IDS);
        const status = faker.helpers.arrayElement(STATUS_TYPES);
        
        let detail = 'Hoạt động bình thường.';
        let color = 'blue';

        if (status === 'Error') {
            detail = faker.helpers.arrayElement(['Lỗi cảm biến nhiệt', 'Mất kết nối PLC', 'Quá tải động cơ']) + ` (Sự kiện lúc: ${new Date(currentTime).toLocaleTimeString()})`;
            color = 'red';
        } else if (status === 'Maintenance') {
            detail = 'Bảo trì định kỳ/Sửa chữa';
            color = 'gold';
        } else if (status === 'Running') {
            detail = `Tốc độ: ${faker.number.int({ min: 100, max: 500 })} RPM, Nhiệt: ${faker.number.float({ min: 30, max: 45, multipleOf: 0.1 })}°C`;
            color = 'green';
        }

        history.push({
            key: faker.string.uuid(),
            timestamp: new Date(currentTime).toISOString(),
            machineId: machineId,
            status: status,
            detail: detail,
            color: color
        });
    }

    return history.reverse();
};

export const useOperationHistory = () => {
    const [historyData] = useState(generateMockHistory());

    const fetchHistory = (filters) => {
        console.log("Fetching history with filters (Mock):", filters);
        return historyData;
    }
    
    // NEW: Tính toán Downtime Breakdown dựa trên sự chênh lệch thời gian giữa các sự kiện
    const downtimeBreakdown = useMemo(() => {
        if (!historyData || historyData.length < 2) {
            return { totalDowntimeHours: 0, breakdown: [] };
        }

        const breakdownMap = {
            'Error': 0, 
            'Maintenance': 0, 
            'Idle': 0,
        };
        
        // Sắp xếp lại theo thời gian (cũ nhất đến mới nhất)
        const sortedHistory = [...historyData].sort((a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix());
        
        // Tính toán chênh lệch thời gian giữa sự kiện i và i+1
        for (let i = 0; i < sortedHistory.length - 1; i++) {
            const current = sortedHistory[i];
            const next = sortedHistory[i + 1];
            
            const durationMinutes = dayjs(next.timestamp).diff(dayjs(current.timestamp), 'minute');
            
            // Nếu trạng thái hiện tại KHÔNG phải là 'Running'
            if (current.status !== 'Running') {
                if (current.status === 'Error') {
                    breakdownMap['Error'] += durationMinutes;
                } else if (current.status === 'Maintenance') {
                    breakdownMap['Maintenance'] += durationMinutes;
                } else if (current.status === 'Idle') {
                    breakdownMap['Idle'] += durationMinutes;
                }
            }
        }
        
        // --- Mapping sang Category Downtime (Mocked for Chart) ---
        
        const breakdown = [];
        const errorMaintenanceMinutes = breakdownMap['Error'] + breakdownMap['Maintenance'];
        
        // 1. Lỗi Thiết bị & Bảo trì (Chủ yếu từ Error & Maintenance)
        const equipmentMaintenanceHours = parseFloat((errorMaintenanceMinutes / 60).toFixed(1));
        
        if (equipmentMaintenanceHours > 0) {
            breakdown.push({ 
                cause: 'Lỗi Thiết bị/Bảo trì', 
                hours: equipmentMaintenanceHours, 
                color: '#ff4d4f' 
            });
        }
        
        // 2. Chia nhỏ thời gian IDLE (dừng chờ) sang các nguyên nhân phi kỹ thuật
        const idleHours = parseFloat((breakdownMap['Idle'] / 60).toFixed(1));
        
        if (idleHours > 0) {
            // Giả lập chia 3 phần: Thiếu Nguyên liệu (45%), Thay đổi Lô (35%), Lỗi Vận hành (20%)
            const cause1 = parseFloat((idleHours * 0.45).toFixed(1)); 
            const cause2 = parseFloat((idleHours * 0.35).toFixed(1)); 
            const cause3 = parseFloat((idleHours * 0.20).toFixed(1)); 
            
            if (cause1 > 0) breakdown.push({ cause: 'Thiếu Nguyên liệu', hours: cause1, color: '#faad14' });
            if (cause2 > 0) breakdown.push({ cause: 'Thay đổi Lô/Cấu hình', hours: cause2, color: '#1677ff' });
            if (cause3 > 0) breakdown.push({ cause: 'Lỗi Vận hành', hours: cause3, color: '#52c41a' });
        }
        
        const finalTotalHours = breakdown.reduce((sum, item) => sum + item.hours, 0);

        return {
            totalDowntimeHours: parseFloat(finalTotalHours.toFixed(1)),
            breakdown: breakdown,
        };
        
    }, [historyData]);


    return {
        historyData,
        fetchHistory,
        MACHINE_IDS,
        STATUS_TYPES,
        downtimeBreakdown, // EXPORT DỮ LIỆU DOWNTIME
    };
};