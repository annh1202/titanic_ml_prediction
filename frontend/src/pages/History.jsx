import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../api/titanicApi";

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const LIMIT = 10;

  const fetchHistory = async (currentOffset) => {
    setLoading(true);
    try {
      const response = await getHistory(LIMIT, currentOffset);
      const data = response.data;
      if (currentOffset === 0) {
        setHistory(data.data);
      } else {
        setHistory(prev => [...prev, ...data.data]);
      }
      setTotal(data.total);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(offset);
  }, [offset]);

  const loadMore = () => {
    setOffset(prev => prev + LIMIT);
  };

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>Lịch sử dự đoán Titanic</h1>

      <p style={styles.text}>Danh sách các lần dự đoán từ hệ thống (Tổng: {total})</p>
      
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>STT</th>
            <th style={styles.th}>Giới tính</th>
            <th style={styles.th}>Tuổi</th>
            <th style={styles.th}>Hạng vé</th>
            <th style={styles.th}>Giá vé</th>
            <th style={styles.th}>Kết quả</th>
            <th style={styles.th}>Ngày dự đoán</th>
          </tr>
        </thead>
        <tbody>
          {
            history.length === 0 && !loading ?
              (
                <tr>
                  <td colSpan="7" style={styles.empty}>Chưa có lịch sử dự đoán.</td>
                </tr>
              )
              :
              history.map((item, index) => {
                const resultText = item.survived === 1 ? "Sống sót" : "Không sống sót";
                return (
                  <tr key={index}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{item.sex === "male" ? "Nam" : "Nữ"}</td>
                    <td style={styles.td}>{item.age}</td>
                    <td style={styles.td}>{item.pclass}</td>
                    <td style={styles.td}>{item.fare}</td>
                    <td
                      style={{
                        ...styles.td,
                        color: item.survived === 1 ? "green" : "red",
                        fontWeight: "bold"
                      }}
                    >
                      {resultText} <br/>
                      <span style={{fontSize: "0.8em", color: "gray"}}>{(item.probability * 100).toFixed(2)}%</span>
                    </td>
                    <td style={styles.td}>{new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                );
              })
          }
        </tbody>
      </table>

      {loading && <p style={{textAlign: "center", marginTop: "10px"}}>Đang tải...</p>}

      <div style={styles.buttonBox}>
        {history.length < total && !loading && (
          <button style={styles.loadMoreButton} onClick={loadMore}>
            Tải thêm lịch sử
          </button>
        )}
        <button style={styles.newButton} onClick={() => navigate("/predict")}>
          Dự đoán mới
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "900px",
    margin: "30px auto",
    backgroundColor: "white",
    padding: "20px",
    border: "1px solid #cccccc"
  },
  title: {
    textAlign: "center",
    color: "#003366"
  },
  text: {
    textAlign: "center",
    color: "gray",
    marginBottom: "20px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    border: "1px solid #cccccc",
    padding: "10px",
    backgroundColor: "#003366",
    color: "white"
  },
  td: {
    border: "1px solid #cccccc",
    padding: "10px",
    textAlign: "center"
  },
  empty: {
    padding: "20px",
    textAlign: "center",
    color: "gray"
  },
  buttonBox: {
    marginTop: "20px",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    gap: "10px"
  },
  newButton: {
    padding: "10px 20px",
    backgroundColor: "#003366",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  loadMoreButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    cursor: "pointer"
  }
};

export default History;
