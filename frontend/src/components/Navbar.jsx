import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  FaHome,
  FaChartLine,
  FaRobot,
  FaHistory,
  FaFileUpload,
  FaShip
} from 'react-icons/fa';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* LOGO */}
        <Link to="/" className="nav-logo">
          <FaShip style={{ color: 'var(--primary)' }} />
          Titanic AI
        </Link>

        {/* MENU */}
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FaHome /> Trang Chủ
          </NavLink>

          <NavLink to="/predict" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FaChartLine /> Dự đoán
          </NavLink>

          <NavLink to="/model-info" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FaRobot /> Thông tin model
          </NavLink>

          <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FaHistory /> Lịch sử
          </NavLink>

          <NavLink to="/predict-from-file" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FaFileUpload /> Hàng loạt
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;