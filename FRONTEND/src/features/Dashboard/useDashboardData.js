// src/features/Dashboard/useDashboardData.js
import { useState, useEffect, useCallback } from 'react';
import socket from '../../services/socketService'; // Khởi tạo Socket.io-Client
import { message } from 'antd';

const useDashboardData = () => {
    // State chứa dữ liệu của từng máy (key: M01, M02, value: {speed, temp, status, oee})
    const [machineData, setMachineData] = useState({});
    const [realTimeLog, setRealTimeLog] = useState([]);
    const [kpiData, setKpiData] = useState({ oee: 0, mtbf: 0, runningCount: 0, totalCount: 0, newAlerts: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const updateMachineState = useCallback((newData) => {
        setMachineData(prevData => {
            const updatedData = { ...prevData, [newData.machineId]: newData };
            
            // Tính toán KPIs tổng hợp
            const totalOee = Object.values(updatedData).reduce((sum, machine) => sum + (machine.oee || 0), 0);
            const running = Object.values(updatedData).filter(m => m.status === 'RUNNING').length;

            setKpiData(prevKpi => ({
                ...prevKpi,
                oee: totalOee / Object.keys(updatedData).length,
                runningCount: running,
                totalCount: Object.keys(updatedData).length,
            }));

            return updatedData;
        });

        // Xử lý Log/Cảnh báo
        if (newData.severity && newData.severity !== 'INFO') {
            setRealTimeLog(prevLog => [{ ...newData, timestamp: new Date().toLocaleTimeString() }, ...prevLog.slice(0, 49)]); // Giới hạn 50 log
        }
    }, []);

    useEffect(() => {
        // 1. Lắng nghe sự kiện kết nối
        socket.on('connect', () => {
            message.success('Kết nối Real-time thành công!');
            setIsLoading(false);
            // Gửi tín hiệu yêu cầu dữ liệu khởi tạo
            socket.emit('requestInitialData'); 
        });

        // 2. Lắng nghe dữ liệu Real-time (được đẩy từ Backend)
        socket.on('realtime_machine_update', (data) => {
            updateMachineState(data);
        });
        
        // 3. Lắng nghe dữ liệu khởi tạo (lịch sử ngắn)
        socket.on('initial_data', (initialData) => {
            // Khởi tạo state với dữ liệu hiện tại của các máy
            initialData.forEach(updateMachineState);
            setIsLoading(false);
        });

        // 4. Xử lý lỗi
        socket.on('disconnect', () => {
            message.error('Mất kết nối Real-time, đang thử kết nối lại...');
        });

        return () => {
            // Cleanup khi component unmount
            socket.off('realtime_machine_update');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [updateMachineState]);

    // Giả định dữ liệu ban đầu
    useEffect(() => {
        setKpiData(prev => ({...prev, totalCount: 10})); // Giả định có 10 máy
    }, []);

    return { machineData, realTimeLog, kpiData, isLoading };
};

export default useDashboardData;