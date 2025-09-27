import React from 'react';
import { Typography, Space, Divider, Table, Button, Input, Form, Popconfirm, Statistic, Row, Col, Card } from 'antd';
import { SettingOutlined, CheckOutlined, CloseOutlined, WifiOutlined, EditOutlined } from '@ant-design/icons';
import { useDeviceConfig } from './useDeviceConfig';

const { Title } = Typography;

const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}) => {
    const inputNode = inputType === 'number' ? <Input type="number" /> : <Input />;
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        { required: true, message: `Vui lòng nhập ${title}!`, },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};


const DeviceConfigPage = () => {
    const [form] = Form.useForm();
    const { devices, editingKey, totalTags, startEditing, cancelEditing, saveDevice } = useDeviceConfig();

    const isEditing = (record) => record.key === editingKey;

    const handleSave = async (key) => {
        try {
            const row = await form.validateFields();
            saveDevice(key, row);
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };
    
    const columns = [
        { title: 'Key/ID', dataIndex: 'key', width: '10%' },
        { title: 'Tên Thiết bị', dataIndex: 'name', width: '30%', editable: true },
        { title: 'Vị trí', dataIndex: 'location', width: '30%', editable: true },
        { title: 'Số lượng Tags', dataIndex: 'tagCount', width: '15%', editable: false },
        {
            title: 'Actions',
            dataIndex: 'actions',
            width: '15%',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space>
                        <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleSave(record.key)}>Lưu</Button>
                        <Popconfirm title="Chắc chắn hủy?" onConfirm={cancelEditing}>
                            <Button size="small" icon={<CloseOutlined />} danger>Hủy</Button>
                        </Popconfirm>
                    </Space>
                ) : (
                    <Button size="small" icon={<EditOutlined />} onClick={() => startEditing(record.key)} disabled={editingKey !== ''} />
                );
            },
        },
    ];

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: col.dataIndex === 'tagCount' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (
        <Space direction="vertical" size={24} style={{ display: 'flex' }}>
            <Title level={3}><SettingOutlined /> Cấu hình Thiết bị & Tags (Mock)</Title>
            <Divider orientation="left">Tổng quan Hệ thống</Divider>

            <Row gutter={16}>
                <Col span={8}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #1890ff' }}>
                        <Statistic title="Tổng số Thiết bị" value={devices.length} prefix={<WifiOutlined />} />
                    </Card>
                </Col>
                 <Col span={8}>
                    <Card variant="borderless" style={{ borderLeft: '4px solid #52c41a' }}>
                        <Statistic title="Tổng số Tags (Điểm dữ liệu)" value={totalTags} suffix=" tags" />
                    </Card>
                </Col>
            </Row>
            
            

            <Divider orientation="left">Danh sách Thiết bị</Divider>

            <Form form={form} component={false}>
                <Table
                    components={{
                        body: { cell: EditableCell, },
                    }}
                    bordered
                    dataSource={devices}
                    columns={mergedColumns}
                    rowClassName="editable-row"
                    pagination={{ pageSize: 10 }}
                    rowKey="key"
                />
            </Form>
        </Space>
    );
};

export default DeviceConfigPage;