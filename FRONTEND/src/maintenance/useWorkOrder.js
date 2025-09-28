// FRONTEND/src/maintenance/useWorkOrder.js

import { useState, useCallback, useMemo } from 'react';
import { App } from 'antd';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'; // <--- DÒNG MỚI: Import plugin
dayjs.extend(isSameOrBefore);
import { getPartPrice } from './PartsCatalog'; // Import để tính chi phí phụ tùng

// Mock dữ liệu người dùng/kỹ sư có thể gán công việc
const ASSIGNEES = ['Kỹ sư A', 'Kỹ sư B', 'Kỹ sư C', 'Trưởng ca'];
// Chi phí nhân công mock: 20 USD/giờ
const LABOR_RATE = 20; 
// Tổng giờ chạy mock cho tất cả máy (cho việc tính CPMH)
const TOTAL_RUNNING_HOURS = 15000; 

export const WORK_ORDER_STATUS = {
    PENDING: 'Đang chờ',
    IN_PROGRESS: 'Đang thực hiện',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Hủy bỏ',
};

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
        if (dayjs(completedAt).isSameOrBefore(dueDate, 'day')) {
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

// Hàm tính tổng chi phí WO
const calculateWOCost = (wo) => {
    let partsCost = 0;
    if (wo.partsUsed) {
        partsCost = wo.partsUsed.reduce((sum, item) => sum + (item.qty * getPartPrice(item.partId)), 0);
    }
    const laborCost = (wo.laborHours || 0) * LABOR_RATE;
    return parseFloat((partsCost + laborCost).toFixed(2));
};


export const useWorkOrder = () => {
    const { message } = App.useApp();
    const [workOrders, setWorkOrders] = useState(mockInitialWorkOrders);

    // 1. Tạo Lệnh công việc mới (bao gồm cả thủ công và tự động)
    const createWorkOrder = useCallback((woData) => {
        const newWO = {
            id: `WO-${1000 + workOrders.length}`,
            createdAt: new Date(),
            status: woData.status || WORK_ORDER_STATUS.PENDING,
            laborHours: 0, // Khởi tạo giờ công
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

    // 3. Logic Hoàn thành WO
    const completeWorkOrder = useCallback((woId, completionData) => {
        const completedDate = new Date();
        
        setWorkOrders(prev => prev.map(wo => {
             if (wo.id === woId) {
                const isCompliant = dayjs(completedDate).isSameOrBefore(dayjs(wo.dueDate), 'day');
                return { 
                    ...wo, 
                    status: WORK_ORDER_STATUS.COMPLETED,
                    completedAt: completedDate,
                    isCompliant: isCompliant,
                    laborHours: completionData.laborHours, // LƯU GIỜ CÔNG THỰC TẾ
                    ...completionData,
                };
            }
            return wo;
        }));

        message.success(`Lệnh công việc ${woId} đã Hoàn thành!`);
    }, [message]);
    
    // 4. KPI: PM Compliance (Tỷ lệ Tuân thủ PM)
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

    // 5. KPI: Chi phí Bảo trì (CPMH) - MỚI
    const costKPI = useMemo(() => {
        const completedWOs = workOrders.filter(wo => wo.status === WORK_ORDER_STATUS.COMPLETED);
        
        let totalCost = 0;
        let totalLaborHours = 0;

        completedWOs.forEach(wo => {
            totalCost += calculateWOCost(wo);
            totalLaborHours += wo.laborHours || 0;
        });

        const cpmh = TOTAL_RUNNING_HOURS > 0 ? totalCost / TOTAL_RUNNING_HOURS : 0;

        return {
            totalCost: parseFloat(totalCost.toFixed(2)),
            totalLaborHours: parseFloat(totalLaborHours.toFixed(1)),
            totalRunningHours: TOTAL_RUNNING_HOURS,
            cpmh: parseFloat(cpmh.toFixed(4)), // 4 chữ số thập phân cho chi phí
        };
    }, [workOrders]);
    
    // 6. Bulk Import Dữ liệu Lịch sử (MOCK) - MỚI
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
        costKPI, // EXPORT KPI CHI PHÍ
        createWorkOrder,
        updateWorkOrder,
        completeWorkOrder,
        mockBulkImport, // EXPORT CHỨC NĂNG IMPORT
    };
};