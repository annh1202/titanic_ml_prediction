
import React from "react";

function History() {
  return (
    <div style={styles.container}>

      <h1 style={styles.title}>Lịch sử dự đoán Titanic</h1>

      <p style={styles.text}>
        Danh sách các lần dự đoán của người dùng
      </p>

      <table style={styles.table}>
        <thead>
          <tr>
            
            <th style={styles.th}>Họ tên</th>
            <th style={styles.th}>Giới tính</th>
            <th style={styles.th}>Tuổi</th>
            <th style={styles.th}>Hạng vé</th>
            <th style={styles.th}>Kết quả</th>
            <th style={styles.th}>Ngày dự đoán</th>
          </tr>
        </thead>

        <tbody>

          <tr>
            <td style={styles.td}>Nguyễn Văn A</td>
            <td style={styles.td}>Nam</td>
            <td style={styles.td}>28</td>
            <td style={styles.td}>Hạng 1</td>
            <td style={{ ...styles.td, color: "green", fontWeight: "bold" }}>
              Sống sót
            </td>
            <td style={styles.td}>15/04/1912</td>
          </tr>

          <tr>
            <td style={styles.td}>Trần Thị B</td>
            <td style={styles.td}>Nữ</td>
            <td style={styles.td}>30</td>
            <td style={styles.td}>Hạng 3</td>
            <td style={{ ...styles.td, color: "red", fontWeight: "bold" }}>
              Không sống sót
            </td>
            <td style={styles.td}>16/04/1912</td>
          </tr>

          <tr>
            <td style={styles.td}>Lê Văn C</td>
            <td style={styles.td}>Nam</td>
            <td style={styles.td}>35</td>
            <td style={styles.td}>Hạng 2</td>
            <td style={{ ...styles.td, color: "red", fontWeight: "bold" }}>
              Không sống sót
            </td>
            <td style={styles.td}>15/04/1912</td>
          </tr>

        </tbody>
      </table>

      <div style={styles.buttonBox}>
        <button style={styles.newButton}>
          Dự đoán mới
        </button>

        <button style={styles.deleteButton}>
          Xóa lịch sử
        </button>
      </div>

    </div>
  );
}

const styles = {

  container: {
    width: "850px",
    margin: "30px auto",
    backgroundColor: "#ffffff",
    padding: "20px",
    border: "1px solid #cccccc"
  },

  title: {
    textAlign: "center",
    color: "#003366"
  },

  text: {
    textAlign: "center",
    color: "gray"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px"
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

  buttonBox: {
    textAlign: "center",
    marginTop: "20px"
  },

  newButton: {
    padding: "10px 20px",
    marginRight: "10px",
    backgroundColor: "#003366",
    color: "white",
    border: "none",
    cursor: "pointer"
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
