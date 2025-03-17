// src/components/common/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import '../../styles/components.css';

const Sidebar = () => {
  const { user } = useAuth();
  const { userProfile } = useSettings();
  
  // Dashboard navigation items
  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Overview', 
      icon: '📊'
    },
    { 
      path: '/map', 
      label: 'Electoral Map', 
      icon: '🗺️'
    },
    { 
      path: '/data', 
      label: 'Data Management', 
      icon: '📁'
    },
    { 
      path: '/reports', 
      label: 'Reports', 
      icon: '📈'
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: '⚙️'
    }
  ];

  return (
    <motion.aside 
      className="sidebar"
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="sidebar-header">
        <div className="user-profile">
          <img src={userProfile.avatar} alt={userProfile.name} className="user-avatar" />
          <div className="user-details">
            <h3>{userProfile.name}</h3>
            <span className="user-role">{userProfile.role}</span>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p>Electoral Data Dashboard</p>
        <p className="version">v1.0.0</p>
      </div>
    </motion.aside>
  );
};

export default Sidebar;