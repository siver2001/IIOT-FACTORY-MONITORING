import { useState, useMemo, useCallback } from 'react';
import { faker } from '@faker-js/faker';

const MACHINE_IDS = ['M-CNC-101', 'M-LASER-102', 'M-PRESS-103', 'M-ROBOT-104'];

const initialAssets = MACHINE_IDS.map(id => {
    const isUnderWarranty = faker.datatype.boolean();
    const purchaseDate = faker.date.past({ years: 3 });
    const warrantyEndDate = isUnderWarranty 
        ? faker.date.future({ years: 1, refDate: purchaseDate })
        : faker.date.past({ years: 1, refDate: purchaseDate });

    // Lịch bảo dưỡng dự kiến (Preventive Maintenance - PM)
    const lastPMDate = faker.date.past({ days: 90 });
    const nextPMDate = faker.date.future({ days: 60, refDate: lastPMDate });
    
    return {
        id: id,
        name: `${id} - Máy ${faker.commerce.productAdjective()} ${faker.lorem.word()}`,
        model: faker.vehicle.model(),
        manufacturer: faker.company.name(),
        serialNumber: faker.string.uuid().slice(0, 8).toUpperCase(),
        purchaseDate: purchaseDate.toISOString().slice(0, 10),
        warrantyEndDate: warrantyEndDate.toISOString().slice(0, 10),
        isUnderWarranty: isUnderWarranty,
        location: faker.helpers.arrayElement(['Khu A', 'Khu B', 'Khu C']),
        lastPMDate: lastPMDate.toISOString().slice(0, 10),
        nextPMDate: nextPMDate.toISOString().slice(0, 10),
        maintenanceCycle: faker.helpers.arrayElement([90, 180, 365]), // chu kỳ (ngày)
    };
});

export const useAssetManagement = () => {
    const [assets, setAssets] = useState(initialAssets);

    // Tính toán tài sản sắp hết bảo hành hoặc sắp đến PM
    const assetSummary = useMemo(() => {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        const soonToExpireWarranty = assets.filter(asset => {
            const endDate = new Date(asset.warrantyEndDate);
            return endDate > today && endDate <= nextMonth;
        });

        const soonDuePM = assets.filter(asset => {
            const nextPM = new Date(asset.nextPMDate);
            return nextPM > today && nextPM <= nextMonth;
        });

        return {
            totalAssets: assets.length,
            soonToExpireWarranty,
            soonDuePM,
        };
    }, [assets]);

    const updateAsset = useCallback((updatedAsset) => {
        setAssets(prev => prev.map(asset => 
            asset.id === updatedAsset.id ? updatedAsset : asset
        ));
    }, []);

    return {
        assets,
        assetSummary,
        updateAsset,
    };
};