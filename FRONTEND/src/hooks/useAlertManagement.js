// FRONTEND/src/hooks/useAlertManagement.js

import { useState, useMemo, useCallback } from 'react';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs'; 
import { App } from 'antd'; 
import { useWorkOrder } from '../maintenance/useWorkOrder'; 
import { useFaultCatalog } from './useFaultCatalog'; // Import hook quản lý Catalog
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);


const MACHINE_IDS = ['M-CNC-101', 'M-LASER-102', 'M-PRESS-103', 'M-ROBOT-104'];
const SEVERITIES = ['Critical', 'Error', 'Warning'];
const ALERT_MESSAGES = [
    'Nhiệt độ cao bất thường tại trục chính',
    'Rung động vượt ngưỡng cho phép (Baseline)',
    'Áp suất thủy lực thấp hơn mức tối thiểu',
    'Mất tín hiệu truyền thông PLC',
    'Cảnh báo sắp hết tuổi thọ bạc đạn'
];
const STATUSES = ['Active', 'Acknowledged', 'Resolved'];

// Hàm mô phỏng tạo một danh sách cảnh báo phong phú
// FIX: Hàm này không còn phụ thuộc vào FAULT_CATALOG tĩnh nữa
const generateMockAlerts = (count = 50) => {
    // Sử dụng mockFaults cố định để đảm bảo mock data ban đầu có lỗi Resolved
    const mockFaults = [
        { code: 'T-005', description: 'Quá nhiệt' }, 
        { code: 'E-002', description: 'Rung động' }
    ];

    const alerts = [];
    let currentTime = dayjs().subtract(7, 'day');

    for (let i = 0; i < count; i++) {
        const severity = faker.helpers.arrayElement(SEVERITIES);
        let status;
        if (i < 10) { status = 'Active'; } else { status = faker.helpers.arrayElement(STATUSES); }

        currentTime = currentTime.add(faker.number.int({ min: 30, max: 24 * 60 }), 'minute');
        const timestamp = currentTime.toISOString();

        let acknowledgedBy = null;
        let acknowledgedAt = null;
        let resolvedInfo = null;
        let faultCode = null; 
        
        if (status === 'Acknowledged' || status === 'Resolved') {
             acknowledgedBy = faker.helpers.arrayElement(['admin_factory', 'supervisor_a']);
             acknowledgedAt = dayjs(timestamp).add(faker.number.int({ min: 10, max: 120 }), 'minute').toISOString();
        }
        if (status === 'Resolved' && i % 3 === 0) { // Đảm bảo một số lỗi có faultCode
            const fault = faker.helpers.arrayElement(mockFaults);
            faultCode = fault.code; 
            resolvedInfo = JSON.stringify({
                cause: `Lỗi: ${fault.description} xảy ra do mài mòn.`, 
                action: 'Đã thay thế linh kiện.',
                faultCode: faultCode,
            });
        }

        alerts.push({
            id: faker.string.uuid(),
            machineId: faker.helpers.arrayElement(MACHINE_IDS),
            severity: severity,
            message: faker.helpers.arrayElement(ALERT_MESSAGES),
            timestamp: timestamp,
            acknowledgedAt: acknowledgedAt, 
            status: status,
            priority: severity === 'Critical' ? 1 : severity === 'Error' ? 2 : 3,
            acknowledgedBy: acknowledgedBy,
            resolvedInfo: resolvedInfo, 
            faultCode: faultCode,
        });
    }
    return alerts.sort((a, b) => dayjs(b.timestamp).unix() - dayjs(a.timestamp).unix());
};

