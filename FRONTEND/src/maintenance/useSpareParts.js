// FRONTEND/src/maintenance/useSpareParts.js

import { useState, useMemo, useCallback } from 'react';
import { App } from 'antd';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

/**
 * Hàm tính toán trạng thái tồn kho dựa trên ngưỡng linh hoạt.
 */
const getPartStatus = (stock, critical, low) => {
    if (stock <= critical) {
        return { status: 'Critical Low', color: 'red' };
    }
    if (stock <= low) {
        return { status: 'Low Stock', color: 'volcano' };
    }
    return { status: 'Normal', color: 'green' };
};

// Dữ liệu mock ban đầu cho kho vật tư
const initialParts = (() => {
    const initialCategories = ['Vòng bi/Bạc đạn', 'Vật tư tiêu hao', 'Bộ lọc', 'Cơ khí', 'Cảm biến', 'Điện tử'];
    
    return Array.from({ length: 15 }, (_, i) => {
        const stock = faker.number.int({ min: 1, max: 30 });
        const isSpecial = i % 5 === 0;
        const category = faker.helpers.arrayElement(initialCategories); 
        
        const criticalThreshold = i % 5 === 0 ? 1 : 3; 
        const lowStockThreshold = i % 5 === 0 ? 5 : 8; 
        
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
            qrCodeId: i % 3 === 0 ? null : faker.string.uuid(), 
            name: name,
            description: faker.lorem.sentence(8),
            unit: faker.helpers.arrayElement(['Cái', 'Lít', 'Mét', 'Bộ']),
            stock: stock,
            criticalThreshold: criticalThreshold, 
            lowStockThreshold: lowStockThreshold, 
            location: faker.helpers.arrayElement(['Kệ A01', 'Kệ B05', 'Kho Lạnh']),
            image: `https://picsum.photos/seed/${i}/500/500`, 
            vendor: faker.company.name(),
            lastIn: dayjs().subtract(faker.number.int({ min: 1, max: 180 }), 'day').toISOString(),
            category: category, 
        };
    });
})();


