import React from 'react'
import { Link } from 'react-router-dom'


function ModelInfo() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Thông tin mô hình</h1>

      <p style={styles.text}>Trang này hiển thị thông tin về mô hình Machine Learning dùng để dự đoán khả năng sống sót của hành khách trên tàu Titanic</p>
    <div style={styles.card}>
      <h2>Mô hình sử dụng </h2>

      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={styles.left}>Tên mô hình</td>
            <td style={styles.right}>Random Forest Classifier</td>

          </tr>

          <tr>
            <td style={styles.left}>Thuật toán</td>
            <td style={styles.right}>Machine Learning</td>

          </tr>

          <tr>
            <td style={styles.left}>Dữ liệu</td>
            <td style={styles.right}>Titanic Dataset(Kaggle)</td>
          </tr>

          <tr>
            <td style={styles.left}>Số đặc trưng</td>
            <td style={styles.right}>7</td>
          </tr>

          <tr> 
            <td style={styles.left}>Accuracy</td>
            <td style={styles.right}>84%</td>
          </tr>

          <tr> 
            <td style={styles.left}>Precision</td>
            <td style={styles.right}>80%</td>
          </tr>

          
        </tbody>
      </table>
    </div>
    
    <div style={styles.note}>
      <h3>Đặc trưng đầu vào</h3>
      <ul>
        <li>Hạng vé</li>
        <li>Giới tính</li>
        <li>Tuổi</li>
        <li>Số anh chị em/ vợ chồng</li>
        <li>Số cha mẹ/ con cái</li>
        <li>Gía vé</li>
        <li>Cảng lên tàu</li>

      </ul>
    </div>

    </div>
  
  );
}

const styles = {
  container: {
    width: "900px",
    margin: "30px auto",
    background: "white",
    padding: "30px",
    border: "1px solid #cccccc"

  },

  title: {
    textAlign: "center",
    color: "#003366"
  },

  text: {
    textAlign: "center",
    color: "gray",
    marginBottom: "25px"

  },

  card: {
    border: "1px solid #cccccc",
    padding: "25px"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px"
  },

  left: {
    border: "1px solid #cccccc",
    padding: "10px",
    width: "40%",
    fontWeight: "bold"
  },

  right: {
    border:"1px solid #cccccc",
    padding: "10px"
  },

  note: {
    marginTop: "25px",
    border: "1px solid #cccccc",
    padding: "20px"
  }
}
export default ModelInfo;
