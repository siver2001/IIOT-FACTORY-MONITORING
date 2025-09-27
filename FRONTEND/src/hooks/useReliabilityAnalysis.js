import { useState, useMemo } from 'react';
import { faker } from '@faker-js/faker';

const MACHINE_MODELS = ['CNC Lathe X10', 'Laser Cutter V2', 'Hydraulic Press HP5', 'Assembly Robot R1'];

// Hàm mô phỏng dữ liệu MTBF/MTTR chi tiết
const generateReliabilityData = () => {
    const data = MACHINE_MODELS.map((model, index) => {
        const baseMTBF = faker.number.int({ min: 300, max: 800 });
        const baseMTTR = faker.number.float({ min: 1.5, max: 8, multipleOf: 0.1 });
        const failureCount = faker.number.int({ min: 5, max: 20 });
        
        // Tạo dữ liệu lịch sử MTBF/MTTR trong 6 tháng
        const history = Array.from({ length: 6 }, (_, i) => ({
            month: `T${index + 1}/2025`,
            mtbf: parseFloat((baseMTBF + faker.number.int({ min: -50, max: 50 })).toFixed(1)),
            mttr: parseFloat((baseMTTR + faker.number.float({ min: -1, max: 1, multipleOf: 0.1 })).toFixed(1)),
        }));

        return {
            key: `M${101 + index}`,
            machineId: `M-${101 + index}`,
            model: model,
            area: index % 2 === 0 ? 'Dây chuyền A' : 'Dây chuyền B',
            mtbf: baseMTBF, // giờ
            mttr: baseMTTR, // giờ
            failureCount: failureCount,
            totalRunningHours: 5000 + baseMTBF * 2,
            history: history
        };
    });

    // Tính toán tổng hợp
    const totalMTBF = parseFloat((data.reduce((sum, item) => sum + item.mtbf, 0) / data.length).toFixed(1));
    const totalMTTR = parseFloat((data.reduce((sum, item) => sum + item.mttr, 0) / data.length).toFixed(1));

    return {
        machines: data,
        summary: {
            totalMTBF,
            totalMTTR,
            totalFailureCount: data.reduce((sum, item) => sum + item.failureCount, 0),
            availability: parseFloat(((totalMTBF / (totalMTBF + totalMTTR)) * 100).toFixed(1))
        }
    };
};

export const useReliabilityAnalysis = () => {
    const [data] = useState(generateReliabilityData());

    return {
        data,
        MACHINE_MODELS
    };
};