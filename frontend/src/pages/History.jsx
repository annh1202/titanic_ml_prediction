import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("titanic_history") || "[]");
  });

  const deleteHistory = () => {
    localStorage.removeItem("titanic_history");
    setHistory([]);
  };

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>Lịch sử dự đoán Titanic</h1>

      <p style={styles.text}>Danh sách các lần dự đoán của người dùng</p>
      
       
      <table style={styles.table}>

        <thead>

          <tr>
            <th style={styles.th}>STT</th>
            <th style={styles.th}>Họ tên</th>
            <th style={styles.th}>Giới tính</th>
            <th style={styles.th}>Tuổi</th>
            <th style={styles.th}>Hạng vé</th>
            <th style={styles.th}>Kết quả</th>
            <th style={styles.th}>Ngày dự đoán</th>
          </tr>

        </thead>

        <tbody>

          {
            history.length === 0 ?
              (
                <tr>
                  <td
                    colSpan="7"
                    style={styles.empty}
                  >Chưa có lịch sử dự đoán.
                 </td>
                </tr>
              )
              :
              history.map((item, index) => (

                <tr key={index}>

                  <td style={styles.td}>
                    {index + 1}
                  </td>

                  <td style={styles.td}>
                    {item.name}
                  </td>

                  <td style={styles.td}>
                    {item.sex}
                  </td>

                  <td style={styles.td}>
                    {item.age}
                  </td>

                  <td style={styles.td}>
                    {item.pclass}
                  </td>

                  <td
                    style={{
                      ...styles.td,
                      color:
                        item.result === "Sống sót"
                          ? "green"
                          : "red",
                      fontWeight: "bold"
                    }}
                  >
                    {item.result}
                  </td>
                  <td style={styles.td}>
                    {item.date}
                  </td>
                </tr>
              ))
          }
        </tbody>
      </table>

      <div style={styles.buttonBox}>
        <button
          style={styles.newButton}
          onClick={() => navigate("/predict")}
        > Dự đoán mới
        </button>

        <button
          style={styles.deleteButton}
          onClick={deleteHistory}
        >  Xóa lịch sử
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
    textAlign: "center"
  },

  newButton: {
    padding: "10px 20px",
    backgroundColor: "#003366",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginRight: "10px"
  },

  deleteButton: {
    padding: "10px 20px",
    backgroundColor: "red",
    color: "white",
    border: "none",
    cursor: "pointer"
  }

};

export default History;
