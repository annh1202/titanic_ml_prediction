import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Predict from './pages/Predict'
import ModelInfo from './pages/ModelInfo'
import History from './pages/History'
import PredictFromFile from './pages/PredictFromFile'
import BatchPage from './pages/BatchPage'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/model-info" element={<ModelInfo />} />
        <Route path="/history" element={<History />} />
        <Route path="/predict-from-file" element={<PredictFromFile />} />
        <Route path="/batch-manual" element={<BatchPage />} />
      </Routes>
    </Router>
  );
}

export default App;