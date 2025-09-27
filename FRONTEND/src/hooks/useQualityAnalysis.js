import { useState } from 'react';
import { faker } from '@faker-js/faker';

const PRODUCT_TYPES = ['Product A-S1', 'Product B-S2', 'Product C-S3'];
const DEFECT_TYPES = ['Kích thước sai', 'Bề mặt trầy xước', 'Lỗi màu/sơn', 'Lỗi lắp ráp'];

// Hàm mô phỏng dữ liệu chất lượng
const generateQualityData = () => {
    // 1. Dữ liệu tổng hợp KPI
    const totalProduced = faker.number.int({ min: 50000, max: 100000 });
    const totalDefects = faker.number.int({ min: 500, max: 2000 });
    const defectRate = parseFloat(((totalDefects / totalProduced) * 100).toFixed(2));
    const yieldRate = parseFloat((100 - defectRate).toFixed(2));

    // 2. Dữ liệu xu hướng theo tháng
    const monthlyHistory = Array.from({ length: 6 }, (_, i) => ({
        month: `Tháng ${6 - i}`,
        // Defect rate dao động từ 1.5% đến 2.5%
        defectRate: parseFloat((faker.number.float({ min: 1.5, max: 2.5, multipleOf: 0.01 })).toFixed(2)),
    }));
    
    // 3. Dữ liệu phân bổ lỗi (Defect Distribution)
    const defectDistribution = DEFECT_TYPES.map(type => ({
        type: type,
        count: faker.number.int({ min: 80, max: 300 }),
    }));

    return {
        summary: {
            totalProduced,
            totalDefects,
            defectRate,
            yieldRate,
            targetDefect: 1.0, // Mục tiêu 1.0%
        },
        monthlyHistory,
        defectDistribution
    };
};

// Hàm mô phỏng Control Chart Data (I-MR Chart mock)
const generateControlChartData = (samples = 20) => {
    const data = [];
    const avg = 10; // Giả sử giá trị trung bình mục tiêu
    const UCL = 12; // Giới hạn kiểm soát trên
    const LCL = 8;  // Giới hạn kiểm soát dưới

    for (let i = 1; i <= samples; i++) {
        // Giá trị đo lường, thêm nhiễu ngẫu nhiên
        let value = avg + faker.number.float({ min: -3, max: 3, multipleOf: 0.1 });
        
        // Mô phỏng một sự cố chất lượng (điểm nằm ngoài UCL/LCL)
        if (i === 15) { 
            value = 13.5; 
        }

        data.push({
            sample: `Lot ${i}`,
            value: parseFloat(value.toFixed(2))
        });
    }

    return {
        data,
        UCL,
        LCL,
        AVG: avg
    }
};

export const useQualityAnalysis = () => {
    const [qualityData] = useState(generateQualityData());
    const [controlChartData] = useState(generateControlChartData());

    return {
        qualityData,
        controlChartData,
        PRODUCT_TYPES
    };
};