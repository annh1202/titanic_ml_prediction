import React, { useState } from 'react';
import { predictOne } from '../api/titanicApi';
import { FaUser, FaTicketAlt, FaVenusMars, FaChild, FaUsers, FaMoneyBillWave, FaMapMarkerAlt } from 'react-icons/fa';

function Predict() {
  const [formData, setFormData] = useState({
    Pclass: '',
    Sex: '',
    Age: '',
    SibSp: '',
    Parch: '',
    Fare: '',
    Embarked: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

      console.log("Dữ liệu thô từ FastAPI trả về:", data);

      setPrediction({
        result: data.survived,
        confidence: data.probability,
        message: data.message
      });

      const localHistory = JSON.parse(localStorage.getItem('titanic_history') || '[]');
      const newHistoryItem = {
          name: 'Ẩn danh',
          pclass: formData.Pclass,
          sex: formData.Sex === 'male' ? 'Nam' : 'Nữ',
          age: formData.Age,
          result: data.survived === 1 ? "Sống sót" : "Không sống sót",
          date: new Date().toLocaleString()
      };
      localStorage.setItem('titanic_history', JSON.stringify([newHistoryItem, ...localHistory]));
      
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối đến FastAPI. Vui lòng kiểm tra console.');
    }

    setLoading(false);
  };

  return (
    <div className="container page-wrapper page-center">
      <div className="form-container glass-panel" style={{ width: '100%' }}>
        <h1 className="form-title">Dự Đoán Sống Sót</h1>

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Pclass */}
          <div className="form-group">
            <label className="form-label"><FaTicketAlt /> Hạng vé</label>
            <select
              name="Pclass"
              value={formData.Pclass}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">-- Chọn hạng vé --</option>
              <option value="1">Hạng 1 (Thương gia)</option>
              <option value="2">Hạng 2 (Phổ thông đặc biệt)</option>
              <option value="3">Hạng 3 (Phổ thông)</option>
            </select>
          </div>

          {/* Sex */}
          <div className="form-group">
            <label className="form-label"><FaVenusMars /> Giới tính</label>
            <select
              name="Sex"
              value={formData.Sex}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          {/* Age */}
          <div className="form-group">
            <label className="form-label"><FaUser /> Tuổi</label>
            <input
              type="number"
              name="Age"
              value={formData.Age}
              onChange={handleChange}
              required
              min="0"
              max="120"
              step="0.1"
              placeholder="VD: 25"
              className="form-control"
            />
          </div>

          {/* SibSp */}
          <div className="form-group">
            <label className="form-label"><FaUsers /> Số anh chị em / Vợ chồng</label>
            <input
              type="number"
              name="SibSp"
              value={formData.SibSp}
              onChange={handleChange}
              required
              min="0"
              placeholder="VD: 1"
              className="form-control"
            />
          </div>

          {/* Parch */}
          <div className="form-group">
            <label className="form-label"><FaChild /> Số cha mẹ / Con cái</label>
            <input
              type="number"
              name="Parch"
              value={formData.Parch}
              onChange={handleChange}
              required
              min="0"
              placeholder="VD: 0"
              className="form-control"
            />
          </div>

          {/* Fare */}
          <div className="form-group">
            <label className="form-label"><FaMoneyBillWave /> Giá vé</label>
            <input
              type="number"
              step="0.01"
              name="Fare"
              value={formData.Fare}
              onChange={handleChange}
              required
              min="0"
              placeholder="VD: 30.5"
              className="form-control"
            />
          </div>

          {/* Embarked */}
          <div className="form-group">
            <label className="form-label"><FaMapMarkerAlt /> Cảng lên tàu</label>
            <select
              name="Embarked"
              value={formData.Embarked}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">-- Chọn cảng --</option>
              <option value="C">Cherbourg (C)</option>
              <option value="Q">Queenstown (Q)</option>
              <option value="S">Southampton (S)</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang phân tích...' : 'Dự Đoán Ngay'}
            </button>
          </div>
        </form>

        {prediction && (
          <div className={`result-box ${prediction.result === 1 ? 'survived' : 'perished'}`}>
            <h2 className="result-title">
              {prediction.result === 1 ? 'Khả năng sống sót cao!' : 'Khả năng không sống sót'}
            </h2>
            <p className="result-confidence">
              Độ tự tin của mô hình: <strong>{(prediction.confidence * 100).toFixed(2)}%</strong>
            </p>
          </div>
        )}
      </div>
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
