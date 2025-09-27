import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, ThunderboltOutlined, LoginOutlined } from '@ant-design/icons'; // Thêm icon
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom'; // Dù không dùng navigate trực tiếp, vẫn giữ để đảm bảo cấu trúc

const { Title, Text } = Typography;

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (values) => {
        setLoading(true);
        message.loading({ content: 'Đang xác thực...', key: 'loginProcess', duration: 0 }); // duration: 0 để giữ message

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
            background: 'linear-gradient(135deg, #6DD5ED 0%, #2193B0 100%)', // Một gradient xanh tươi mới
            fontFamily: 'Roboto, sans-serif', // Sử dụng font hiện đại
        }}>
            <Card
                bordered={false}
                style={{
                    width: 450, // Rộng hơn một chút
                    borderRadius: 16, // Bo tròn mềm mại hơn
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)', // Đổ bóng sâu hơn
                    background: 'rgba(255, 255, 255, 0.95)', // Card hơi trong suốt để thấy nền
                    backdropFilter: 'blur(5px)', // Hiệu ứng làm mờ nhẹ phía sau card
                    padding: 20, // Tăng padding bên trong
                }}
                headStyle={{ borderBottom: 'none', textAlign: 'center', paddingBottom: 0 }}
                bodyStyle={{ paddingTop: 0 }}
            >
                {/* Tiêu đề & Logo */}
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <ThunderboltOutlined 
                        style={{ fontSize: '60px', color: '#2193B0', marginBottom: 10 }} // Icon lớn và màu sắc tương ứng
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
                    size="large" // Kích thước input lớn hơn
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập Tên đăng nhập!' }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#2193B0' }} />} // Icon màu xanh
                            placeholder="Tên đăng nhập (admin)"
                            className="modern-input" // Thêm class để tùy chỉnh CSS
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#2193B0' }} />} // Icon màu xanh
                            placeholder="Mật khẩu (123456)"
                            className="modern-input" // Thêm class để tùy chỉnh CSS
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            icon={<LoginOutlined />} // Thêm icon vào nút
                            style={{ 
                                height: 50, // Nút cao hơn
                                fontSize: 18, // Text lớn hơn
                                fontWeight: 600,
                                background: 'linear-gradient(45deg, #2193B0 0%, #6DD5ED 100%)', // Gradient cho nút
                                border: 'none',
                                borderRadius: 8, // Bo tròn nút
                                boxShadow: '0 4px 15px rgba(33, 147, 176, 0.4)', // Đổ bóng nhẹ cho nút
                            }}
                            className="modern-button" // Thêm class để tùy chỉnh CSS
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