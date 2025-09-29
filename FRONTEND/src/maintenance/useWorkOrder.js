// FRONTEND/src/maintenance/useWorkOrder.js

import { useState, useCallback, useMemo } from 'react';
import { App } from 'antd';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

// Import hook Asset Management để cập nhật ngày PM
import { useAssetManagement } from '../hooks/useAssetManagement'; 

// Giả định hàm này được export từ PartsCatalog.js
// (Để code này hoạt động, cần đảm bảo PartsCatalog.js có hàm getPartPrice(partId))
import { getPartPrice } from './PartsCatalog'; 

const ASSIGNEES = ['Kỹ sư A', 'Kỹ sư B', 'Kỹ sư C', 'Trưởng ca'];
const LABOR_RATE = 20; // Giả định chi phí giờ công: $20/giờ
const TOTAL_RUNNING_HOURS = 15000; 

export const WORK_ORDER_STATUS = {
    PENDING: 'Đang chờ',
    IN_PROGRESS: 'Đang thực hiện',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Hủy bỏ',
};

// --- MOCK DATA GENERATION (Đã giữ nguyên) ---

const mockInitialWorkOrders = Array.from({ length: 40 }, (_, i) => {
    const isPM = i % 3 === 0;
    const isCompleted = i % 2 === 0;
    const dueDate = dayjs().add(faker.number.int({ min: -5, max: 20 }), 'day');
    
    let status = WORK_ORDER_STATUS.PENDING;
    let completedAt = null;
    let isCompliant = false;
    let laborHours = 0;
    let partsUsed = [];

    if (isCompleted) {
        status = WORK_ORDER_STATUS.COMPLETED;
        completedAt = dueDate.subtract(faker.number.int({ min: 0, max: 2 }), 'day').toDate();
        if (dayjs(completedAt).isSameOrBefore(dayjs(dueDate), 'day')) {
             isCompliant = true;
        }
        laborHours = parseFloat(faker.number.float({ min: 1, max: 8, multipleOf: 0.5 }).toFixed(1));
        partsUsed = i % 3 === 0 ? [{ partId: 'P001', qty: faker.number.int({ min: 1, max: 5 }) }] : [];
    } else if (i % 4 === 0) {
        status = WORK_ORDER_STATUS.IN_PROGRESS;
    }


    return {
        id: `WO-${1000 + i}`,
        machineCode: `M-CNC-${101 + (i % 4)}`, // Gán cho 4 máy CNC
        type: isPM ? 'PM' : faker.helpers.arrayElement(['CM', 'PdM']),
        title: isPM ? `Bảo dưỡng định kỳ Q${faker.number.int({ min: 1, max: 4 })}` : faker.lorem.sentence(5),
        description: faker.lorem.paragraph(1),
        priority: faker.helpers.arrayElement(['Cao', 'Trung bình', 'Thấp']),
        status: status,
        dueDate: dueDate.toDate(),
        assignedTo: faker.helpers.arrayElement(ASSIGNEES),
        createdAt: dayjs().subtract(faker.number.int({ min: 1, max: 60 }), 'day').toDate(),
        completionNotes: isCompleted ? faker.lorem.paragraph(1) : null,
        laborHours: laborHours, // GIỜ CÔNG
        partsUsed: partsUsed, 
        completedAt: completedAt,
        isCompliant: isCompliant,
    };
});

// Hàm tính tổng chi phí cho một WO
const calculateWOCost = (wo) => {
    let partsCost = 0;
    if (wo.partsUsed) {
        partsCost = wo.partsUsed.reduce((sum, item) => sum + (item.qty * (getPartPrice(item.partId) || 0)), 0);
    }
    const laborCost = (wo.laborHours || 0) * LABOR_RATE;
    return parseFloat((partsCost + laborCost).toFixed(2));
};

