// src/components/common/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import '../../styles/components.css';

const Header = () => {
  const { logout } = useAuth();
  const { addToast } = useToast();
  const { userProfile } = useSettings();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    addToast('Successfully logged out', 'success');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <img src="/logo.svg" alt="" />
          <span>Garbage Data</span>
        </Link>

        <button 
          className={`mobile-menu-button ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          
          {userProfile ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
              <Link to="/map" className={`nav-link ${isActive('/map')}`}>Map</Link>
              <div className="user-menu">
                <div className="user-info">
                  <img src={userProfile.avatar} alt={userProfile.name} className="user-avatar" />
                  <span className="user-name">{userProfile.name}</span>
                </div>
                <div className="dropdown-menu">
                  <Link to="/settings" className="dropdown-item">Settings</Link>
                  <button onClick={handleLogout} className="dropdown-item logout-button">Logout</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login')}`}>Login</Link>
              <Link to="/register" className="nav-link button-primary">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;