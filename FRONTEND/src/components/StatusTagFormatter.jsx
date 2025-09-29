// FRONTEND/src/components/StatusTagFormatter.jsx

import React from 'react';
import { Tag } from 'antd';
import { 
    CheckCircleOutlined, AlertOutlined, StopOutlined, ClockCircleOutlined, SyncOutlined, FallOutlined, StockOutlined 
} from '@ant-design/icons';

/**
 * Chuẩn hóa cách hiển thị Tag cho các loại trạng thái khác nhau.
 * * @param {string} type Loại trạng thái (WO, ALERT, PART, MACHINE)
 * @param {string} status Giá trị trạng thái thực tế
 */
const StatusTagFormatter = ({ type, status, minStock = null }) => {
    let color = 'default';
    let text = status || 'N/A';
    let icon = null;

    switch (type.toUpperCase()) {
        case 'WO': // Work Order Status
            if (status === 'Pending') { color = 'volcano'; icon = <ClockCircleOutlined />; }
            else if (status === 'In_Progress') { color = 'blue'; icon = <SyncOutlined spin />; }
            else if (status === 'Completed') { color = 'green'; icon = <CheckCircleOutlined />; }
            else if (status === 'Cancelled') { color = 'red'; icon = <StopOutlined />; }
            break;
        case 'ALERT': // Alert Severity
            if (status === 'Critical') { color = 'red'; icon = <AlertOutlined />; }
            else if (status === 'Error') { color = 'volcano'; icon = <StopOutlined />; }
            else if (status === 'Warning') { color = 'gold'; icon = <FallOutlined />; }
            else if (status === 'Resolved') { color = 'green'; icon = <CheckCircleOutlined />; }
            break;
        case 'PART': // Spare Parts Stock Status
            if (status === 'Critical Low') { color = 'red'; icon = <AlertOutlined />; }
            else if (status === 'Low Stock') { color = 'gold'; icon = <WarningOutlined />; }
            else { color = 'green'; icon = <StockOutlined />; }
            text = `${status}${minStock ? ` (Min: ${minStock})` : ''}`;
            break;
        case 'MACHINE': // Machine Status
            if (status === 'RUN') { color = 'green'; icon = <CheckCircleOutlined />; }
            else if (status === 'ERROR' || status === 'CRITICAL') { color = 'red'; icon = <AlertOutlined />; }
            else { color = 'blue'; icon = <ClockCircleOutlined />; } // IDLE / UNKNOWN
            break;
        default:
            color = 'default';
    }

    return <Tag color={color} icon={icon}>{text.toUpperCase()}</Tag>;
};

export default StatusTagFormatter;