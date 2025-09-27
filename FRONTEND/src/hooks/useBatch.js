import { useState, useCallback, useEffect, useMemo } from 'react'; 
import { message } from 'antd';
import { faker } from '@faker-js/faker';

// Mock dữ liệu lô sản phẩm
const initialBatches = [
    { 
        id: 'BATCH-001', 
        name: 'Lô A-900', 
        targetQty: 1500, 
        currentQty: 1500, 
        status: 'Completed', 
        startTime: '2025-09-01',
        report: { // Dữ liệu báo cáo sẵn có
            oee: 88.5,
            yieldRate: 98.2,
            defectCount: 27,
            durationHours: 48.5,
            defectDistribution: [
                { type: 'Kích thước sai', count: 15 },
                { type: 'Trầy xước', count: 10 },
                { type: 'Lỗi sơn', count: 2 },
            ],
            commonCause: 'Lỗi do hiệu chuẩn máy',
        }
    },
    { id: 'BATCH-002', name: 'Lô B-120', targetQty: 2000, currentQty: 180, status: 'Running', startTime: '2025-09-27' },
];

const DEFECT_TYPES = ['Kích thước sai', 'Bề mặt trầy xước', 'Lỗi màu/sơn', 'Lỗi lắp ráp'];

// Hàm mock tạo báo cáo khi hoàn thành lô
const generateMockReport = (targetQty, currentQty) => {
    // Giả định số lượng lỗi dựa trên chênh lệch
    const rawDefect = targetQty - currentQty;
    const defectCount = rawDefect < 0 ? faker.number.int({ min: 10, max: 100 }) : rawDefect + faker.number.int({ min: 0, max: 50 });
    const actualQty = targetQty - defectCount;
    const yieldRate = parseFloat(((actualQty / targetQty) * 100).toFixed(2));
    
    // Giả lập OEE, thời gian và phân bổ lỗi
    const oee = parseFloat((faker.number.float({ min: 75, max: 95, multipleOf: 0.1 })).toFixed(1));
    const durationHours = parseFloat((faker.number.float({ min: 10, max: 100, multipleOf: 0.1 })).toFixed(1));

    const distribution = DEFECT_TYPES.map(type => ({
        type: type,
        count: faker.number.int({ min: 0, max: defectCount / 4 + 1 }),
    })).filter(d => d.count > 0);

    return {
        oee,
        yieldRate,
        defectCount,
        durationHours,
        defectDistribution: distribution.length > 0 ? distribution : [{type: 'Không xác định', count: 1}], // Đảm bảo có data cho chart
        commonCause: faker.helpers.arrayElement(['Lỗi vật liệu đầu vào', 'Sai thông số vận hành', 'Hỏng dụng cụ đột ngột', 'Không có lỗi đáng kể']),
    };
};


export const useBatch = () => {
    const [batches, setBatches] = useState(initialBatches);
    const [runningBatch, setRunningBatch] = useState(initialBatches.find(b => b.status === 'Running'));
    const [isSimulating, setIsSimulating] = useState(false);

    // Mô phỏng tiến độ
    useEffect(() => {
        if (!isSimulating || !runningBatch) return;

        const interval = setInterval(() => {
            setBatches(prev => prev.map(batch => {
                if (batch.id === runningBatch.id) {
                    const progress = faker.number.int({ min: 100, max: 300 });
                    const newQty = batch.currentQty + progress;
                    
                    if (newQty >= batch.targetQty) {
                        const finalReport = generateMockReport(batch.targetQty, newQty); // Tạo báo cáo khi hoàn thành
                        
                        // Cập nhật trạng thái và báo cáo
                        const completedBatch = { 
                            ...batch, 
                            currentQty: batch.targetQty, 
                            status: 'Completed',
                            endTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                            report: finalReport
                        };
                        
                        message.success(`Lô ${batch.name} ĐÃ HOÀN THÀNH! Tỷ lệ đạt: ${finalReport.yieldRate}%`);
                        setRunningBatch(null);
                        setIsSimulating(false);
                        return completedBatch;
                    }
                    return { ...batch, currentQty: newQty };
                }
                return batch;
            }));
        }, 1500);

        return () => clearInterval(interval);
    }, [isSimulating, runningBatch]);


    const createBatch = useCallback((data) => {
        if (batches.find(b => b.name === data.name)) {
            message.error('Tên lô đã tồn tại.');
            return false;
        }

        const newBatch = {
            id: `BATCH-${faker.number.int({ min: 100, max: 999 })}`,
            currentQty: 0,
            status: 'New',
            startTime: new Date().toISOString().slice(0, 10),
            report: null, // Khởi tạo báo cáo là null
            ...data,
        };
        setBatches(prev => [newBatch, ...prev]);
        message.success(`Đã tạo lô sản phẩm: ${newBatch.name}`);
        return true;
    }, [batches]);

    const startBatch = useCallback((id) => {
        if (runningBatch) {
            message.warning(`Vui lòng kết thúc lô ${runningBatch.name} trước.`);
            return;
        }
        setBatches(prev => prev.map(batch => {
            if (batch.id === id) {
                const updatedBatch = { ...batch, status: 'Running', currentQty: 0, report: null };
                setRunningBatch(updatedBatch);
                setIsSimulating(true);
                message.info(`Đã bắt đầu lô ${batch.name}. Bắt đầu mô phỏng sản xuất...`);
                return updatedBatch;
            }
            return batch;
        }));
    }, [runningBatch]);

    const stopBatch = useCallback(() => {
        if (runningBatch) {
            setIsSimulating(false);
            setRunningBatch(null);
            setBatches(prev => prev.map(batch => {
                if (batch.id === runningBatch.id) {
                    const finalReport = generateMockReport(batch.targetQty, batch.currentQty);
                    
                    message.warning(`Đã dừng mô phỏng lô ${batch.name}. Báo cáo sơ bộ đã được tạo.`);
                    // Tạo báo cáo sơ bộ khi dừng
                    return { 
                        ...batch, 
                        status: 'Stopped',
                        endTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        report: finalReport
                    }; 
                }
                return batch;
            }));
        }
    }, [runningBatch]);


    return {
        batches,
        runningBatch,
        isSimulating,
        createBatch,
        startBatch,
        stopBatch,
    };
};