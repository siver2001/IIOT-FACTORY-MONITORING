// FRONTEND/src/maintenance/useSpareParts.js

import { useState, useMemo, useCallback } from 'react';
import { App } from 'antd';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

const WARNING_THRESHOLD = 15;
const CRITICAL_THRESHOLD = 5;

// DANH MỤC CATEGORIES MỚI
const PART_CATEGORIES = ['Vòng bi/Bạc đạn', 'Vật tư tiêu hao', 'Bộ lọc', 'Cơ khí', 'Cảm biến', 'Điện tử'];
export { PART_CATEGORIES }; 

// Dữ liệu mock ban đầu cho kho vật tư
const initialParts = Array.from({ length: 15 }, (_, i) => {
    const stock = faker.number.int({ min: 1, max: 30 });
    const isSpecial = i % 5 === 0;
    const category = faker.helpers.arrayElement(PART_CATEGORIES); 
    
    let name;
    if (category === 'Vòng bi/Bạc đạn') {
        name = `Vòng bi Z${i} - SKF 6205`;
    } else if (category === 'Cảm biến') {
         name = `Cảm biến áp suất tốc độ cao`;
    } else {
        name = isSpecial ? `Phụ tùng đặc biệt ${i}` : `Linh kiện ${i}`;
    }

    return {
        id: `SP-${1000 + i}`,
        // CẬP NHẬT: Không gán QR code cho một số vật tư (i % 3 === 0)
        qrCodeId: i % 3 === 0 ? null : faker.string.uuid(), 
        name: name,
        description: faker.lorem.sentence(8),
        unit: faker.helpers.arrayElement(['Cái', 'Lít', 'Mét', 'Bộ']),
        stock: stock,
        minStock: CRITICAL_THRESHOLD,
        location: faker.helpers.arrayElement(['Kệ A01', 'Kệ B05', 'Kho Lạnh']),
        image: `https://picsum.photos/seed/${i}/500/500`, 
        vendor: faker.company.name(),
        lastIn: dayjs().subtract(faker.number.int({ min: 1, max: 180 }), 'day').toISOString(),
        category: category, 
    };
});

export const useSpareParts = () => {
    const [parts, setParts] = useState(initialParts);
    const { message } = App.useApp();

    // Tính toán trạng thái tồn kho (giữ nguyên)
    const partsWithStatus = useMemo(() => {
        return parts.map(p => {
            let status = 'Normal';
            let color = 'green';
            if (p.stock <= p.minStock) {
                status = 'Critical Low';
                color = 'red';
            } else if (p.stock <= WARNING_THRESHOLD) {
                status = 'Low Stock';
                color = 'gold';
            }
            return { ...p, status, color };
        });
    }, [parts]);

    // Thêm / Cập nhật vật tư
    const savePart = useCallback((partData, isNew) => {
        if (isNew) {
            const newPart = {
                ...partData,
                id: `SP-${1000 + parts.length}`,
                qrCodeId: null, // KHÔNG TẠO QR ID KHI TẠO MỚI
                lastIn: new Date().toISOString(),
                minStock: CRITICAL_THRESHOLD, 
            };
            setParts(prev => [newPart, ...prev]);
            message.success(`Đã thêm vật tư mới: ${newPart.name}. QR Code sẽ được tạo sau.`);
        } else {
            setParts(prev => prev.map(p => 
                p.id === partData.id ? { ...p, ...partData } : p
            ));
            message.success(`Đã cập nhật vật tư: ${partData.name}`);
        }
        return true;
    }, [parts.length, message]);

    // Xóa vật tư (giữ nguyên)
    const deletePart = useCallback((id) => {
        setParts(prev => prev.filter(p => p.id !== id));
        message.warning(`Đã xóa vật tư ${id} khỏi kho.`);
    }, [message]);
    
    // Giả lập Import từ Excel (CẬP NHẬT: Bỏ qrCodeId khỏi mock import)
    const mockImport = useCallback(() => {
        message.info('Đang mô phỏng nhập dữ liệu từ Excel (5 bản ghi mới)...');
        const mockNewParts = Array.from({ length: 5 }, (_, i) => ({
            id: `SP-${3000 + i}`,
            qrCodeId: null, // KHÔNG TẠO QR ID KHI IMPORT
            name: `Phụ tùng Nhập mới ${i}`,
            description: 'Mô tả từ file nhập.',
            unit: 'Bộ',
            stock: 50,
            minStock: CRITICAL_THRESHOLD,
            location: 'Kệ Z01',
            image: `https://picsum.photos/seed/import${i}/50/50`,
            vendor: 'New Supplier',
            lastIn: new Date().toISOString(),
            category: faker.helpers.arrayElement(PART_CATEGORIES), 
        }));
        setParts(prev => [...mockNewParts, ...prev]);
        message.success('Đã nhập thành công 5 bản ghi mới!');
    }, [message]);
    
    // HÀM MỚI: TẠO QR CODE CHO VẬT TƯ
    const generateQrCode = useCallback((partId, partName) => {
        const newQrCodeId = faker.string.uuid();
        setParts(prev => prev.map(p => 
            p.id === partId ? { ...p, qrCodeId: newQrCodeId } : p
        ));
        message.success(`Đã tạo QR Code thành công cho vật tư ${partName}.`);
        return newQrCodeId;
    }, [message]);


    // Hàm tra cứu chi tiết vật tư dựa trên QR ID (Dùng cho logic quét)
    const getPartByQrId = useCallback((qrCodeId) => {
        return partsWithStatus.find(p => p.qrCodeId === qrCodeId);
    }, [partsWithStatus]);


    return {
        parts: partsWithStatus,
        savePart,
        deletePart,
        mockImport,
        getPartByQrId, 
        PART_CATEGORIES, 
        generateQrCode, // EXPORT HÀM MỚI
        // Dữ liệu cho KPI Dashboard nhỏ
        summary: {
            totalItems: parts.length,
            criticalCount: partsWithStatus.filter(p => p.status === 'Critical Low').length,
            lowStockCount: partsWithStatus.filter(p => p.status === 'Low Stock').length,
        }
    };
};