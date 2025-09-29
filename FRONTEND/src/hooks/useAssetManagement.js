// FRONTEND/src/hooks/useAssetManagement.js

import { useState, useMemo, useCallback } from 'react';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { App } from 'antd'; 

// Mock Data TÀI SẢN
const initialAssets = [
    { 
        id: 'M-CNC-101', 
        name: 'Máy phay CNC 5 trục', 
        model: 'Mazak Variaxis i-500', 
        manufacturer: 'Mazak', 
        location: 'Khu A', 
        isUnderWarranty: true,
        purchaseDate: '2022-01-15',
        warrantyEndDate: '2024-01-15',
        // THÔNG TIN PM QUAN TRỌNG: Sẽ được cập nhật tự động
        lastPMDate: '2024-06-01', 
        maintenanceCycle: 90, // Chu kỳ PM: 90 ngày
        nextPMDate: dayjs('2024-06-01').add(90, 'day').format('YYYY-MM-DD'), 
    },
    { 
        id: 'M-LASER-102', 
        name: 'Máy cắt Laser Fiber', 
        model: 'ByStar Fiber 3000', 
        manufacturer: 'Bystronic', 
        location: 'Khu B', 
        isUnderWarranty: false,
        purchaseDate: '2021-03-20',
        warrantyEndDate: '2023-03-20',
        lastPMDate: '2024-07-15', 
        maintenanceCycle: 120, // Chu kỳ PM: 120 ngày
        nextPMDate: dayjs('2024-07-15').add(120, 'day').format('YYYY-MM-DD'), 
    },
    { 
        id: 'M-PRESS-103', 
        name: 'Máy ép thủy lực', 
        model: 'H-600T', 
        manufacturer: 'Schuler', 
        location: 'Khu C', 
        isUnderWarranty: true,
        purchaseDate: '2023-10-01',
        warrantyEndDate: '2025-10-01',
        lastPMDate: '2024-09-01', 
        maintenanceCycle: 60, // Chu kỳ PM: 60 ngày
        nextPMDate: dayjs('2024-09-01').add(60, 'day').format('YYYY-MM-DD'), 
    },
];

export const useAssetManagement = () => {
    const { message } = App.useApp();
    const [assets, setAssets] = useState(initialAssets);

    /**
     * Cập nhật thông tin chi tiết của một tài sản.
     * Export hàm này để các hook khác (như useWorkOrder) có thể sử dụng.
     */
    const updateAsset = useCallback((updatedAsset) => {
        setAssets(prevAssets => prevAssets.map(asset => 
            asset.id === updatedAsset.id ? { ...asset, ...updatedAsset } : asset
        ));
        // Không gọi message.success ở đây để tránh spam thông báo khi tự động cập nhật
    }, []);

    // --- Các hàm CRUD và KPI Mock khác (giữ nguyên) ---
    const addAsset = useCallback((newAsset) => {
        setAssets(prev => [...prev, newAsset]);
        message.success(`Đã thêm tài sản mới: ${newAsset.id}`);
    }, [message]);
    
    const deleteAsset = useCallback((assetId) => {
        setAssets(prev => prev.filter(a => a.id !== assetId));
        message.success(`Đã xóa tài sản ${assetId}`);
    }, [message]);
    
    const assetSummary = useMemo(() => ({
        totalAssets: assets.length,
        soonToExpireWarranty: assets.filter(a => dayjs(a.warrantyEndDate).diff(dayjs(), 'day') <= 30 && dayjs(a.warrantyEndDate).isAfter(dayjs())).map(a => a.id),
        soonDuePM: assets.filter(a => dayjs(a.nextPMDate).diff(dayjs(), 'day') <= 30 && dayjs(a.nextPMDate).isAfter(dayjs())).map(a => a.id),
    }), [assets]);
    

    return {
        assets,
        updateAsset, // EXPORT updateAsset
        addAsset,
        deleteAsset,
        assetSummary
    };
};