export const useSpareParts = () => {
    const [parts, setParts] = useState(initialParts);
    const { message } = App.useApp();

    // NEW LOGIC: Tự động Lọc và Dọn dẹp Category List
    const allPartCategories = useMemo(() => {
        const uniqueCategories = [...new Set(parts.map(p => p.category))];
        return uniqueCategories.filter(c => c).sort(); 
    }, [parts]); 

    // Tính toán trạng thái tồn kho dựa trên ngưỡng LINH HOẠT
    const partsWithStatus = useMemo(() => {
        return parts.map(p => {
            const { status, color } = getPartStatus(
                p.stock, 
                p.criticalThreshold, 
                p.lowStockThreshold
            );
            return { ...p, status, color };
        });
    }, [parts]);

    // Thêm / Cập nhật vật tư
    const savePart = useCallback((partData, isNew) => {
        
        // 1. Xử lý Category từ Select mode="tags"
        const categoryValue = Array.isArray(partData.category) ? partData.category[0] : partData.category;
        const finalCategory = categoryValue ? categoryValue.trim() : '';

        if (!finalCategory) {
            message.error('Vui lòng chọn hoặc nhập Loại Vật tư.');
            return false;
        }

        // 2. Đảm bảo ngưỡng là số nguyên
        partData.criticalThreshold = Number(partData.criticalThreshold);
        partData.lowStockThreshold = Number(partData.lowStockThreshold);
        
        // Dữ liệu mới/cập nhật
        const dataToSave = { ...partData, category: finalCategory };

        if (isNew) {
            const newPart = {
                ...dataToSave,
                id: `SP-${1000 + parts.length}`,
                qrCodeId: null, 
                lastIn: new Date().toISOString(),
            };
            setParts(prev => [newPart, ...prev]);
            message.success(`Đã thêm vật tư mới: ${newPart.name}.`);
        } else {
            setParts(prev => prev.map(p => 
                p.id === partData.id ? { ...p, ...dataToSave } : p
            ));
            message.success(`Đã cập nhật vật tư: ${partData.name}`);
        }
        return true;
    }, [parts.length, message]);

    // Xóa vật tư
    const deletePart = useCallback((id) => {
        setParts(prev => prev.filter(p => p.id !== id));
        message.warning(`Đã xóa vật tư ${id} khỏi kho.`);
    }, [message]);
    
    // Giả lập Import từ Excel
    const mockImport = useCallback(() => {
        message.info('Đang mô phỏng nhập dữ liệu từ Excel (5 bản ghi mới)...');
        
        const importedCategory = 'Vật tư Nhập Khẩu Mới';

        const mockNewParts = Array.from({ length: 5 }, (_, i) => ({
            id: `SP-${3000 + i}`,
            qrCodeId: null, 
            name: `Phụ tùng Nhập mới ${i}`,
            description: 'Mô tả từ file nhập.',
            unit: 'Bộ',
            stock: 50,
            
            criticalThreshold: 5, 
            lowStockThreshold: 15,
            
            location: 'Kệ Z01',
            image: `https://picsum.photos/seed/import${i}/50/50`,
            vendor: 'New Supplier',
            lastIn: new Date().toISOString(),
            category: importedCategory, // Dùng category mới
        }));
        
        // Tự động thêm category mới vào danh sách (dù useMemo sẽ tự cập nhật)
        setParts(prev => [...mockNewParts, ...prev]);
        message.success('Đã nhập thành công 5 bản ghi mới!');
    }, [message]);
    
    // HÀM: TẠO QR CODE CHO VẬT TƯ
    const generateQrCode = useCallback((partId, partName) => {
        const newQrCodeId = faker.string.uuid();
        setParts(prev => prev.map(p => 
            p.id === partId ? { ...p, qrCodeId: newQrCodeId } : p
        ));
        message.success(`Đã tạo QR Code thành công cho vật tư ${partName}.`);
        return newQrCodeId;
    }, [message]);
    
    // NEW: Hàm ghi nhận nhập/xuất kho (Stock Movement)
    const recordStockMovement = useCallback((partId, quantity, type, notes) => {
        let newStock = 0;
        let success = false;
        
        setParts(prev => prev.map(p => {
            if (p.id === partId) {
                if (type === 'IN') {
                    newStock = p.stock + quantity;
                    message.success(`Nhập kho thành công: +${quantity} ${p.unit} cho ${p.name}.`);
                    success = true;
                    return { ...p, stock: newStock, lastIn: new Date().toISOString() };
                } else if (type === 'OUT') {
                    if (p.stock >= quantity) {
                        newStock = p.stock - quantity;
                        // Chỉ hiển thị thông báo cho thao tác thủ công
                        if (!notes || !notes.startsWith('Sử dụng cho WO')) { 
                           message.info(`Xuất kho thành công: -${quantity} ${p.unit} cho ${p.name}.`);
                        }
                        success = true;
                        return { ...p, stock: newStock };
                    } else {
                        message.error(`Không đủ tồn kho: Chỉ còn ${p.stock} ${p.unit} của ${p.name}.`);
                        success = false;
                        return p;
                    }
                }
            }
            return p;
        }));
        return success;
    }, [message]);

    // Hàm tra cứu chi tiết vật tư dựa trên QR ID
    const getPartByQrId = useCallback((qrCodeId) => {
        return partsWithStatus.find(p => p.qrCodeId === qrCodeId);
    }, [partsWithStatus]);


    return {
        parts: partsWithStatus,
        savePart,
        deletePart,
        mockImport,
        getPartByQrId, 
        PART_CATEGORIES: allPartCategories, 
        generateQrCode, 
        recordStockMovement, // EXPORT CHO CHỨC NĂNG THỦ CÔNG
        // Dữ liệu cho KPI Dashboard nhỏ 
        summary: {
            totalItems: parts.length,
            criticalCount: partsWithStatus.filter(p => p.status === 'Critical Low').length,
            lowStockCount: partsWithStatus.filter(p => p.status === 'Low Stock').length,
        }
    };
};