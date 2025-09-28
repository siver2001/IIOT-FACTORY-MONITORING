// FRONTEND/src/hooks/useDocumentManagement.js

import { useState, useCallback, useMemo } from 'react';
import { faker } from '@faker-js/faker';
import { App } from 'antd';
import dayjs from 'dayjs';

const mockDocuments = [
    { 
        id: faker.string.uuid(), 
        machineId: 'M-CNC-101', 
        name: 'Manual vận hành CNC-101', 
        type: 'PDF', 
        link: 'https://example.com/manual-101.pdf', 
        uploadedBy: 'admin_factory', 
        uploadedDate: dayjs().subtract(30, 'day').toISOString() 
    },
    { 
        id: faker.string.uuid(), 
        machineId: 'M-LASER-102', 
        name: 'Sơ đồ điện LASER-102', 
        type: 'Diagram', 
        link: 'https://example.com/diagram-102.pdf', 
        uploadedBy: 'Kỹ sư A', 
        uploadedDate: dayjs().subtract(10, 'day').toISOString() 
    },
    { 
        id: faker.string.uuid(), 
        machineId: 'M-CNC-101', 
        name: 'Bản vẽ chi tiết trục chính', 
        type: 'Image', 
        link: 'https://example.com/blueprint-101.jpg', 
        uploadedBy: 'admin_factory', 
        uploadedDate: dayjs().subtract(5, 'day').toISOString() 
    },
];

export const useDocumentManagement = () => {
    const [documents, setDocuments] = useState(mockDocuments);
    const { message } = App.useApp();

    const addDocument = useCallback((docData) => {
        const newDoc = {
            id: faker.string.uuid(),
            uploadedDate: new Date().toISOString(),
            ...docData,
        };
        setDocuments(prev => [...prev, newDoc]);
        message.success(`Đã thêm tài liệu: ${newDoc.name}`);
    }, [message]);

    const deleteDocument = useCallback((id) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        message.warning('Đã xóa tài liệu khỏi hệ thống.');
    }, [message]);

    const getDocumentsByMachine = useCallback((machineId) => {
        return documents.filter(doc => doc.machineId === machineId);
    }, [documents]);

    return {
        documents,
        addDocument,
        deleteDocument,
        getDocumentsByMachine,
    };
};