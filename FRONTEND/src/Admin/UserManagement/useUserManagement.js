import { useState, useCallback } from 'react';
import { message } from 'antd';

// Dữ liệu mock ban đầu
const initialUsers = [
    { key: '1', username: 'admin_root', role: 'Administrator', email: 'admin@factory.com', status: 'Active' },
    { key: '2', username: 'supervisor_a', role: 'Supervisor', email: 'supervisor@factory.com', status: 'Active' },
    { key: '3', username: 'operator_line_1', role: 'Operator', email: 'op1@factory.com', status: 'Active' },
    { key: '4', username: 'john_doe', role: 'Operator', email: 'john@factory.com', status: 'Inactive' },
];

const SUPER_ADMIN_USERNAME = 'admin_root';

export const useUserManagement = (userRole) => {
    const [users, setUsers] = useState(initialUsers);
    const [isAdding, setIsAdding] = useState(false);
    const [editingKey, setEditingKey] = useState(''); 
    const [nextKey, setNextKey] = useState(initialUsers.length + 1);

    // =================================================================
    // 1. CHỨC NĂNG THÊM (CREATE)
    // =================================================================
    const startAdding = useCallback(() => {
        if (isAdding) return;
        setIsAdding(true);
    }, [isAdding]);

    const saveNewUser = useCallback((newUserData) => {
        if (!newUserData.username || !newUserData.email) {
            message.error('Vui lòng nhập đầy đủ Tên đăng nhập và Email.');
            return false;
        }

        const finalNewUser = { 
            ...newUserData,
            key: nextKey.toString(),
            status: newUserData.status || 'Active', 
        };
        
        setUsers(prevUsers => [...prevUsers, finalNewUser]);
        setIsAdding(false);
        setNextKey(prevKey => prevKey + 1);
        message.success(`Đã thêm tài khoản "${finalNewUser.username}" thành công.`);
        return true;
    }, [nextKey]);

    const cancelAdd = useCallback(() => {
        setIsAdding(false);
    }, []);

    // =================================================================
    // 2. CHỨC NĂNG CHỈNH SỬA (UPDATE)
    // =================================================================
    const startEditing = useCallback((key) => {
        setEditingKey(key);
        message.info(`Đang chỉnh sửa key: ${key}`);
    }, []);

    const saveEditedUser = useCallback((key, updatedData) => {
        setUsers(prevUsers => {
            const index = prevUsers.findIndex(item => item.key === key);
            if (index > -1) {
                const newUsers = [...prevUsers];
                newUsers[index] = { ...newUsers[index], ...updatedData };
                message.success(`Đã cập nhật tài khoản: ${updatedData.username || 'user'}`);
                return newUsers;
            }
            return prevUsers;
        });
        setEditingKey('');
    }, []);
    
    const cancelEditing = useCallback(() => {
        setEditingKey('');
    }, []);


    // =================================================================
    // 3. CHỨC NĂNG XÓA (DELETE)
    // =================================================================
    const deleteUser = useCallback((key, username) => {
        setUsers(prevUsers => prevUsers.filter(user => user.key !== key));
        message.warning(`Đã xóa tài khoản: ${username}`);
    }, []);

    // =================================================================
    // 4. CHỨC NĂNG HOÀN THÀNH (FINAL SAVE)
    // =================================================================
    const handleFinalConfirm = useCallback(() => {
        message.success(`Xác nhận hoàn thành! Đã lưu ${users.length} tài khoản vào hệ thống.`);
        console.log('Final data confirmed and theoretically sent to backend:', users);
    }, [users]);
    
    // =================================================================
    // 5. LOGIC PHÂN QUYỀN
    // =================================================================
    const getPermissions = useCallback((recordUsername) => {
        const isLoggedAdmin = userRole === 'Admin' || userRole === 'Administrator';
        const isProtectedAdmin = recordUsername === SUPER_ADMIN_USERNAME;
        
        return {
            canEdit: isLoggedAdmin, 
            canDelete: isLoggedAdmin && !isProtectedAdmin, 
            isProtectedAdmin,
        };
    }, [userRole]);

    return {
        users,
        isAdding,
        editingKey,
        startAdding,
        saveNewUser,
        cancelAdd,
        startEditing,
        saveEditedUser,
        cancelEditing,
        deleteUser,
        handleFinalConfirm,
        getPermissions,
        SUPER_ADMIN_USERNAME
    };
};