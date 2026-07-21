import React, { useState } from 'react';
import { predictBatch } from '../api/titanicApi';
import { FaPlus, FaTrash, FaDownload, FaUsers } from 'react-icons/fa';

function BatchPage() {
  const emptyPassenger = {
    pclass: '',
    sex: '',
    age: '',
    sibsp: '',
    parch: '',
    fare: '',
    embarked: ''
  };

  const [passengers, setPassengers] = useState([{ ...emptyPassenger }]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddPassenger = () => {
    setPassengers([...passengers, { ...emptyPassenger }]);
  };

  const handleRemovePassenger = (index) => {
    const newPassengers = [...passengers];
    newPassengers.splice(index, 1);
    setPassengers(newPassengers);
  };

  const handleChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const handleSubmit = async () => {
    // Validate
    for (let p of passengers) {
      if (!p.pclass || !p.sex || p.age === '' || p.sibsp === '' || p.parch === '' || p.fare === '' || !p.embarked) {
        alert("Vui lòng điền đầy đủ thông tin cho tất cả hành khách.");
        return;
      }
    }

    setLoading(true);
    setResults(null);
    try {
      // API expects pclass, age, sibsp, parch, fare as numbers
      const formattedPassengers = passengers.map(p => ({
        pclass: Number(p.pclass),
        sex: p.sex,
        age: Number(p.age),
        sibsp: Number(p.sibsp),
        parch: Number(p.parch),
        fare: Number(p.fare),
        embarked: p.embarked
      }));

      const response = await predictBatch(formattedPassengers);
      if (response.data && response.data.results) {
        setResults(response.data.results);
      } else {
        console.error("API response missing results:", response.data);
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối đến server.');
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (!results) return;

    // Headers
    const headers = ['Passenger_Index', 'Pclass', 'Sex', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked', 'Survived_Prediction', 'Probability'];
    
    // Rows
    const rows = results.map((res, i) => {
      const p = passengers[i];
      return [
        i + 1,
        p.pclass,
        p.sex,
        p.age,
        p.sibsp,
        p.parch,
        p.fare,
        p.embarked,
        res.survived,
        res.probability
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "batch_predictions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container page-wrapper">
      <div className="glass-panel" style={{ padding: '30px', margin: '20px auto', maxWidth: '1000px' }}>
        <h1 className="form-title" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <FaUsers style={{ marginRight: '10px' }} />
          Dự Đoán Nhiều Người (Manual Batch)
        </h1>

        <div className="table-responsive" style={{ overflowX: 'auto', marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
                <th>#</th>
                <th>Hạng vé</th>
                <th>Giới tính</th>
                <th>Tuổi</th>
                <th>SibSp</th>
                <th>Parch</th>
                <th>Giá vé</th>
                <th>Cảng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {passengers.map((p, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{index + 1}</td>
                  <td style={{ padding: '10px' }}>
                    <select value={p.pclass} onChange={(e) => handleChange(index, 'pclass', e.target.value)} className="form-control" style={{ minWidth: '80px' }}>
                      <option value="">Chọn</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <select value={p.sex} onChange={(e) => handleChange(index, 'sex', e.target.value)} className="form-control" style={{ minWidth: '80px' }}>
                      <option value="">Chọn</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <input type="number" min="0" value={p.age} onChange={(e) => handleChange(index, 'age', e.target.value)} className="form-control" style={{ minWidth: '80px', width: '100%' }} />
                  </td>
                  <td style={{ padding: '10px' }}>
                    <input type="number" min="0" value={p.sibsp} onChange={(e) => handleChange(index, 'sibsp', e.target.value)} className="form-control" style={{ minWidth: '80px', width: '100%' }} />
                  </td>
                  <td style={{ padding: '10px' }}>
                    <input type="number" min="0" value={p.parch} onChange={(e) => handleChange(index, 'parch', e.target.value)} className="form-control" style={{ minWidth: '80px', width: '100%' }} />
                  </td>
                  <td style={{ padding: '10px' }}>
                    <input type="number" min="0" step="0.1" value={p.fare} onChange={(e) => handleChange(index, 'fare', e.target.value)} className="form-control" style={{ minWidth: '100px', width: '100%' }} />
                  </td>
                  <td style={{ padding: '10px' }}>
                    <select value={p.embarked} onChange={(e) => handleChange(index, 'embarked', e.target.value)} className="form-control" style={{ minWidth: '80px' }}>
                      <option value="">Chọn</option>
                      <option value="C">C</option>
                      <option value="Q">Q</option>
                      <option value="S">S</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px' }}>
                    {passengers.length > 1 && (
                      <button onClick={() => handleRemovePassenger(index)} className="btn btn-danger" style={{ padding: '5px 10px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        <FaTrash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <button onClick={handleAddPassenger} className="btn" style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            <FaPlus style={{ marginRight: '5px' }} /> Thêm người
          </button>
          
          <button onClick={handleSubmit} className="btn btn-primary" disabled={loading} style={{ padding: '10px 20px', fontSize: '16px' }}>
            {loading ? 'Đang phân tích...' : `Dự đoán ${passengers.length} người`}
          </button>
        </div>

        {results && (
          <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#333' }}>Kết quả dự đoán</h2>
              <button onClick={handleExportCSV} className="btn" style={{ backgroundColor: '#17a2b8', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <FaDownload style={{ marginRight: '8px' }} /> Export CSV
              </button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#eaeaea' }}>
                  <th style={{ padding: '10px' }}>#</th>
                  <th style={{ padding: '10px' }}>Dự đoán</th>
                  <th style={{ padding: '10px' }}>Tỷ lệ sống sót</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #ccc' }}>
                    <td style={{ padding: '10px' }}>{idx + 1}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: res.survived === 1 ? 'green' : 'red' }}>
                      {res.survived === 1 ? 'Sống sót' : 'Không sống sót'}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {(res.probability * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default BatchPage;
