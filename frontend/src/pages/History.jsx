import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


function History() {

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu từ FastAPI
  useEffect(() => {

    fetch('http://localhost:8000/history')
      .then((response) => response.json())
      .then((data) => {
        setHistory(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Lỗi fetch history:', error);
        setLoading(false);
      });

  }, []);

  if (loading) {
    return <h2>Đang tải dữ liệu...</h2>;
  }

  return (

    <div style={styles.container}>

      <h1 style={styles.title}>
        Lịch sử dự đoán Titanic
      </h1>

      <table style={styles.table}>

        <thead>

          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Pclass</th>
            <th style={styles.th}>Sex</th>
            <th style={styles.th}>Age</th>
            <th style={styles.th}>SibSp</th>
            <th style={styles.th}>Parch</th>
            <th style={styles.th}>Fare</th>
            <th style={styles.th}>Embarked</th>
            <th style={styles.th}>Survived</th>
            <th style={styles.th}>Probability</th>
            <th style={styles.th}>Created At</th>
          </tr>

        </thead>

        <tbody>

          {
            history.map((item) => (

              <tr key={item.id}>

                <td style={styles.td}>{item.id}</td>

                <td style={styles.td}>
                  {item.pclass}
                </td>

                <td style={styles.td}>
                  {item.sex}
                </td>

                <td style={styles.td}>
                  {item.age}
                </td>

                <td style={styles.td}>
                  {item.sibsp}
                </td>

                <td style={styles.td}>
                  {item.parch}
                </td>

                <td style={styles.td}>
                  {item.fare}
                </td>

                <td style={styles.td}>
                  {item.embarked}
                </td>

                <td style={styles.td}>
                  {
                    item.survived === 1
                      ? 'Sống sót'
                      : 'Không sống sót'
                  }
                </td>

                <td style={styles.td}>
                  {(item.probability * 100).toFixed(2)}%
                </td>

                <td style={styles.td}>
                  {
                    new Date(item.created_at)
                      .toLocaleString()
                  }
                </td>

              </tr>

            ))
          }

        </tbody>

      </table>

    </div>

  );
}

const styles = {

  container: {
    width: '95%',
    margin: '30px auto',
    overflowX: 'auto'
  },

  title: {
    textAlign: 'center',
    color: '#7e22ce',
    marginBottom: '40px'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#ffffff'
  },

  th: {
    border: '1px solid #dddddd',
    padding: '12px',
    backgroundColor: '#7e22ce',
    color: 'white',
    textAlign: 'center'
  },

  td: {
    border: '1px solid #dddddd',
    padding: '10px',
    textAlign: 'center'
  }

};

export default History;