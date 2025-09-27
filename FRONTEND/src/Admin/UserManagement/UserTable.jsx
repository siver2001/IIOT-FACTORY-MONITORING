import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Input, Select, Space, Tooltip, Popconfirm, message, Typography } from 'antd'; // <-- ĐÃ THÊM Typography
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, WarningOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography; // <-- FIX LỖI: Destructure Text từ Typography

// Regex đơn giản để kiểm tra định dạng email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hàm hiển thị Role Tag
const getRoleTag = (role) => {
    if (typeof role !== 'string') return role; 
    return <Tag color={role === 'Administrator' ? 'volcano' : 'blue'}>{role.toUpperCase()}</Tag>;
};

// Hàm hiển thị Status Tag
const getStatusTag = (status) => {
    if (typeof status !== 'string') return status;
    return <Tag color={status === 'Active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>;
};

const UserTable = ({ data, handlers, state }) => {
    const [newRowData, setNewRowData] = useState({
        username: '',
        email: '',
        role: 'Operator',
        status: 'Active'
    });
    const [editingData, setEditingData] = useState({});
    const [validationErrors, setValidationErrors] = useState({}); 

    React.useEffect(() => {
        if (state.editingKey) {
            const currentRecord = data.find(item => item.key === state.editingKey);
            if (currentRecord) {
                setEditingData({
                    key: currentRecord.key,
                    username: currentRecord.username,
                    email: currentRecord.email,
                    role: currentRecord.role,
                    status: currentRecord.status,
                });
            }
        }
    }, [state.editingKey, data]);

    const isEditing = (record) => record.key === state.editingKey;
    const isNewRowRecord = (record) => record.key === 'new-row';
    
    // =================================================================
    // LOGIC VALIDATION
    // =================================================================
    const validateField = (field, value) => {
        let error = '';
        if (!value) {
            error = 'Trường này không được để trống.';
        } else if (field === 'email' && !EMAIL_REGEX.test(value)) {
            error = 'Email không hợp lệ.';
        }
        return error;
    };

    const runNewRowValidation = (currentData) => {
        const errors = {};
        errors.username = validateField('username', currentData.username);
        errors.email = validateField('email', currentData.email);
        
        const isValid = !errors.username && !errors.email;
        setValidationErrors(errors);
        return isValid;
    };
    // =================================================================


    const handleEditChange = (field, value) => {
        setEditingData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleNewRowChange = (field, value) => {
        setNewRowData(prev => ({ ...prev, [field]: value }));
        const error = validateField(field, value);
        setValidationErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleSaveNewUser = () => {
        if (runNewRowValidation(newRowData)) {
            if (handlers.saveNewUser(newRowData)) {
                setNewRowData({ username: '', email: '', role: 'Operator', status: 'Active' });
                setValidationErrors({});
            }
        } else {
            message.error('Vui lòng sửa các lỗi nhập liệu trước khi Lưu.');
        }
    };


    // =================================================================
    // ĐỊNH NGHĨA CỘT
    // =================================================================
    const columns = useMemo(() => ([
        { 
            title: 'Username', 
            dataIndex: 'username', 
            key: 'username',
            render: (text, record) => {
                if (isNewRowRecord(record)) {
                    return (
                        <Input 
                            placeholder="Nhập username" 
                            value={newRowData.username} 
                            onChange={(e) => handleNewRowChange('username', e.target.value)} 
                            status={validationErrors.username ? 'error' : ''}
                        />
                    );
                }
                if (isEditing(record)) {
                    return (
                        <Input 
                            value={editingData.username} 
                            onChange={(e) => handleEditChange('username', e.target.value)} 
                            disabled={handlers.getPermissions(record.username).isProtectedAdmin}
                        />
                    );
                }
                return text;
            }
        },
        { 
            title: 'Email', 
            dataIndex: 'email', 
            key: 'email',
            render: (text, record) => {
                if (isNewRowRecord(record)) {
                    // FIX: Sử dụng Text component đã được import
                    return (
                        <Space direction="vertical" style={{ width: '100%' }} size={2}>
                            <Input 
                                placeholder="Nhập email" 
                                value={newRowData.email} 
                                onChange={(e) => handleNewRowChange('email', e.target.value)} 
                                status={validationErrors.email ? 'error' : ''}
                                suffix={validationErrors.email ? <WarningOutlined style={{ color: '#ff4d4f' }} /> : null}
                            />
                            {validationErrors.email && <Text type="danger" style={{ fontSize: 11 }}>{validationErrors.email}</Text>}
                        </Space>
                    );
                }
                if (isEditing(record)) {
                    return <Input value={editingData.email} onChange={(e) => handleEditChange('email', e.target.value)} />;
                }
                return text;
            }
        },
        { 
            title: 'Role', 
            dataIndex: 'role', 
            key: 'role', 
            render: (role, record) => {
                if (isNewRowRecord(record)) {
                    return (
                        <Select value={newRowData.role} style={{ width: 120 }} onChange={(value) => handleNewRowChange('role', value)}>
                            <Option value="Administrator">Administrator</Option>
                            <Option value="Supervisor">Supervisor</Option>
                            <Option value="Operator">Operator</Option>
                        </Select>
                    );
                }
                if (isEditing(record)) {
                     return (
                         <Select 
                            value={editingData.role} 
                            style={{ width: 120 }} 
                            onChange={(value) => handleEditChange('role', value)}
                        >
                            <Option value="Administrator">Administrator</Option>
                            <Option value="Supervisor">Supervisor</Option>
                            <Option value="Operator">Operator</Option>
                        </Select>
                     );
                }
                return getRoleTag(role);
            }
        },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status', 
            render: (status, record) => {
                if (isNewRowRecord(record)) {
                    return (
                         <Select value={newRowData.status} style={{ width: 120 }} onChange={(value) => handleNewRowChange('status', value)}>
                            <Option value="Active">Active</Option>
                            <Option value="Inactive">Inactive</Option>
                        </Select>
                    );
                }
                if (isEditing(record)) {
                     return (
                         <Select 
                            value={editingData.status} 
                            style={{ width: 120 }} 
                            onChange={(value) => handleEditChange('status', value)}
                        >
                            <Option value="Active">Active</Option>
                            <Option value="Inactive">Inactive</Option>
                        </Select>
                     );
                }
                return getStatusTag(status);
            }
        },
        { 
            title: 'Actions', 
            dataIndex: 'actions',
            key: 'actions', 
            render: (actions, record) => {
                // TRƯỜNG HỢP 1: DÒNG THÊM MỚI -> HIỂN THỊ NÚT LƯU/HỦY
                if (isNewRowRecord(record)) {
                    return (
                        <Space>
                            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={handleSaveNewUser} disabled={!newRowData.username || !newRowData.email || validationErrors.email}>Lưu</Button>
                            <Button size="small" icon={<CloseOutlined />} onClick={handlers.cancelAdd} danger>Hủy</Button>
                        </Space>
                    ); 
                }

                const permissions = handlers.getPermissions(record.username);
                const isCurrentlyEditing = isEditing(record);

                // TRƯỜNG HỢP 2: DÒNG CHỈNH SỬA
                if (isCurrentlyEditing) {
                    return (
                        <Space>
                            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handlers.saveEditedUser(record.key, editingData)}>Lưu</Button>
                            <Button size="small" icon={<CloseOutlined />} onClick={handlers.cancelEditing} danger>Hủy</Button>
                        </Space>
                    );
                }

                // TRƯỜNG HỢP 3: DÒNG CỐ ĐỊNH
                const isDisabled = state.editingKey || state.isAdding;

                return (
                    <Space>
                        {/* Nút chỉnh sửa */}
                        <Tooltip title="Chỉnh sửa tài khoản">
                            <Button size="small" icon={<EditOutlined />} onClick={() => handlers.startEditing(record.key)} disabled={!permissions.canEdit || isDisabled} />
                        </Tooltip>
                        
                        {/* Nút xóa */}
                        <Tooltip 
                            title={permissions.isProtectedAdmin ? "Không thể xóa tài khoản cấp cao nhất" : "Xóa người dùng"}
                        >
                            <Popconfirm
                                title={`Bạn chắc chắn muốn xóa ${record.username}?`}
                                onConfirm={() => handlers.deleteUser(record.key, record.username)}
                                okText="Xóa"
                                cancelText="Hủy"
                                disabled={!permissions.canDelete || isDisabled}
                            >
                                <Button 
                                    size="small" 
                                    icon={<DeleteOutlined />} 
                                    danger 
                                    disabled={!permissions.canDelete || isDisabled}
                                />
                            </Popconfirm>
                        </Tooltip>
                    </Space>
                );
            }
        }
    ]), [state.editingKey, state.isAdding, editingData, handlers, newRowData, validationErrors]);


    const newRow = useMemo(() => state.isAdding ? {
        key: 'new-row',
        username: newRowData.username,
        email: newRowData.email,
        role: newRowData.role,
        status: newRowData.status,
        actions: null,
    } : null, [state.isAdding, newRowData]);
    
    const tableData = useMemo(() => state.isAdding ? [...data, newRow] : data, [data, state.isAdding, newRow]);

    return (
        <Table
            rowKey="key"
            dataSource={tableData}
            columns={columns}
            pagination={{ 
                pageSize: 10,
                hideOnSinglePage: true
            }}
            bordered
            rowClassName={(record) => (
                record.key === state.editingKey ? 'tw-bg-blue-50' : 
                record.key === 'new-row' ? 'tw-bg-green-50' : ''
            )}
        />
    );
};

export default UserTable;