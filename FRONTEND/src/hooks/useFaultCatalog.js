// FRONTEND/src/hooks/useFaultCatalog.js

import { useState, useMemo, useCallback } from 'react';
import { App } from 'antd';
import { faker } from '@faker-js/faker';

// Định nghĩa Danh mục Lỗi ban đầu (Initial Static Catalog)
const initialFaultCatalog = [
    { code: 'T-005', description: 'Quá nhiệt động cơ/Base', category: 'Temperature', priority: 'Critical', id: 'f-1' }, 
    { code: 'E-002', description: 'Rung động cao bất thường', category: 'Mechanical', priority: 'Critical', id: 'f-2' }, 
    { code: 'P-101', description: 'Áp suất thấp ngoài ngưỡng', category: 'Process', priority: 'Warning', id: 'f-3' },
    { code: 'C-001', description: 'Lỗi mất kết nối Modbus/MQTT', category: 'Communication', priority: 'Error', id: 'f-4' },
    { code: 'S-003', description: 'Lỗi Cảm biến đọc giá trị 0', category: 'Sensor', priority: 'Error', id: 'f-5' },
    { code: 'CM-001', description: 'Thiếu chất làm mát', category: 'Process', priority: 'Warning', id: 'f-6' },
    { code: 'ME-001', description: 'Hỏng vòng bi', category: 'Mechanical', priority: 'Critical', id: 'f-7' },
];

export const FAULT_CATEGORIES = ['Temperature', 'Mechanical', 'Process', 'Communication', 'Sensor', 'Electrical', 'Tùy chỉnh'];

export const useFaultCatalog = () => {
    const { message } = App.useApp();
    const [faults, setFaults] = useState(initialFaultCatalog);

    // HÀM: Thêm hoặc Cập nhật Mã lỗi
    const saveFaultCode = useCallback((faultData, isNew) => {
        const code = faultData.code.toUpperCase().trim();
        const existingFault = faults.find(f => f.code === code);
        
        if (isNew) {
            if (existingFault) {
                message.error(`Mã lỗi ${code} đã tồn tại!`);
                return false;
            }
            const newFault = { ...faultData, code, id: faker.string.uuid() };
            setFaults(prev => [...prev, newFault]);
            message.success(`Đã thêm mã lỗi mới: ${code}`);
            return newFault;
        } else {
            setFaults(prev => prev.map(f => f.code === code ? { ...f, ...faultData, code } : f));
            message.success(`Đã cập nhật mã lỗi ${code}`);
            return faults.find(f => f.code === code);
        }
    }, [faults, message]);

    // HÀM: Xóa Mã lỗi
    const deleteFaultCode = useCallback((code) => {
        setFaults(prev => prev.filter(f => f.code !== code));
        message.warning(`Đã xóa mã lỗi ${code}.`);
    }, [message]);

    // HÀM: Tự động thêm Mã lỗi nếu được nhập trong Modal Alert
    const addDynamicFaultCode = useCallback((newCode) => {
        const code = newCode.toUpperCase().trim();
        const existingFault = faults.find(f => f.code === code);
        
        if (existingFault) {
            return existingFault;
        }

        // Tạo entry mới và thêm vào catalog
        const newFault = {
            code: code,
            description: `Mã lỗi tùy chỉnh: ${code}`,
            category: 'Tùy chỉnh',
            priority: 'Warning',
            id: faker.string.uuid(),
        };
        
        setFaults(prev => [...prev, newFault]);
        message.success(`Đã thêm mã lỗi mới: ${code} vào danh mục.`);
        
        return newFault;

    }, [faults, message]);


    return {
        FAULT_CATALOG: faults,
        FAULT_CATEGORIES,
        saveFaultCode,
        deleteFaultCode,
        addDynamicFaultCode,
    };
};