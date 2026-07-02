import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaRobot, FaHistory, FaFileUpload } from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Dự Đoán Trực Tuyến',
      description: 'Nhập trực tiếp các thông số đầu vào từ form để nhận kết quả dự đoán từ mô hình AI ngay lập tức.',
      path: '/predict',
      color: 'var(--primary)',
      icon: <FaChartLine />
    },
    {
      title: 'Thông Tin Mô Hình',
      description: 'Xem chi tiết cấu trúc mô hình, các tham số huấn luyện (hyperparameters), độ chính xác và biểu đồ đánh giá.',
      path: '/model-info',
      color: 'var(--info)',
      icon: <FaRobot />
    },
    {
      title: 'Lịch Sử Dự Đoán',
      description: 'Tra cứu, lọc và xem lại toàn bộ các lượt dự đoán đã thực hiện trước đây cùng với thống kê xu hướng.',
      path: '/history',
      color: 'var(--warning)',
      icon: <FaHistory />
    },
    {
      title: 'Dự Đoán Hàng Loạt',
      description: 'Tải lên tệp dữ liệu (CSV, Excel) chứa danh sách nhiều bản ghi để hệ thống xử lý dữ liệu lớn và trả kết quả.',
      path: '/predict-from-file',
      color: 'var(--success)',
      icon: <FaFileUpload />
    }
  ];

  return (
    <div className="container page-wrapper">
      <header className="hero">
        <h1 className="hero-title">Hệ Thống Dự Đoán Thông Minh</h1>
        <p className="hero-subtitle">
          Nền tảng tích hợp Machine Learning mạnh mẽ giúp phân tích và dự đoán khả năng sống sót của hành khách trên tàu Titanic.
        </p>
      </header>

      <div className="feature-grid">
        {features.map((item, index) => (
          <div 
            key={index} 
            className="feature-card glass-panel" 
            style={{ '--card-color': item.color }}
          >
            <div className="feature-card-icon">
              {item.icon}
            </div>
            <h3 className="feature-title">{item.title}</h3>
            <p className="feature-desc">{item.description}</p>
            <button
              className="btn btn-primary"
              style={{ '--card-color': item.color }}
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

export default Home;