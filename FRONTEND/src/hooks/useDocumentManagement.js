// FRONTEND/src/hooks/useDocumentManagement.js

import { useState, useCallback } from 'react';
import { faker } from '@faker-js/faker';
import { App } from 'antd';
import dayjs from 'dayjs';

/**
 * Mock data tài liệu kỹ thuật của máy (Schema: document)
 */
const initialDocuments = [
    { id: 'DOC-1001', machineId: 'M-CNC-101', name: 'Sách Hướng dẫn Vận hành (PDF).pdf', type: 'PDF', link: 'https://mocklink.com/cnc/manual.pdf', uploadedDate: dayjs().subtract(60, 'day').format('YYYY-MM-DD'), uploadedBy: 'Admin' },
    { id: 'DOC-1002', machineId: 'M-CNC-101', name: 'Bản vẽ Điện tử (E-001).dwg', type: 'Diagram', link: 'https://mocklink.com/cnc/diagram.dwg', uploadedDate: dayjs().subtract(15, 'day').format('YYYY-MM-DD'), uploadedBy: 'Manager A' },
    { id: 'DOC-1003', machineId: 'M-LASER-102', name: 'Checklist Bảo trì Qúy (Q3).docx', type: 'Other', link: 'https://mocklink.com/laser/checklist.docx', uploadedDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'), uploadedBy: 'Supervisor B' },
    { id: 'DOC-1004', machineId: 'M-PRESS-103', name: 'Ảnh Chụp Tấm Biển Tên.jpg', type: 'Image', link: 'https://mocklink.com/press/image.jpg', uploadedDate: dayjs().subtract(10, 'day').format('YYYY-MM-DD'), uploadedBy: 'Admin' },
];

export const useDocumentManagement = () => { 
    const { message } = App.useApp();
    const [documents, setDocuments] = useState(initialDocuments);
    
    // HÀM: Lọc tài liệu theo Machine ID
    const getDocumentsByMachine = useCallback((id) => {
        return documents.filter(doc => doc.machineId === id);
    }, [documents]);


    /**
     * THAY ĐỔI: Mô phỏng việc tải lên tệp (Lưu tên tệp và metadata)
     * @param {object} docData - Bao gồm machineId, name (tên tệp), type, uploadedBy
     */
    const addDocument = useCallback((docData) => {
        const newDoc = {
            id: `DOC-${faker.number.int({ min: 1000, max: 9999 })}`,
            // Giả định một link cố định để vẫn có thể nhấn xem trong bảng
            link: `https://mocklink.com/assets/${docData.name}`, 
            ...docData, 
            uploadedDate: dayjs().format('YYYY-MM-DD'),
        };
        setDocuments(prev => [...prev, newDoc]);
        message.success(`Đã thêm tài liệu '${newDoc.name}' thành công.`);
    }, [message]);

    const deleteDocument = useCallback((docId) => {
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
        message.success(`Đã xóa tài liệu ${docId}.`);
    }, [message]);
    
    const downloadDocument = useCallback((docName) => {
        message.info(`Đang mô phỏng tải xuống tệp: ${docName}`);
    }, [message]);

    return {
        getDocumentsByMachine, 
        addDocument,
        deleteDocument,
        downloadDocument,
    };
};