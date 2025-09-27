import { messageInstance } from '../components/GlobalMessageProvider';

/**
 * Custom Fetch wrapper với xử lý lỗi toàn cục.
 * @param {string} url - API endpoint (ví dụ: /api/users)
 * @param {object} options - Fetch options (method, headers, body)
 * @param {boolean} authRequired - Có cần gửi JWT token không
 */
const apiFetch = async (url, options = {}, authRequired = true) => {
    const token = localStorage.getItem('jwtToken');
    const headers = {
        'Content-Type': 'application/json',
        ...(authRequired && token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };
    
    const finalOptions = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            // =================================================================
            // INTERCEPTOR LOGIC
            // =================================================================
            const errorData = await response.text();
            const status = response.status;
            
            // Lấy dynamic message instance (fallback về console nếu chưa load)
            const msg = messageInstance.message || console; 
            
            if (status === 401 || status === 403) {
                // Lỗi Xác thực hoặc Phân quyền (Phiên hết hạn)
                msg.error(`Phiên hết hạn (${status}). Đang chuyển hướng đăng nhập...`, 5);
                localStorage.removeItem('jwtToken');
                setTimeout(() => {
                    window.location.href = '/login'; 
                }, 1500);
                
            } else if (status >= 500) {
                // Lỗi Server
                msg.error(`Lỗi hệ thống: Không thể kết nối hoặc server lỗi (${status}).`, 5);
            } else if (status >= 400) {
                // Lỗi Client (Bad Request, validation...)
                // Cho phép component bắt lỗi này để hiển thị lỗi validation chi tiết hơn
                msg.warning(`Lỗi yêu cầu: ${errorData.substring(0, 80)}...`, 5);
            }
            
            throw new Error(`API Error: Status ${status}, Body: ${errorData}`);
        }

        // Xử lý phản hồi thành công
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }
        return {};

    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
             (messageInstance.message || console).error("Lỗi mạng: Không thể kết nối tới Backend (localhost:3000).", 5);
        }
        throw error; // Tái ném lỗi để component có thể xử lý các trường hợp ngoại lệ khác
    }
};

export default apiFetch;