import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import {
  FaHome,
  FaChartLine,
  FaRobot,
  FaHistory,
  FaFileUpload,
  FaChartBar
} from 'react-icons/fa';

function Navbar() {

  // Style chung cho các link điều hướng
  const linkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    color: isActive ? '#aa3bff' : '#333333',
    fontWeight: isActive ? 'bold' : 'normal',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  return (
    <nav style={styles.navbar}>

      {/* LOGO */}
      <div style={styles.logo}>
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: '#aa3bff',
            fontWeight: 'bold',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          MySpace
        </Link>
      </div>

      {/* MENU */}
      <div style={styles.menuLinks}>

        <NavLink to="/" style={linkStyle}>
          <FaHome />
          Trang Chủ
        </NavLink>

        <NavLink to="/predict" style={linkStyle}>
          <FaChartLine />
          Dự đoán
        </NavLink>

        <NavLink to="/model-info" style={linkStyle}>
          <FaRobot />
          Thông tin model
        </NavLink>

        <NavLink to="/history" style={linkStyle}>
          <FaHistory />
          Lịch sử dự đoán
        </NavLink>

        <NavLink to="/predict-from-file" style={linkStyle}>
          <FaFileUpload />
          Dự đoán hàng loạt
        </NavLink>

      </div>

      {/* Góc phải */}
      <div style={{ fontSize: '24px', color: '#aa3bff' }}>
          <FaChartBar />
      </div>

    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    fontFamily: 'system-ui, sans-serif'
  },

  logo: {
    display: 'flex',
    alignItems: 'center'
  },

  menuLinks: {
    display: 'flex',
    gap: '25px'
  }
};

export default Navbar;