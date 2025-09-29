import { useState, useCallback } from 'react';
import { message } from 'antd';
import apiFetch from '../../services/apiService';
// Dữ liệu mock ban đầu
const initialUsers = [
    { key: '1', username: 'admin_root', role: 'Admin', email: 'admin@factory.com', status: 'Active' },
    { key: '2', username: 'manager_a', role: 'Manager', email: 'manager@factory.com', status: 'Active' },
    { key: '3', username: 'supervisor_b', role: 'Supervisor', email: 'supervisor@factory.com', status: 'Active' },
    { key: '4', username: 'user_line_c', role: 'User', email: 'user@factory.com', status: 'Active' },
    { key: '5', username: 'john_doe', role: 'User', email: 'john@factory.com', status: 'Inactive' },
];

const SUPER_ADMIN_USERNAME = 'admin_root';
const ADMIN_ROLE = 'Admin';
const VALID_ROLES = ['Admin', 'Manager', 'Supervisor', 'User'];

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
    const handleFinalConfirm = useCallback(async () => { 
        if (isAdding || editingKey) {
             message.warning('Vui lòng lưu hoặc hủy chỉnh sửa/thêm mới trước khi xác nhận.');
             return;
        }
        
        try {
            // SỬ DỤNG apiFetch THAY THẾ CHO fetch TRỰC TIẾP
            await apiFetch('/api/admin/users/save', { 
                method: 'POST',
                body: JSON.stringify({ users: users }), 
            }, true); // authRequired = true

            // Nếu apiFetch không ném lỗi, coi như thành công
            message.success(`Xác nhận hoàn thành! Đã lưu ${users.length} tài khoản thành công.`);
        } catch (error) {
            // Lỗi mạng/401/500 đã được xử lý và thông báo toàn cục, nên không cần thông báo lại.
            console.error('Final Save Error (Handled by API Service):', error);
        }
    }, [users, isAdding, editingKey]);
    
    // =================================================================
    // 5. LOGIC PHÂN QUYỀN
    // =================================================================
    const getPermissions = useCallback((recordUsername) => {
        // Chỉ Admin (Level 0) mới có quyền chỉnh sửa/xóa tài khoản
        const isLoggedAdmin = userRole === ADMIN_ROLE;
        const isProtectedAdmin = recordUsername === SUPER_ADMIN_USERNAME; // Không thể xóa tài khoản root
        
        return {
            // Chỉ Admin mới được chỉnh sửa bất kỳ tài khoản nào
            canEdit: isLoggedAdmin, 
            // Chỉ Admin và không phải tài khoản root mới được xóa
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
        SUPER_ADMIN_USERNAME,
        VALID_ROLES
    };
};