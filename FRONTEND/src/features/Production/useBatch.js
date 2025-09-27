import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { faker } from '@faker-js/faker';

// Mock dữ liệu lô sản phẩm
const initialBatches = [
    { id: 'BATCH-001', name: 'Lô A-900', targetQty: 1500, currentQty: 1450, status: 'Completed', startTime: '2025-09-01' },
    { id: 'BATCH-002', name: 'Lô B-120', targetQty: 2000, currentQty: 180, status: 'Running', startTime: '2025-09-27' },
];

export const useBatch = () => {
    const [batches, setBatches] = useState(initialBatches);
    const [runningBatch, setRunningBatch] = useState(initialBatches.find(b => b.status === 'Running'));
    const [isSimulating, setIsSimulating] = useState(false);
    const [messageQueue, setMessageQueue] = useState(null); 
    // Mô phỏng tiến độ
    useEffect(() => {
        if (!isSimulating || !runningBatch) return;

        const interval = setInterval(() => {
            setBatches(prev => prev.map(batch => {
                if (batch.id === runningBatch.id) {
                    const progress = faker.number.int({ min: 10, max: 50 });
                    const newQty = batch.currentQty + progress;
                    
                    if (newQty >= batch.targetQty) {
                        message.success(`Lô ${batch.name} ĐÃ HOÀN THÀNH!`);
                        setRunningBatch(null);
                        setIsSimulating(false);
                        return { ...batch, currentQty: batch.targetQty, status: 'Completed' };
                    }
                    return { ...batch, currentQty: newQty };
                }
                return batch;
            }));
        }, 1500);

        return () => clearInterval(interval);
    }, [isSimulating, runningBatch]);

    useEffect(() => {
            if (messageQueue) {
                if (messageQueue.type === 'success') {
                    message.success(messageQueue.content);
                }
                // Mở rộng thêm các loại message khác nếu cần, ví dụ:
                if (messageQueue.type === 'warning') {
                    message.warning(messageQueue.content);
                }
                setMessageQueue(null); // Xóa message đã xử lý
            }
        }, [messageQueue]); // Chạy mỗi khi messageQueue thay đổi
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
                const updatedBatch = { ...batch, status: 'Running', currentQty: 0 };
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
                    setMessageQueue({ type: 'warning', content: `Đã dừng mô phỏng lô ${batch.name}.` }); 
                    return { ...batch, status: 'Stopped' };
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