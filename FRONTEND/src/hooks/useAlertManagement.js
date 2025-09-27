import { useState, useMemo, useCallback } from 'react';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs'; 

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

// Hàm mô phỏng tạo một danh sách cảnh báo phong phú (giữ nguyên logic cơ bản)
const generateMockAlerts = (count = 50) => {
    const alerts = [];
    let currentTime = new Date();

    for (let i = 0; i < count; i++) {
        const severity = faker.helpers.arrayElement(SEVERITIES);
        let status;
        if (i < 10) { 
            status = 'Active'; 
        } else {
            status = faker.helpers.arrayElement(STATUSES);
        }

        currentTime.setMinutes(currentTime.getMinutes() - faker.number.int({ min: 30, max: 24 * 60 }));

        let acknowledgedBy = null;
        let resolvedInfo = null;
        let faultCode = null; // Thêm faultCode
        
        if (status === 'Acknowledged' || status === 'Resolved') {
             acknowledgedBy = faker.helpers.arrayElement(['admin_factory', 'supervisor_a']);
        }
        if (status === 'Resolved') {
            const fault = faker.helpers.arrayElement(FAULT_CATALOG);
            faultCode = fault.code; // Gán mã lỗi giả lập
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
            timestamp: new Date(currentTime).toISOString(),
            status: status,
            priority: severity === 'Critical' ? 1 : severity === 'Error' ? 2 : 3,
            acknowledgedBy: acknowledgedBy,
            resolvedInfo: resolvedInfo, // Đổi tên từ resolvedNotes thành resolvedInfo
            faultCode: faultCode,
        });
    }
    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const useAlertManagement = () => {
    const [alerts, setAlerts] = useState(generateMockAlerts());
    
    // Cập nhật trạng thái cảnh báo 
    const updateAlertStatus = useCallback((id, newStatus, user, notes = null, faultCode = null) => {
        setAlerts(prevAlerts => prevAlerts.map(alert => {
            if (alert.id === id) {
                const updatedAlert = { ...alert, status: newStatus };
                
                if (newStatus === 'Acknowledged') {
                    updatedAlert.acknowledgedBy = user || 'Admin';
                    updatedAlert.resolvedInfo = null; 
                    updatedAlert.faultCode = null;
                }
                if (newStatus === 'Resolved') {
                    updatedAlert.acknowledgedBy = updatedAlert.acknowledgedBy || user || 'Admin';
                    // Đóng gói tất cả thông tin giải quyết
                    updatedAlert.resolvedInfo = JSON.stringify({ ...notes, faultCode }); 
                    updatedAlert.faultCode = faultCode;
                }
                return updatedAlert;
            }
            return alert;
        }));
    }, []);

    // ... (Các hàm khác giữ nguyên)

    // Hàm Filtering (Giữ nguyên)
    const getFilteredAlerts = useCallback((filters) => {
        return alerts.filter(alert => {
            // ... (Logic lọc giữ nguyên)
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

                // Kiểm tra xem thời gian bản ghi có nằm trong khoảng [start, end]
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
        activeAlertCount,
        getFilteredAlerts, 
        updateAlertStatus,
        MACHINE_IDS,
        SEVERITIES,
        FAULT_CATALOG, // EXPORT danh mục lỗi
    };
};