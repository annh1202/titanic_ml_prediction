import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  // Danh sách 4 chức năng chính
  const features = [
    {
      title: 'Dự Đoán Trực Tuyến',
      description: 'Nhập trực tiếp các thông số đầu vào từ form để nhận kết quả dự đoán từ mô hình AI ngay lập tức.',
      path: '/predict',
      color: '#aa3bff'
    },
    {
      title: 'Thông Tin Mô Hình',
      description: 'Xem chi tiết cấu trúc mô hình, các tham số huấn luyện (hyperparameters), độ chính xác (Accuracy, F1-Score) và biểu đồ đánh giá.',
      path: '/model_info',
      color: '#00b4d8'
    },
    {
      title: 'Lịch Sử Dự Đoán',
      description: 'Tra cứu, lọc và xem lại toàn bộ các lượt dự đoán đã thực hiện trước đây cùng với thống kê xu hướng.',
      path: '/history',
      color: '#ffb703'
    },
    {
      title: 'Dự Đoán Hàng Loạt',
      description: 'Tải lên tệp dữ liệu (CSV, Excel) chứa danh sách nhiều bản ghi để hệ thống xử lý dữ liệu lớn và trả file kết quả.',
      path: '/predict-from-file',
      color: '#2a9d8f'
    }
  ];

  return (
    <div style={styles.container}>
      {/* 1. Phần Giới thiệu chung */}
      <header style={styles.hero}>
        <h1 style={styles.title}>Hệ Thống Phân Tích & Dự Đoán Thông Minh</h1>
        <p style={styles.subtitle}>
          Nền tảng tích hợp các mô hình Machine Learning mạnh mẽ giúp tối ưu hóa dữ liệu và hỗ trợ ra quyết định chính xác.
        </p>
      </header>

      {/* 2. Phần lưới hiển thị 4 chức năng */}
      <div style={styles.grid}>
        {features.map((item, index) => (
          <div key={index} style={styles.card}>
            {/* Thanh màu nhỏ ở đầu mỗi thẻ để phân biệt chức năng */}
            <div style={{ ...styles.topBar, backgroundColor: item.color }} />

            <h3 style={styles.cardTitle}>{item.title}</h3>
            <p style={styles.cardDescription}>{item.description}</p>

            <button
              style={{ ...styles.button, backgroundColor: item.color }}
              onClick={() => navigate(item.path)}
            >
              Khám phá ngay
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hệ thống CSS Inline
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  hero: {
    textAlign: 'center',
    marginBottom: '60px'
  },
  title: {
    fontSize: '32px',
    color: '#7e22ce',
    marginBottom: '15px',
    fontWeight: '800',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '25px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #e1e1e1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden' // Để bo góc phần thanh màu topBar
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px'
  },
  cardTitle: {
    fontSize: '18px',
    color: '#08060d',
    margin: '10px 0 12px 0',
    fontWeight: '700'
  },
  cardDescription: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '25px',
    flexGrow: 1
  },
  button: {
    padding: '10px 18px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    width: '100%',
    textAlign: 'center'
  }
};

export default Home;