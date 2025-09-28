// FRONTEND/src/maintenance/MaintenanceCalendarPage.jsx
import React, { useState, useMemo } from 'react';
import { Calendar, Badge, Modal, Tag, Descriptions, Button } from 'antd';
import { useWorkOrder, WORK_ORDER_STATUS } from './useWorkOrder';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const MaintenanceCalendarPage = () => {
    const { workOrders } = useWorkOrder();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWOs, setSelectedWOs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    
    // Gom nhóm WO theo ngày
    const woByDate = useMemo(() => {
        const map = new Map();
        workOrders.forEach(wo => {
            const dateKey = dayjs(wo.dueDate).format('YYYY-MM-DD');
            // Chỉ hiển thị các WO PM và WO CM chưa hoàn thành trên lịch
            if (wo.type === 'PM' || wo.status !== WORK_ORDER_STATUS.COMPLETED) {
                if (!map.has(dateKey)) {
                    map.set(dateKey, []);
                }
                map.get(dateKey).push(wo);
            }
        });
        return map;
    }, [workOrders]);

    // Hàm tùy chỉnh hiển thị nội dung ô ngày
    const dateCellRender = (value) => {
        const dateKey = value.format('YYYY-MM-DD');
        const listData = woByDate.get(dateKey) || [];

        return (
            <ul className="tw-list-none tw-m-0 tw-p-0">
                {listData.slice(0, 3).map((item) => (
                    <li key={item.id} className="tw-mt-1">
                        <Badge color={item.type === 'PM' ? 'cyan' : 'red'} text={`${item.id} - ${item.machineCode}`} />
                    </li>
                ))}
                {listData.length > 3 && <li className="tw-text-xs tw-text-gray-500">+{listData.length - 3} WO khác</li>}
            </ul>
        );
    };

    // Hàm xử lý sự kiện khi click vào một ngày
    const onSelect = (value) => {
        const dateKey = value.format('YYYY-MM-DD');
        const WOs = woByDate.get(dateKey) || [];
        
        setSelectedDate(value);
        if (WOs.length > 0) {
            setSelectedWOs(WOs);
            setIsModalOpen(true);
        } else {
            setSelectedWOs([]);
            setIsModalOpen(false);
        }
    };

    const statusTag = (status) => {
        let color = 'default';
        if (status === WORK_ORDER_STATUS.PENDING) color = 'volcano';
        else if (status === WORK_ORDER_STATUS.IN_PROGRESS) color = 'blue';
        else if (status === WORK_ORDER_STATUS.COMPLETED) color = 'green';
        return <Tag color={color}>{status}</Tag>;
    };

    return (
        <div className="tw-p-6">
            <h1 className="tw-text-2xl tw-font-bold tw-mb-4 tw-text-gray-800"><CalendarOutlined /> Lịch Bảo trì & Kế hoạch</h1>
            
            <div className="tw-shadow-xl tw-p-4 tw-bg-white tw-rounded-lg">
                <Calendar 
                    dateCellRender={dateCellRender} 
                    onSelect={onSelect}
                />
            </div>

            <Modal
                title={`Công việc cần làm (Hạn chót: ${selectedDate.format('DD/MM/YYYY')})`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)}>Đóng</Button>
                ]}
                width={800}
            >
                <div className="tw-max-h-96 tw-overflow-y-auto tw-space-y-4">
                    {selectedWOs.map(wo => (
                        <Descriptions 
                            key={wo.id} 
                            title={
                                <div className='tw-flex tw-justify-between tw-items-center'>
                                    <span className="tw-font-bold">{wo.id}: {wo.title}</span>
                                    {statusTag(wo.status)}
                                </div>
                            } 
                            bordered 
                            column={{ xs: 1, sm: 2, md: 3 }}
                            className="tw-shadow-sm"
                        >
                            <Descriptions.Item label="Mã Máy">{wo.machineCode}</Descriptions.Item>
                            <Descriptions.Item label="Loại"><Tag color={wo.type === 'PM' ? 'cyan' : 'red'}>{wo.type}</Tag></Descriptions.Item>
                            <Descriptions.Item label="Người Gán">{wo.assignedTo || 'Chưa gán'}</Descriptions.Item>
                            <Descriptions.Item label="Hạn chót">{dayjs(wo.dueDate).format('HH:mm DD/MM')}</Descriptions.Item>
                            <Descriptions.Item label="Ưu tiên">{wo.priority}</Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">{dayjs(wo.createdAt).format('DD/MM/YYYY')}</Descriptions.Item>
                            <Descriptions.Item label="Mô tả" span={3}>{wo.description}</Descriptions.Item>
                        </Descriptions>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default MaintenanceCalendarPage;