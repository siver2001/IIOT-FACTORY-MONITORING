// FRONTEND/src/maintenance/FailureTreeAnalysis.jsx
import React from 'react';
import { Card, Typography, Tag, Divider, Space } from 'antd';
import { CloseCircleOutlined, SettingOutlined, ToolOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Dữ liệu mô phỏng Cây Lỗi (Failure Tree Analysis - FTA)
 * Mỗi cây lỗi được liên kết với một Mã Lỗi (Fault Code) cụ thể (được lấy từ FAULT_CATALOG).
 */
const FTA_MODELS = {
    // Mã lỗi Nhiệt độ cao: T-005
    'T-005': {
        topEvent: 'Máy Dừng do Quá Nhiệt',
        faultCode: 'T-005',
        tree: [
            { id: 1, type: 'AND', label: 'Quá Nhiệt Lâu Dài VÀ Cảm Biến Hoạt Động', icon: <CloseCircleOutlined style={{ color: 'red' }} /> },
            [
                { id: 1.1, type: 'OR', label: 'Nguyên nhân sinh nhiệt', icon: <SettingOutlined /> },
                [
                    { id: '1.1.1', type: 'BASE', label: 'Thiếu chất làm mát (CM-001)' },
                    { id: '1.1.2', type: 'BASE', label: 'Tải quá mức trong 24 giờ (ME-002)' },
                    { id: '1.1.3', type: 'BASE', label: 'Lỗi điện trở cuộn dây (EL-005)' }
                ],
                { id: 1.2, type: 'BASE', label: 'Cảm Biến Nhiệt Hoạt Động Đúng' }
            ]
        ]
    },
    // Mã lỗi Rung động cao: E-002
    'E-002': {
        topEvent: 'Cảnh báo Rung động Cao',
        faultCode: 'E-002',
        tree: [
            { id: 2, type: 'OR', label: 'Lỗi Cơ khí hoặc Lỗi Lắp đặt', icon: <ToolOutlined style={{ color: 'orange' }} /> },
            [
                { id: 2.1, type: 'BASE', label: 'Vòng bi bị hỏng/mòn (ME-001)' },
                { id: 2.2, type: 'BASE', label: 'Mất cân bằng trục quay (ME-003)' },
                { id: 2.3, type: 'BASE', label: 'Lỏng chân đế/giá đỡ (ME-004)' }
            ]
        ]
    },
    // Mô hình mặc định nếu không tìm thấy lỗi
    'DEFAULT': {
        topEvent: 'Phân tích Chung: Lỗi không xác định',
        faultCode: 'N/A',
        tree: [
            { id: 0, type: 'BASE', label: 'Vui lòng kiểm tra Lịch sử Cảnh báo để lấy Mã lỗi và xem mô hình chi tiết.'}
        ]
    }
};

// Hàm mô phỏng lựa chọn mô hình FTA
const getFTAByMachineId = (machineId) => {
    // Logic giả định: M-101 thường xảy ra lỗi T-005, M-102 lỗi E-002
    if (machineId === 'M-101') return FTA_MODELS['T-005'];
    if (machineId === 'M-102') return FTA_MODELS['E-002'];
    return FTA_MODELS['DEFAULT'];
}

/**
 * Component hiển thị Cây Lỗi FTA (Mocked)
 * @param {string} machineId Mã máy
 */
const FailureTreeAnalysis = ({ machineId }) => {
    const ftaModel = getFTAByMachineId(machineId);

    // Hàm đệ quy hiển thị cây
    const renderTree = (nodes, level = 0) => {
        return nodes.map((node, index) => {
            if (Array.isArray(node)) {
                return <div key={`branch-${level}-${index}`} className={`tw-ml-8 tw-pl-4 tw-border-l tw-border-dashed tw-border-gray-300`}>{renderTree(node, level + 1)}</div>;
            }

            const isGate = node.type === 'AND' || node.type === 'OR';
            const bgColor = node.type === 'AND' ? 'tw-bg-red-100' : (node.type === 'OR' ? 'tw-bg-yellow-100' : 'tw-bg-gray-100');
            const borderColor = node.type === 'AND' ? 'tw-border-red-300' : (node.type === 'OR' ? 'tw-border-yellow-300' : 'tw-border-gray-300');

            return (
                <div key={node.id} className="tw-my-2">
                    <div className={`tw-p-2 tw-rounded-lg tw-border ${bgColor} ${borderColor} tw-flex tw-items-center tw-space-x-2`}>
                        {isGate && <Tag color={node.type === 'AND' ? 'red' : 'orange'}>{node.type}</Tag>}
                        {node.icon}
                        <Text strong={isGate} type={node.type === 'BASE' ? 'secondary' : 'default'}>{node.label}</Text>
                        {node.type === 'BASE' && <Tag color="blue">RCA</Tag>}
                    </div>
                    {/* Render Children nếu có */}
                    {Array.isArray(node.children) && <div className="tw-ml-8 tw-pl-4 tw-border-l tw-border-dashed tw-border-gray-300">{renderTree(node.children, level + 1)}</div>}
                </div>
            );
        });
    };

    return (
        <Card size="small" className="tw-border-l-4 tw-border-blue-500">
            <Title level={4} className="tw-text-blue-700">{ftaModel.topEvent}</Title>
            <Text type="secondary">Mã Lỗi liên kết: <Tag color="geekblue" style={{ fontSize: '14px' }}>{ftaModel.faultCode}</Tag></Text>
            <Divider />
            <div className="fta-tree-container tw-font-mono tw-text-sm">
                {renderTree(ftaModel.tree)}
            </div>
        </Card>
    );
};

export default FailureTreeAnalysis;