export const useWorkOrder = () => {
    const { message } = App.useApp();
    const [workOrders, setWorkOrders] = useState(mockInitialWorkOrders);

    // 💥 NEW: LẤY ASSETS VÀ HÀM CẬP NHẬT TÀI SẢN
    const { assets, updateAsset } = useAssetManagement();

    // 1. Tạo Lệnh công việc mới
    const createWorkOrder = useCallback((woData) => {
        const newWO = {
            id: `WO-${1000 + workOrders.length}`,
            createdAt: new Date(),
            status: woData.status || WORK_ORDER_STATUS.PENDING,
            laborHours: 0, 
            totalCost: 0, // Khởi tạo tổng chi phí
            ...woData,
        };
        setWorkOrders(prev => [newWO, ...prev]);
        message.success(`Đã tạo Lệnh công việc: ${newWO.id}`);
        return newWO;
    }, [workOrders.length, message]);

    // 2. Cập nhật trạng thái/chi tiết WO
    const updateWorkOrder = useCallback((woId, updates) => {
        setWorkOrders(prev => prev.map(wo => 
            wo.id === woId ? { ...wo, ...updates } : wo
        ));
        message.info(`Đã cập nhật Lệnh công việc: ${woId}`);
    }, [message]);

    // 3. Logic Hoàn thành WO (Đã tích hợp Tự động Cập nhật PM Date)
    const completeWorkOrder = useCallback((woId, completionData) => {
        const completedDate = new Date();
        let isAssetPMUpdated = false;

        setWorkOrders(prev => prev.map(wo => {
            if (wo.id === woId) {
                const isCompliant = dayjs(completedDate).isSameOrBefore(dayjs(wo.dueDate), 'day');
                
                // Tạo một bản ghi WO tạm thời để tính toán chi phí
                const tempWO = { 
                    ...wo, 
                    laborHours: completionData.laborHours, 
                    partsUsed: completionData.partsUsed,
                };
                const totalCost = calculateWOCost(tempWO); // Tính tổng chi phí

                const updatedWO = { 
                    ...wo, 
                    status: WORK_ORDER_STATUS.COMPLETED,
                    completedAt: completedDate,
                    isCompliant: isCompliant,
                    laborHours: completionData.laborHours, 
                    partsUsed: completionData.partsUsed,
                    completionNotes: completionData.completionNotes,
                    totalCost: totalCost, // LƯU TỔNG CHI PHÍ
                };
                
                // =======================================================
                // LOGIC TỰ ĐỘNG CẬP NHẬT PM DATE CHO TÀI SẢN
                // =======================================================
                if (wo.type === 'PM' || wo.type === 'PdM') {
                    const asset = assets.find(a => a.id === wo.machineCode);
                    if (asset && asset.maintenanceCycle) {
                        const newLastPMDate = dayjs(completedDate).format('YYYY-MM-DD');
                        const newNextPMDate = dayjs(completedDate).add(asset.maintenanceCycle, 'day').format('YYYY-MM-DD');
                        
                        // Gọi hàm updateAsset từ useAssetManagement để đồng bộ hóa
                        updateAsset({
                            id: asset.id,
                            lastPMDate: newLastPMDate,
                            nextPMDate: newNextPMDate,
                        });
                        
                        isAssetPMUpdated = true;
                    }
                }
                
                return updatedWO;
            }
            return wo;
        }));

        message.success(`Lệnh công việc ${woId} đã Hoàn thành!`);
        if (isAssetPMUpdated) {
             message.info(`[Tự động] Lịch PM kế tiếp của máy đã được cập nhật.`);
        }
    }, [message, assets, updateAsset]); 
    
    // 4. CHỨC NĂNG MỚI: Xóa Lệnh công việc
    const deleteWorkOrder = useCallback((woId) => {
        setWorkOrders(prev => prev.filter(wo => wo.id !== woId));
        message.warning(`Đã xóa Lệnh công việc: ${woId}`);
    }, [message]);
    
    // 5. Tính toán KPI Tóm tắt
    const pmComplianceKPI = useMemo(() => {
        const pmOrders = workOrders.filter(wo => wo.type === 'PM');
        const totalPMCompleted = pmOrders.filter(wo => wo.status === WORK_ORDER_STATUS.COMPLETED).length;
        const totalPM = pmOrders.length;
        
        const compliantCount = pmOrders.filter(wo => wo.isCompliant).length;
        
        const complianceRate = totalPMCompleted > 0 ? (compliantCount / totalPMCompleted) * 100 : 0;

        return {
            totalPM,
            totalPMCompleted,
            compliantCount,
            complianceRate: parseFloat(complianceRate.toFixed(1)),
        };
    }, [workOrders]);

    const costKPI = useMemo(() => {
        const completedWOs = workOrders.filter(wo => wo.status === WORK_ORDER_STATUS.COMPLETED);
        
        let totalCost = 0;
        let totalLaborHours = 0;

        completedWOs.forEach(wo => {
            // Chi phí phải được tính lại trên WO đã hoàn thành
            totalCost += calculateWOCost(wo); 
            totalLaborHours += wo.laborHours || 0;
        });

        const cpmh = TOTAL_RUNNING_HOURS > 0 ? totalCost / TOTAL_RUNNING_HOURS : 0;

        return {
            totalCost: parseFloat(totalCost.toFixed(2)),
            totalLaborHours: parseFloat(totalLaborHours.toFixed(1)),
            totalRunningHours: TOTAL_RUNNING_HOURS,
            cpmh: parseFloat(cpmh.toFixed(4)), 
        };
    }, [workOrders]);
    
    // 6. Mock Bulk Import
    const mockBulkImport = useCallback(() => {
        message.info('Đang mô phỏng nhập 100 WO lịch sử từ Excel...');
        
        const historicalWOs = Array.from({ length: 100 }, (_, i) => ({
            id: `WO-H${2000 + i}`,
            machineCode: `M-LASER-${101 + (i % 2)}`,
            type: faker.helpers.arrayElement(['PM', 'CM']),
            title: `WO Lịch sử: ${faker.lorem.sentence(3)}`,
            priority: 'Thấp',
            status: WORK_ORDER_STATUS.COMPLETED,
            dueDate: dayjs().subtract(faker.number.int({ min: 100, max: 365 }), 'day').toDate(),
            completedAt: dayjs().subtract(faker.number.int({ min: 100, max: 365 }), 'day').toDate(),
            laborHours: 2,
            partsUsed: i % 5 === 0 ? [{ partId: 'P004', qty: 1 }] : [],
            isCompliant: true,
            createdAt: dayjs().subtract(faker.number.int({ min: 366, max: 700 }), 'day').toDate(),
        }));
        
        setWorkOrders(prev => [...historicalWOs, ...prev]);
        message.success(`Đã nhập thành công 100 WO lịch sử! Tổng cộng: ${workOrders.length + 100} WO.`);
    }, [message, workOrders.length]);


    return {
        workOrders,
        ASSIGNEES,
        pmComplianceKPI,
        costKPI, 
        createWorkOrder,
        updateWorkOrder,
        completeWorkOrder,
        deleteWorkOrder, 
        mockBulkImport, 
    };
};