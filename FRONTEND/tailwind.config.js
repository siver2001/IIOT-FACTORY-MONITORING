/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Quét tất cả các file code trong thư mục src/ để tìm các class Tailwind
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // BẮT BUỘC: Thêm prefix để tránh xung đột với các class của Ant Design (antd)
  // Ví dụ: thay vì dùng class 'p-4', bạn sẽ dùng 'tw-p-4'
  prefix: 'tw-', 
  corePlugins: {
    // Tắt các plugin gây xung đột với Antd's base reset
    preflight: true, // Giữ lại preflight nếu muốn style cơ bản của Tailwind
  }
}