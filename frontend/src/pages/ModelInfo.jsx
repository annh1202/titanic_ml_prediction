import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


function ModelInfo() {

  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch('http://localhost:8000/model-info')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setModelInfo(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi lấy model info:", error);
        setLoading(false);
      });

  }, []);

  // loading
  if (loading) {
    return <h2>Đang tải thông tin model...</h2>;
  }

  // tránh null crash
  if (!modelInfo) {
    return <h2>Không lấy được dữ liệu model</h2>;
  }

  return (

    <div style={styles.container}>

      <h1 style={styles.title}>
        Thông tin mô hình AI
      </h1>

      {/* Model Type */}
      <div style={styles.card}>
        <h2>Loại mô hình</h2>
        <p>{modelInfo.model_type}</p>
      </div>

      {/* Features */}
      <div style={styles.card}>
        <h2>Features đầu vào</h2>

        <ul>
          {
            modelInfo.features?.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))
          }
        </ul>
      </div>

      {/* Output */}
      <div style={styles.card}>

        <h2>Output</h2>

        <table style={styles.table}>

          <thead>
            <tr>
              <th style={styles.th}>Label</th>
              <th style={styles.th}>Ý nghĩa</th>
            </tr>
          </thead>

          <tbody>

            {
              Object.entries(modelInfo.output || {}).map(([key, value]) => (

                <tr key={key}>
                  <td style={styles.td}>{key}</td>
                  <td style={styles.td}>{value}</td>
                </tr>

              ))
            }

          </tbody>

        </table>

      </div>

      {/* n_estimators */}
      {
        modelInfo.n_estimators && (

          <div style={styles.card}>
            <h2>Số lượng cây</h2>
            <p>{modelInfo.n_estimators}</p>
          </div>

        )
      }

      {/* Feature Importances */}
      {
        modelInfo.feature_importances && (

          <div style={styles.card}>

            <h2>Độ quan trọng của Feature</h2>

            <table style={styles.table}>

              <thead>
                <tr>
                  <th style={styles.th}>Feature</th>
                  <th style={styles.th}>Importance</th>
                </tr>
              </thead>

              <tbody>

                {
                  Object.entries(modelInfo.feature_importances)
                    .sort((a, b) => b[1] - a[1])
                    .map(([feature, importance]) => (

                      <tr key={feature}>
                        <td style={styles.td}>{feature}</td>
                        <td style={styles.td}>
                          {(importance * 100).toFixed(2)}%
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
    margin: '30px auto',
    fontFamily: 'Arial'
  },

  title: {
    textAlign: 'center',
    color: '#7e22ce',
    marginBottom: '40px',
  },

  card: {
    backgroundColor: '#ffffff',
    padding: '20px',
    marginBottom: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
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

export default ModelInfo;