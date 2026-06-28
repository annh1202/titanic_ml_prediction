import React, { useState } from 'react';

function Predict() {

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    Pclass: '',
    Sex: '',
    Age: '',
    SibSp: '',
    Parch: '',
    Fare: '',
    Embarked: ''
  });

  // State lưu kết quả dự đoán (gồm survived, probability, và message)
  const [prediction, setPrediction] = useState(null);

  // State loading
  const [loading, setLoading] = useState(false);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Gửi dữ liệu sang FastAPI
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pclass: Number(formData.Pclass),
          sex: formData.Sex,
          age: Number(formData.Age),
          sibsp: Number(formData.SibSp),
          parch: Number(formData.Parch),
          fare: Number(formData.Fare),
          embarked: formData.Embarked
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Chi tiết lỗi từ FastAPI:", data);
        alert("Có lỗi xảy ra, kiểm tra log F12 nhé!");
        setLoading(false);
        return;
      }

      console.log("Dữ liệu thô thành công từ FastAPI:", data);

      setPrediction({
        survived: Number(data.survived),
        probability: Number(data.probability),
        message: data.message
      });

    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối đến FastAPI');
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>Dự đoán sống sót Titanic</h1>

      <form onSubmit={handleSubmit} style={styles.form}>

        {/* Pclass */}
        <div style={styles.formGroup}>
          <label>Hạng vé</label>
          <select
            name="Pclass"
            value={formData.Pclass}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">-- Chọn hạng vé --</option>
            <option value="1">Hạng 1</option>
            <option value="2">Hạng 2</option>
            <option value="3">Hạng 3</option>
          </select>
        </div>

        {/* Sex */}
        <div style={styles.formGroup}>
          <label>Giới tính</label>
          <select
            name="Sex"
            value={formData.Sex}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">-- Chọn giới tính --</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
        </div>

        {/* Age */}
        <div style={styles.formGroup}>
          <label>Tuổi</label>
          <input
            type="number"
            name="Age"
            value={formData.Age}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        {/* SibSp */}
        <div style={styles.formGroup}>
          <label>Số anh chị em/vợ chồng đi cùng</label>
          <input
            type="number"
            name="SibSp"
            value={formData.SibSp}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        {/* Parch */}
        <div style={styles.formGroup}>
          <label>Số cha mẹ/con cái đi cùng</label>
          <input
            type="number"
            name="Parch"
            value={formData.Parch}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        {/* Fare */}
        <div style={styles.formGroup}>
          <label>Giá vé</label>
          <input
            type="number"
            step="1"
            name="Fare"
            value={formData.Fare}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        {/* Embarked */}
        <div style={styles.formGroup}>
          <label>Cảng lên tàu</label>
          <select
            name="Embarked"
            value={formData.Embarked}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">-- Chọn cảng --</option>
            <option value="C">Cherbourg</option>
            <option value="Q">Queenstown</option>
            <option value="S">Southampton</option>
          </select>
        </div>

        <button type="submit" style={{...styles.button, gridColumn: 'span 2'}}>
          {loading ? 'Đang dự đoán...' : 'Dự đoán'}
        </button>

      </form>

      {/* Kết quả hiển thị */}
      {
        prediction !== null && (
          <div style={styles.resultBox}>
            <h2>
              Kết quả: {prediction.message} {/* Tận dụng chuỗi chữ từ Backend */}
            </h2>
            <p style={styles.confidenceText}>
              Độ tự tin: <strong>{ (prediction.probability * 100).toFixed(2) }%</strong>
            </p>
          </div>
        )
      }

    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  title: {
    textAlign: 'center',
    color: '#7e22ce',
    marginBottom: '40px'
  },
  form: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #cccccc',
    fontSize: '16px'
  },
  button: {
    padding: '14px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#aa3bff',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer'
  },
  resultBox: {
    marginTop: '30px',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#f3e8ff',
    textAlign: 'center'
  },
  confidenceText: {
    fontSize: '16px',
    color: '#333333'
  }
};

export default Predict;