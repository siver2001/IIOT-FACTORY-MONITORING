import { useState, useMemo } from 'react';
import { faker } from '@faker-js/faker';

const MACHINE_IDS = ['M-CNC-101', 'M-LASER-102', 'M-PRESS-103', 'M-ROBOT-104', 'M-WELD-105'];
// Đã loại bỏ SHIFT_TYPES
const STATUS_TYPES = ['Running', 'Idle', 'Maintenance', 'Error'];

// Hàm tạo 100 bản ghi lịch sử mock
const generateMockHistory = (count = 100) => {
    const history = [];
    let currentTime = new Date();
    currentTime.setDate(currentTime.getDate() - 7); // Bắt đầu từ 7 ngày trước

    for (let i = 0; i < count; i++) {
        // Tăng thời gian ngẫu nhiên
        currentTime.setMinutes(currentTime.getMinutes() + faker.number.int({ min: 10, max: 60 }));
        
        const machineId = faker.helpers.arrayElement(MACHINE_IDS);
        const status = faker.helpers.arrayElement(STATUS_TYPES);
        
        let detail = 'Hoạt động bình thường.';
        let color = 'blue';

        if (status === 'Error') {
            // Cập nhật chi tiết lỗi để bao gồm thời gian sự kiện
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
            // Lưu dưới dạng ISO string
            timestamp: new Date(currentTime).toISOString(),
            machineId: machineId,
            status: status,
            detail: detail,
            // Đã bỏ trường 'shift' theo yêu cầu
            color: color
        });
    }

    // Đảo ngược thứ tự để cái mới nhất ở trên cùng
    return history.reverse();
};

export const useOperationHistory = () => {
    // Dữ liệu mock được tạo một lần
    const [historyData] = useState(generateMockHistory());

    const fetchHistory = (filters) => {
        // Trong môi trường thật, đây là nơi gọi API với các tham số filters
        console.log("Fetching history with filters (Mock):", filters);
        return historyData;
    }

    return {
        historyData,
        fetchHistory,
        MACHINE_IDS,
        STATUS_TYPES
    };
};