export const useAlertManagement = () => {
    const { message } = App.useApp(); 
    const { createWorkOrder } = useWorkOrder(); 
    
    // FIX: Lấy FAULT_CATALOG và hàm thêm động từ hook mới
    const { FAULT_CATALOG, addDynamicFaultCode } = useFaultCatalog(); 
    
    // Khởi tạo Alerts
    const [alerts, setAlerts] = useState(generateMockAlerts());
    

    // Hàm updateAlertStatus (Giữ nguyên)
    const updateAlertStatus = useCallback((id, newStatus, user, notes = null, faultCode = null) => {
        setAlerts(prevAlerts => prevAlerts.map(alert => {
            if (alert.id === id) {
                const updatedAlert = { ...alert, status: newStatus };
                
                if (newStatus === 'Acknowledged') {
                    updatedAlert.acknowledgedBy = user || 'Admin';
                    updatedAlert.acknowledgedAt = new Date().toISOString(); 
                    updatedAlert.resolvedInfo = null; 
                    updatedAlert.faultCode = null;
                }
                if (newStatus === 'Resolved') {
                    updatedAlert.acknowledgedBy = updatedAlert.acknowledgedBy || user || 'Admin';
                    updatedAlert.acknowledgedAt = updatedAlert.acknowledgedAt || new Date().toISOString(); 
                    updatedAlert.resolvedInfo = JSON.stringify({ ...notes, faultCode }); 
                    updatedAlert.faultCode = faultCode;
                }
                return updatedAlert;
            }
            return alert;
        }));
    }, []);

    // KHỐI 1: TÍNH TOÁN KPI SUMMARY (Giữ nguyên)
    const kpiSummary = useMemo(() => {
        const totalAlerts = alerts.length;
        const activeCount = alerts.filter(a => a.status === 'Active').length;
        const acknowledgedCount = alerts.filter(a => a.status === 'Acknowledged').length;
        const criticalCount = alerts.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length; 
        return { totalAlerts, activeCount, acknowledgedCount, criticalCount };
    }, [alerts]);

    // KHỐI 2: TÍNH TOÁN ADVANCED KPI (MTTA và Độ lặp lại Lỗi)
    const advancedKPIs = useMemo(() => {
        let totalAcknowledgeTime = 0; 
        let acknowledgedCount = 0;
        const machineFailureCount = {};
        const faultCodeCount = {};

        alerts.forEach(alert => {
            if ((alert.status === 'Acknowledged' || alert.status === 'Resolved') && alert.timestamp && alert.acknowledgedAt) {
                const timeDiffMs = dayjs(alert.acknowledgedAt).diff(dayjs(alert.timestamp));
                totalAcknowledgeTime += timeDiffMs;
                acknowledgedCount++;
            }
            if (alert.status === 'Resolved') {
                machineFailureCount[alert.machineId] = (machineFailureCount[alert.machineId] || 0) + 1;
                if (alert.faultCode) {
                    faultCodeCount[alert.faultCode] = (faultCodeCount[alert.faultCode] || 0) + 1;
                }
            }
        });

        const mttaHours = acknowledgedCount > 0 ? (totalAcknowledgeTime / acknowledgedCount) / (1000 * 60 * 60) : 0;
        
        // Sắp xếp Top 5 Mã Lỗi, sử dụng FAULT_CATALOG động
        const topFaults = Object.entries(faultCodeCount)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
            .map(([faultCode, count]) => ({ 
                faultCode, 
                count, 
                // Lấy mô tả chi tiết từ catalog động
                description: FAULT_CATALOG.find(f => f.code === faultCode)?.description || 'Không rõ' 
            }));

        return { mtta: parseFloat(mttaHours.toFixed(2)), topFaults };
    }, [alerts, FAULT_CATALOG]);


    // HÀM: Xử lý Giải quyết Alert VÀ Tự động Tạo WO
    const resolveAlertAndCreateWO = useCallback((alertId, resolveData, user) => {
        
        const alertToResolve = alerts.find(a => a.id === alertId);

        if (!alertToResolve) {
            message.error(`Không tìm thấy Alert ${alertId}`);
            return;
        }

        // 1. XỬ LÝ VÀ THÊM MÃ LỖI MỚI (nếu cần)
        const finalFaultEntry = addDynamicFaultCode(resolveData.faultCode);
        const finalFaultCode = finalFaultEntry.code;

        // 2. TẠO WORK ORDER tự động nếu là Critical/Error
        if (alertToResolve.severity === 'Critical' || alertToResolve.severity === 'Error') {
            
            const titleWo = `CM: Khắc phục lỗi ${finalFaultCode} (${finalFaultEntry.description}) tại ${alertToResolve.machineId}`;
            
            createWorkOrder({
                machineCode: alertToResolve.machineId, 
                type: 'CM',
                title: titleWo,
                description: `Tạo tự động từ Alert ${alertId}.\nNguyên nhân gốc rễ: ${resolveData.cause}.\nHành động khắc phục: ${resolveData.action}.\nLoại lỗi: ${finalFaultEntry.description}`,
                priority: finalFaultEntry.priority === 'Critical' ? 'Cao' : 'Trung bình',
                dueDate: dayjs().add(1, 'day').toDate(), 
                sourceAlertId: alertId, 
                assignedTo: user, 
            });
        }
        
        // 3. CẬP NHẬT TRẠNG THÁI ALERT 
        updateAlertStatus(
            alertId, 
            'Resolved', 
            user, 
            { cause: resolveData.cause, action: resolveData.action }, 
            finalFaultCode 
        );

        message.success(`Alert ${alertId} đã được giải quyết và đóng. Lệnh công việc (WO) đã được tạo tự động.`);

    }, [alerts, message, createWorkOrder, updateAlertStatus, addDynamicFaultCode, FAULT_CATALOG]);


    // LOGIC LỌC DỮ LIỆU (Giữ nguyên)
    const getFilteredAlerts = useCallback((filters) => {
         return alerts.filter(alert => {
            const { status, severity, machineId, dateRange } = filters;
            let isValid = true;
            
            if (status && status !== 'All' && alert.status !== status) { isValid = false; }
            if (isValid && severity && alert.severity !== severity) { isValid = false; }
            if (isValid && machineId && alert.machineId !== machineId) { isValid = false; }

            if (isValid && dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
                const recordTime = dayjs(alert.timestamp);
                const [start, end] = dateRange;
                if (!recordTime.isSameOrAfter(start, 'second') || recordTime.isAfter(end, 'second')) { isValid = false; }
            }

            return isValid;
        });
    }, [alerts]);


    return {
        alerts: alerts, 
        kpiSummary, 
        MACHINE_IDS,
        SEVERITIES,
        FAULT_CATALOG: FAULT_CATALOG, // EXPORT CATALOG ĐỘNG
        getFilteredAlerts, 
        updateAlertStatus,
        resolveAlertAndCreateWO, 
    };
};