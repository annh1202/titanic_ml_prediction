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

  // State lưu kết quả dự đoán
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

      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          Pclass: Number(formData.Pclass),
          Sex: formData.Sex,
          Age: Number(formData.Age),
          SibSp: Number(formData.SibSp),
          Parch: Number(formData.Parch),
          Fare: Number(formData.Fare),
          Embarked: formData.Embarked
        })
      });

      const data = await response.json();

      console.log("Dữ liệu thô từ FastAPI trả về:", data);

      setPrediction({
        result: Number(data.prediction),
        confidence: Number(data.confidence)
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

      {/* Kết quả */}
      {
        prediction !== null && (
          <div style={styles.resultBox}>
            <h2>
              Kết quả:
              {
                Number(prediction.result) === 1
                  ? ' Sống sót'
                  : ' Không sống sót'
              }
            </h2>
            <p style={styles.confidenceText}>
              Độ tự tin: <strong>{ (prediction.confidence * 100).toFixed(2) }%</strong>
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
    marginBottom: '30px'
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
  }

};

export default Predict;