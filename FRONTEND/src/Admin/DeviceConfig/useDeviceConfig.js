import { useState, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { faker } from '@faker-js/faker';

// Mock danh sách thiết bị ban đầu
const initialDevices = Array.from({ length: 5 }, (_, i) => ({
    key: `M-10${i + 1}`,
    name: `Máy CNC ${i + 1}`,
    location: i % 2 === 0 ? 'Line A' : 'Line B',
    tagCount: faker.number.int({ min: 10, max: 50 }),
}));

export const useDeviceConfig = () => {
    const [devices, setDevices] = useState(initialDevices);
    const [editingKey, setEditingKey] = useState('');

    const startEditing = useCallback((key) => {
        setEditingKey(key);
    }, []);

    const cancelEditing = useCallback(() => {
        setEditingKey('');
    }, []);

    const saveDevice = useCallback((key, updatedData) => {
        setDevices(prev => {
            const index = prev.findIndex(item => item.key === key);
            if (index > -1) {
                const newDevices = [...prev];
                newDevices[index] = { ...newDevices[index], ...updatedData };
                message.success(`Đã cập nhật cấu hình cho ${updatedData.name}`);
                return newDevices;
            }
            return prev;
        });
        setEditingKey('');
    }, []);
    
    // Giả định tổng số lượng tag của tất cả thiết bị
    const totalTags = useMemo(() => {
        return devices.reduce((sum, device) => sum + device.tagCount, 0);
    }, [devices]);

    return {
        devices,
        editingKey,
        totalTags,
        startEditing,
        cancelEditing,
        saveDevice,
        // Có thể thêm delete, add nếu cần
    };
};