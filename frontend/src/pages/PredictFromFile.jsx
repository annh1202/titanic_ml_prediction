import React, { useState } from 'react'
import { Link } from 'react-router-dom'


function PredictFromFile() {

  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Chọn file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Tải file mẫu
  const downloadSampleFile = () => {

    const sampleData = {
      passengers: [
        {
          pclass: 1,
          sex: "female",
          age: 38,
          sibsp: 1,
          parch: 0,
          fare: 71.28,
          embarked: "C"
        },
        {
          pclass: 3,
          sex: "male",
          age: 22,
          sibsp: 1,
          parch: 0,
          fare: 7.25,
          embarked: "S"
        }
      ]
    };

    const blob = new Blob(
      [JSON.stringify(sampleData, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_batch.json';
    a.click();

    URL.revokeObjectURL(url);
  };

  // Upload file và predict
  const handleUpload = async () => {

    if (!file) {
      alert("Hãy chọn file JSON");
      return;
    }

    setLoading(true);

    try {

      const text = await file.text();
      const jsonData = JSON.parse(text);

      const response = await fetch('http://localhost:8000/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
      });

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        alert("Lỗi khi dự đoán batch");
        setLoading(false);
        return;
      }

      setResults(data);

    } catch (error) {
      console.error(error);
      alert("Lỗi đọc file hoặc gọi API");
    }

    setLoading(false);
  };

  return (

    <div style={styles.container}>

      <h1 style={styles.title}>
        Dự đoán hàng loạt Titanic
      </h1>

      <div style={styles.card}>

        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
        />

        <div style={styles.buttonGroup}>

          <button
            style={styles.button}
            onClick={handleUpload}
          >
            {loading ? 'Đang xử lý...' : 'Predict'}
          </button>

          <button
            style={styles.downloadButton}
            onClick={downloadSampleFile}
          >
            Tải file mẫu
          </button>

        </div>

      </div>

      {
        results && (

          <div style={styles.resultCard}>

            <h2>Kết quả Batch Predict</h2>

            <p>
              Tổng mẫu: <strong>{results.total}</strong>
            </p>

            <p>
              Sống sót: <strong>{results.survived_count}</strong>
            </p>

            <table style={styles.table}>

              <thead>

                <tr>
                  <th style={styles.th}>STT</th>
                  <th style={styles.th}>Kết quả</th>
                  <th style={styles.th}>Xác suất</th>
                </tr>

              </thead>

              <tbody>

                {
                  results.results.map((item, index) => (

                    <tr key={index}>

                      <td style={styles.td}>
                        {index + 1}
                      </td>

                      <td style={styles.td}>
                        {item.message}
                      </td>

                      <td style={styles.td}>
                        {(item.probability * 100).toFixed(2)}%
                      </td>

                    </tr>

                  ))
                }

              </tbody>

            </table>

          </div>

        )
      }

    </div>

  );
}

const styles = {

  container: {
    width: '90%',
    margin: '30px auto'
  },

  title: {
    textAlign: 'center',
    marginBottom: '40px',
    color: '#7e22ce'
  },

  card: {
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },

  resultCard: {
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },

  buttonGroup: {
    marginTop: '20px',
    display: 'flex',
    gap: '15px'
  },

  button: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#7e22ce',
    color: 'white',
    cursor: 'pointer'
  },

  downloadButton: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#2563eb',
    color: 'white',
    cursor: 'pointer'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  },

  th: {
    border: '1px solid #dddddd',
    padding: '12px',
    backgroundColor: '#7e22ce',
    color: 'white'
  },

  td: {
    border: '1px solid #dddddd',
    padding: '10px',
    textAlign: 'center'
  }

};

export default PredictFromFile;