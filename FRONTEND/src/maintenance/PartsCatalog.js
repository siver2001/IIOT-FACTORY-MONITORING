// FRONTEND/src/maintenance/PartsCatalog.js

export const PARTS_CATALOG = [
  { id: 'P001', name: 'Vòng bi SKF 6205', unit: 'Cái', price: 15.5 }, // Đã có price
  { id: 'P002', name: 'Dầu bôi trơn ISO VG 46', unit: 'Lít', price: 20.0 },
  { id: 'P003', name: 'Bộ lọc khí nén S-100', unit: 'Bộ', price: 50.0 },
  { id: 'P004', name: 'Đai truyền B-40', unit: 'Cái', price: 12.0 },
  { id: 'P005', name: 'Cảm biến nhiệt độ PT100', unit: 'Cái', price: 75.0 },
  { id: 'P006', name: 'Bộ gioăng làm kín', unit: 'Bộ', price: 30.0 },
];

export const getPartPrice = (partId) => {
  const part = PARTS_CATALOG.find(p => p.id === partId);
  return part ? part.price : 0;
};

// Hàm lấy chi tiết vật tư (MỚI)
export const getPartDetail = (partId) => {
  return PARTS_CATALOG.find(p => p.id === partId);
};