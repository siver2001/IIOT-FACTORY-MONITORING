import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // ⚠️ Nếu Backend của bạn chạy trên cổng khác (ví dụ: 8080), hãy thay thế target
    port: 5173, 
    proxy: {
      // Chuyển tiếp các request bắt đầu bằng '/api' sang Backend Server
      '/api': {
        target: 'http://localhost:3000', // Cổng mặc định của Express Backend
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '/api'), // Có thể cần nếu bạn muốn rewrite path
      },
      // Nếu bạn có WebSocket cho Real-time Data, cần proxy luôn:
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});