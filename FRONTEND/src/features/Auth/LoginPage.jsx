// src/features/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (values) => {
        setLoading(true);
        message.loading({ content: 'Đang xác thực...', key: 'loginProcess' });

        // *************** PHẦN GIẢ LẬP GỌI API ĐĂNG NHẬP ***************
        // Thay thế logic này bằng việc gọi API thực tế đến Backend
        try {
            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            // Kiểm tra (ví dụ: user=admin, pass=123456)
            if (values.username === 'admin' && values.password === '123456') {
                // Giả lập lưu JWT token và thông tin user
                localStorage.setItem('jwtToken', 'mock_jwt_token_for_admin_role'); 
                localStorage.setItem('userRole', 'Admin');
                
                message.success({ content: 'Đăng nhập thành công!', key: 'loginProcess', duration: 2 });
                navigate('/dashboard', { replace: true });
            } else {
                message.error({ content: 'Tên đăng nhập hoặc mật khẩu không đúng!', key: 'loginProcess', duration: 3 });
            }
        } catch (error) {
            message.error({ content: 'Lỗi kết nối Server.', key: 'loginProcess', duration: 3 });
        } finally {
            setLoading(false);
        }
        // *************************************************************
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #1f2a38 0%, #3a4a58 100%)' // Background tối màu chuyên nghiệp
        }}>
            <Card 
                bordered={false}
                style={{ width: 400, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
                headStyle={{ borderBottom: 'none', textAlign: 'center', paddingBottom: 0 }}
                bodyStyle={{ paddingTop: 0 }}
            >
                <Title level={3} style={{ textAlign: 'center', marginBottom: 24, color: '#1890ff' }}>
                    HỆ THỐNG IIOT FACTORY
                </Title>
                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={handleLogin}
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập Tên đăng nhập!' }]}
                    >
                        <Input 
                            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                            placeholder="Tên đăng nhập" 
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Mật khẩu"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block 
                            loading={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;