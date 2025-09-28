// FRONTEND/src/hooks/useAlertManagement.js

import { useState, useMemo, useCallback } from 'react';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs'; 
import { App } from 'antd'; 
import { useWorkOrder } from '../maintenance/useWorkOrder'; // Import hook WO mới

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

// DANH MỤC LỖI MỚI (FAULT CATALOG)
const FAULT_CATALOG = [
    { code: 'M-001', description: 'Hỏng Bạc đạn/Vòng bi', category: 'Cơ khí' },
    { code: 'E-002', description: 'Lỗi Cảm biến nhiệt độ', category: 'Điện & Điện tử' },
    { code: 'H-003', description: 'Rò rỉ Áp suất thủy lực', category: 'Thủy lực' },
    { code: 'S-004', description: 'Lỗi Truyền thông PLC', category: 'Phần mềm & Mạng' },
    { code: 'T-005', description: 'Trục chính quá nhiệt', category: 'Vận hành' },
];
// EXPORT để sử dụng trong giao diện
export { FAULT_CATALOG }; 

// Hàm mô phỏng tạo một danh sách cảnh báo phong phú
const generateMockAlerts = (count = 50) => {
    const alerts = [];
    let currentTime = dayjs().subtract(7, 'day'); // Bắt đầu từ 7 ngày trước

    for (let i = 0; i < count; i++) {
        const severity = faker.helpers.arrayElement(SEVERITIES);
        let status;
        if (i < 10) { 
            status = 'Active'; 
        } else {
            status = faker.helpers.arrayElement(STATUSES);
        }

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
        if (status === 'Resolved') {
            const fault = faker.helpers.arrayElement(FAULT_CATALOG);
            faultCode = fault.code; 
            resolvedInfo = JSON.stringify({
                cause: 'Do mài mòn bạc đạn quá mức.', 
                action: 'Đã thay thế bạc đạn mới và hiệu chỉnh lại tần suất giám sát.',
                faultCode: faultCode,
            });
        }


        alerts.push({
            id: faker.string.uuid(),
            machineId: faker.helpers.arrayElement(MACHINE_IDS),
            severity: severity,
            message: faker.helpers.arrayElement(ALERT_MESSAGES),
            timestamp: timestamp,
            acknowledgedAt: acknowledgedAt, // LƯU THỜI GIAN ACKNOWLEDGEMENT CHO MTTA
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
    const [alerts, setAlerts] = useState(generateMockAlerts());
    const { message } = App.useApp(); 
    const { createWorkOrder } = useWorkOrder(); 

    // Hàm updateAlertStatus
    const updateAlertStatus = useCallback((id, newStatus, user, notes = null, faultCode = null) => {
        setAlerts(prevAlerts => prevAlerts.map(alert => {
            if (alert.id === id) {
                const updatedAlert = { ...alert, status: newStatus };
                
                if (newStatus === 'Acknowledged') {
                    updatedAlert.acknowledgedBy = user || 'Admin';
                    updatedAlert.acknowledgedAt = new Date().toISOString(); // CẬP NHẬT THỜI GIAN ACKNOWLEDGEMENT
                    updatedAlert.resolvedInfo = null; 
                    updatedAlert.faultCode = null;
                }
                if (newStatus === 'Resolved') {
                    updatedAlert.acknowledgedBy = updatedAlert.acknowledgedBy || user || 'Admin';
                    updatedAlert.acknowledgedAt = updatedAlert.acknowledgedAt || new Date().toISOString(); // Đảm bảo có acknowledgedAt
                    updatedAlert.resolvedInfo = JSON.stringify({ ...notes, faultCode }); 
                    updatedAlert.faultCode = faultCode;
                }
                return updatedAlert;
            }
            return alert;
        }));
    }, []);

    // KHỐI 1: TÍNH TOÁN KPI SUMMARY
    const kpiSummary = useMemo(() => {
        const totalAlerts = alerts.length;
        const activeCount = alerts.filter(a => a.status === 'Active').length;
        const acknowledgedCount = alerts.filter(a => a.status === 'Acknowledged').length;
        const criticalCount = alerts.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length;

        return {
            totalAlerts,
            activeCount,
            acknowledgedCount,
            criticalCount,
        };
    }, [alerts]);

    // KHỐI 2: TÍNH TOÁN ADVANCED KPI (MTTA và Độ lặp lại Lỗi)
    const advancedKPIs = useMemo(() => {
        let totalAcknowledgeTime = 0; // đơn vị: ms
        let acknowledgedCount = 0;

        const machineFailureCount = {};
        const faultCodeCount = {};

        alerts.forEach(alert => {
            // 1. Tính MTTA
            if ((alert.status === 'Acknowledged' || alert.status === 'Resolved') && alert.timestamp && alert.acknowledgedAt) {
                const timeDiffMs = dayjs(alert.acknowledgedAt).diff(dayjs(alert.timestamp));
                totalAcknowledgeTime += timeDiffMs;
                acknowledgedCount++;
            }
            
            // 2. Độ lặp lại Lỗi (chỉ tính Alert đã Resolved)
            if (alert.status === 'Resolved') {
                machineFailureCount[alert.machineId] = (machineFailureCount[alert.machineId] || 0) + 1;
                if (alert.faultCode) {
                    faultCodeCount[alert.faultCode] = (faultCodeCount[alert.faultCode] || 0) + 1;
                }
            }
        });

        const mttaHours = acknowledgedCount > 0 ? (totalAcknowledgeTime / acknowledgedCount) / (1000 * 60 * 60) : 0;
        
        // Sắp xếp Top 5 Máy
        const topMachines = Object.entries(machineFailureCount)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
            .map(([machineId, count]) => ({ machineId, count }));
            
        // Sắp xếp Top 5 Mã Lỗi
        const topFaults = Object.entries(faultCodeCount)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
            .map(([faultCode, count]) => ({ faultCode, count }));

        return {
            mtta: parseFloat(mttaHours.toFixed(2)), // Giờ
            topMachines,
            topFaults,
        };
    }, [alerts]);


    // HÀM MỚI: Xử lý Giải quyết Alert VÀ Tự động Tạo WO
    const resolveAlertAndCreateWO = useCallback((alertId, resolveData, user) => {
        
        const alertToResolve = alerts.find(a => a.id === alertId);

        if (!alertToResolve) {
            message.error(`Không tìm thấy Alert ${alertId}`);
            return;
        }

        // 1. TẠO WORK ORDER tự động nếu là Critical/Error
        if (alertToResolve.severity === 'Critical' || alertToResolve.severity === 'Error') {
            
            const faultDetail = FAULT_CATALOG.find(f => f.code === resolveData.faultCode);
            const titleWo = `Sự cố: ${alertToResolve.message}`;
            
            createWorkOrder({
                machineCode: alertToResolve.machineId, 
                type: 'CM', // Bảo trì sự cố
                title: titleWo,
                description: `Tạo tự động từ Alert ${alertId}.\nNguyên nhân gốc rễ: ${resolveData.cause}.\nHành động khắc phục: ${resolveData.action}.\nLoại lỗi: ${faultDetail?.description || resolveData.faultCode}`,
                priority: alertToResolve.severity === 'Critical' ? 'Cao' : 'Trung bình',
                dueDate: dayjs().add(1, 'day').toDate(), 
                sourceAlertId: alertId, 
                assignedTo: user, 
            });
        }
        
        // 2. CẬP NHẬT TRẠNG THÁI ALERT 
        updateAlertStatus(
            alertId, 
            'Resolved', 
            user, 
            { cause: resolveData.cause, action: resolveData.action }, 
            resolveData.faultCode 
        );

        message.success(`Alert ${alertId} đã được giải quyết và đóng. Lệnh công việc (WO) đã được tạo tự động.`);

    }, [alerts, message, createWorkOrder, updateAlertStatus]);

    // LOGIC LỌC DỮ LIỆU
    const getFilteredAlerts = useCallback((filters) => {
        return alerts.filter(alert => {
            const { status, severity, machineId, dateRange } = filters;
            let isValid = true;
            
            // 1. Lọc theo Trạng thái
            if (status && status !== 'All' && alert.status !== status) {
                isValid = false;
            }
            
            // 2. Lọc theo Mức độ
            if (isValid && severity && alert.severity !== severity) {
                isValid = false;
            }
            
            // 3. Lọc theo Mã Máy
            if (isValid && machineId && alert.machineId !== machineId) {
                isValid = false;
            }

            // 4. Lọc theo Khoảng thời gian (Date Range)
            if (isValid && dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
                const recordTime = dayjs(alert.timestamp);
                const [start, end] = dateRange;

                if (!recordTime.isSameOrAfter(start, 'second') || recordTime.isAfter(end, 'second')) {
                    isValid = false;
                }
            }

            return isValid;
        });
    }, [alerts]);


    const activeAlertCount = useMemo(() => alerts.filter(a => a.status === 'Active').length, [alerts]);

    return {
        alerts: alerts, 
        kpiSummary, 
        advancedKPIs, // Xuất KPI nâng cao
        activeAlertCount,
        getFilteredAlerts, 
        updateAlertStatus,
        resolveAlertAndCreateWO, 
        MACHINE_IDS,
        SEVERITIES,
        FAULT_CATALOG, 
    };
};