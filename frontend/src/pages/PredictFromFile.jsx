import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function PredictFromFile() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Hàm xử lý khi người dùng chọn và upload file CSV
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length <= 1) {
        alert("File không có dữ liệu hoặc sai định dạng!");
        return;
      }

      setLoading(true);
      const outputList = [];

      // Vòng lặp
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns.length < 7) continue;

        // Ép kiểu dữ liệu
        const record = {
          Pclass: parseInt(columns[0]),
          Sex: columns[1],
          Age: Number(columns[2]) || 25,
          SibSp: parseInt(columns[3]) || 0,
          Parch: parseInt(columns[4]) || 0,
          Fare: Number(columns[5]) || 15.0,
          Embarked: columns[6]
        };

        try {
          // Gọi API POST /predict tuần tự
          const res = await fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
          });
          const serverRes = await res.json();
          
          // Thêm kết quả vào mảng tạm kèm chung với data gốc để render ra bảng
          outputList.push({ 
            ...record, 
            statusText: Number(serverRes.prediction) === 1 ? 'Sống sót' : 'Không sống sót' 
          });
        } catch (err) {
          outputList.push({ ...record, statusText: 'Lỗi kết nối' });
        }
      }

      setResults(outputList);
      setLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div style={styles.container}>
      {/* Tiêu đề */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#08060d' }}>Dự đoán hàng loạt từ File CSV</h1>
        <p style={{ color: '#666' }}>Tải lên file dữ liệu hành khách để hệ thống tự động quét dữ liệu lớn qua API.</p>
      </div>
      
      {/* Vùng chọn File */}
      <div style={styles.uploadArea}>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          disabled={loading} 
          style={styles.fileInput} 
        />
        {loading && <p style={styles.loadingText}>Đang xử lý dữ liệu và kết nối tuần tự...</p>}
      </div>

      {/* Bảng kết quả hiển thị */}
      {results.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: '30px' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Hạng vé</th>
                <th style={styles.th}>Giới tính</th>
                <th style={styles.th}>Tuổi</th>
                <th style={styles.th}>Giá vé</th>
                <th style={styles.th}>Kết quả dự đoán</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={index} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>Hạng {item.Pclass}</td>
                  <td style={styles.td}>{item.Sex === 'male' ? 'Nam' : 'Nữ'}</td>
                  <td style={styles.td}>{item.Age}</td>
                  <td style={styles.td}>${Number(item.Fare).toFixed(2)}</td>
                  <td style={{ 
                    ...styles.td, 
                    fontWeight: 'bold', 
                    color: item.statusText === 'Sống sót' ? 'green' : item.statusText === 'Lỗi kết nối' ? 'orange' : 'red' 
                  }}>
                    {item.statusText}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Thẻ Link có sẵn để quay lại */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link to="/" style={styles.backLink}>➔ Quay lại Trang chủ</Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  uploadArea: {
    border: '2px dashed #aa3bff',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: '#fbf7ff',
    cursor: 'pointer'
  },
  fileInput: {
    fontSize: '16px',
    cursor: 'pointer'
  },
  loadingText: {
    color: '#aa3bff',
    fontWeight: 'bold',
    marginTop: '15px',
    fontSize: '14px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
  },
  thRow: {
    backgroundColor: '#aa3bff'
  },
  th: {
    color: 'white',
    padding: '12px',
    textAlign: 'center',
    fontWeight: '600'
  },
  td: {
    padding: '12px',
    textAlign: 'center',
    borderBottom: '1px solid #e1e1e1',
    color: '#333'
  },
  trEven: { backgroundColor: '#ffffff' },
  trOdd: { backgroundColor: '#fdfaff' },
  backLink: {
    color: '#aa3bff',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '15px'
  }
};

export default PredictFromFile;
