import React, { useEffect, useState } from "react";

function ModelInfo() {
  const [modelInfo, setModelInfo] = useState({});
  const [compareInfo, setCompareInfo] = useState([]);

  useEffect(() => {
    getModelInfo();
    getCompareModel();
  }, []);

  const getModelInfo = async () => {

    try {
      const response = await fetch("http://127.0.0.1:8000/model-info");
      const data = await response.json();
      console.log(data);
      setModelInfo(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getCompareModel = async () => {

    try {
      const response = await fetch("http://127.0.0.1:8000/compare-model");
      const data = await response.json();
      console.log(data);
      setCompareInfo(data.models);
    } catch (error) {
      console.log(error);
    }
  };

  return (

    <div style={styles.container}>

      <h1 style={styles.title}>Thông tin mô hình </h1>
      <p style={styles.text}>
        Thông tin về mô hình Machine Learning dùng để dự đoán khả năng sống sót trên tàu Titanic.
      </p>

      <h2>Thông tin chung</h2>

      <table style={styles.table}>

        <tbody>

          <tr>

            <td style={styles.left}>Loại mô hình</td>
            <td style={styles.right}>
              {modelInfo.model_type}
            </td>

          </tr>

          <tr>
            <td style={styles.left}>Số đặc trưng </td>
            <td style={styles.right}>
              {modelInfo.features ? modelInfo.features.length : 0}
            </td>

          </tr>

          <tr>
            <td style={styles.left}>Số cây</td>          
            <td style={styles.right}> 
              {modelInfo.n_estimators}            
            </td>
          </tr>

        </tbody>
      </table>

      <h2>Các đặc trưng đầu vào</h2>
      <ul>
        {
          modelInfo.features && modelInfo.features.map((item,index)=>(
            <li key={index}>
              {item}
            </li>
          ))
        }
      </ul>

      <h2>Độ quan trọng của đặc trưng</h2>

      <table style={styles.table}>

        <thead>
          <tr>
            <th style={styles.head}>Đặc trưng</th>
            <th style={styles.head}>Gía trị</th>
          </tr>
        </thead>

        <tbody>
          {
            modelInfo.feature_importances &&
            Object.entries(modelInfo.feature_importances).map(
              ([key,value],index)=>(
                <tr key={index}>
                  <td style={styles.right}>
                    {key}
                  </td>
                  <td style={styles.right}>
                    {value}
                  </td>
                </tr>
              )
            )
          }

        </tbody>

      </table>

      <h2>So sánh các mô hình</h2>

      <table style={styles.table}>
       <thead>
          <tr>
            <th style={styles.head}>Model</th>
            <th style={styles.head}>Accuracy</th>
            <th style={styles.head}>CV Mean</th>
            <th style={styles.head}>CV Std</th>
          </tr>
        </thead>
        <tbody>
          {
            compareInfo.map((item,index)=>(
              <tr key={index}>
                <td style={styles.right}>
                  {item.model}
                </td>

                <td style={styles.right}>
                  {(item.accuracy*100).toFixed(2)}%
                </td>

                <td style={styles.right}>
                  {(item.cv_mean*100).toFixed(2)}%
                </td>

                <td style={styles.right}>
                  {(item.cv_std*100).toFixed(2)}%
                </td>
              </tr>

            ))
          }
        </tbody>
      </table>
            <h3 style={styles.best}>Mô hình tốt nhất: Random Forest</h3>       
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
    borderCollapse: "collapse",
    marginTop: "15px",
    marginBottom: "25px"
  },

  head: {
    border: "1px solid #cccccc",
    padding: "10px",
    backgroundColor: "#003366",
    color: "white"
  },

  left: {
    border: "1px solid #cccccc",
    padding: "10px",
    fontWeight: "bold",
    width: "35%"
  },

  right: {
    border: "1px solid #cccccc",
    padding: "10px",
    textAlign: "center"
  },

  best: {
    marginTop: "20px",
    textAlign: "center",
    color: "green"
  }

};

    

    

    ) 
}
export default ModelInfo;
