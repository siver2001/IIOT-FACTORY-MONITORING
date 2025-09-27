import React, { useState } from 'react';
// IMPORT App để sử dụng App.useApp() và loại bỏ message tĩnh
import { Form, Input, Button, Card, Typography, App } from 'antd'; 
import { UserOutlined, LockOutlined, ThunderboltOutlined, LoginOutlined } from '@ant-design/icons'; 
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom'; 

const { Title, Text } = Typography;

// Component nội dung chính
const LoginPageContent = () => {
    // SỬ DỤNG HOOK MESSAGE ĐỘNG (Giải quyết cảnh báo message context)
    const { message } = App.useApp(); 
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (values) => {
        setLoading(true);
        message.loading({ content: 'Đang xác thực...', key: 'loginProcess', duration: 0 }); 

        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            if (values.username === 'admin' && values.password === '123456') {
                login('mock_jwt_token_for_admin_role', 'Admin'); 
                message.success({ content: 'Đăng nhập thành công!', key: 'loginProcess', duration: 2 });
            } else {
                message.error({ content: 'Tên đăng nhập hoặc mật khẩu không đúng!', key: 'loginProcess', duration: 3 });
            }
        } catch (error) {
            message.error({ content: 'Lỗi kết nối Server.', key: 'loginProcess', duration: 3 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            // Thay đổi hình nền: Gradient sống động hơn
            background: 'linear-gradient(135deg, #6DD5ED 0%, #2193B0 100%)', 
            fontFamily: 'Roboto, sans-serif', 
        }}>
            <Card
                // FIX: Thay thế bordered={false} bằng variant="borderless"
                variant="borderless"
                style={{
                    width: 450, 
                    borderRadius: 16, 
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)', 
                    background: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(5px)', 
                    padding: 20, 
                }}
                // FIX: Thay thế headStyle và bodyStyle bằng styles prop
                styles={{ 
                    header: { borderBottom: 'none', textAlign: 'center', paddingBottom: 0 },
                    body: { paddingTop: 0 }
                }}
            >
                {/* Tiêu đề & Logo */}
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <ThunderboltOutlined 
                        style={{ fontSize: '60px', color: '#2193B0', marginBottom: 10 }} 
                    />
                    <Title level={2} style={{ 
                        margin: 0, 
                        color: '#333', 
                        fontWeight: 700,
                        letterSpacing: '0.5px'
                    }}>
                        ĐĂNG NHẬP HỆ THỐNG
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16, color: '#666' }}>
                        Chào mừng bạn trở lại!
                    </Text>
                </div>

                {/* Form Đăng nhập */}
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
                            prefix={<UserOutlined style={{ color: '#2193B0' }} />} 
                            placeholder="Tên đăng nhập (admin)"
                            className="modern-input" 
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#2193B0' }} />} 
                            placeholder="Mật khẩu (123456)"
                            className="modern-input" 
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            icon={<LoginOutlined />} 
                            style={{ 
                                height: 50, 
                                fontSize: 18, 
                                fontWeight: 600,
                                background: 'linear-gradient(45deg, #2193B0 0%, #6DD5ED 100%)', 
                                border: 'none',
                                borderRadius: 8, 
                                boxShadow: '0 4px 15px rgba(33, 147, 176, 0.4)', 
                            }}
                            className="modern-button" 
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

// Component Wrapper sử dụng App của Ant Design
const LoginPage = () => (
    <App>
        <LoginPageContent />
    </App>
);

export default LoginPage;