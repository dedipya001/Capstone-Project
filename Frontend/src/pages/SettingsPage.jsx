// src/pages/SettingsPage.jsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import AuthGuard from '../components/common/AuthGuard';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import '../styles/settingsStyles.css';

const SettingsPage = () => {
  const { userProfile, updateUserProfile, isDarkMode, toggleDarkMode, mapSettings, updateMapSettings } = useSettings();
  const { addToast } = useToast();
  
  // Local state for form inputs
  const [formData, setFormData] = useState({
    name: userProfile.name,
    email: userProfile.email
  });
  
  // Ref for file input
  const fileInputRef = useRef(null);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle profile form submission
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateUserProfile({
      name: formData.name,
      email: formData.email
    });
  };
  
  // Handle avatar click to trigger file input
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size and type
    if (file.size > 5000000) {
      addToast('Image too large. Maximum size is 5MB', 'error', 5000);
      return;
    }
    
    if (!file.type.match('image.*')) {
      addToast('Please select an image file', 'error', 5000);
      return;
    }
    
    // Create a URL for the file
    const reader = new FileReader();
    reader.onload = (event) => {
      updateUserProfile({
        avatar: event.target.result
      });
    };
    reader.readAsDataURL(file);
  };
  
  // Handle map style change
  const handleMapStyleChange = (style) => {
    updateMapSettings({
      mapStyle: style
    });
  };
  
  // Handle toggle change for map settings
  const handleToggleChange = (setting) => {
    updateMapSettings({
      [setting]: !mapSettings[setting]
    });
  };

  return (
    <AuthGuard>
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-main">
          <Sidebar />
          <div className="dashboard-content settings-container">
            <h1>Settings</h1>
            
            <motion.div 
              className="settings-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2>Profile Settings</h2>
              
              <div className="avatar-section">
                <div 
                  className="avatar-container"
                  onClick={handleAvatarClick}
                >
                  <img 
                    src={userProfile.avatar} 
                    alt={`${userProfile.name}'s avatar`} 
                    className="avatar-image"
                  />
                  <div className="avatar-overlay">
                    <span>Change Image</span>
                  </div>
                </div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              
              <form onSubmit={handleProfileSubmit} className="settings-form">
                <div className="form-group">
                  <label htmlFor="name">Display Name</label>
                  <input 
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <button type="submit" className="settings-button primary">
                  Save Profile Changes
                </button>
              </form>
            </motion.div>
            
            <motion.div 
              className="settings-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2>Appearance</h2>
              <div className="settings-option">
                <div className="option-description">
                  <h3>Theme Mode</h3>
                  <p>Switch between light and dark mode</p>
                </div>
                <div className="theme-toggle">
                  <button 
                    className={`theme-button ${!isDarkMode ? 'active' : ''}`}
                    onClick={() => isDarkMode && toggleDarkMode()}
                  >
                    Light
                  </button>
                  <button 
                    className={`theme-button ${isDarkMode ? 'active' : ''}`}
                    onClick={() => !isDarkMode && toggleDarkMode()}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="settings-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2>Map Settings</h2>
              
              <div className="settings-option">
                <div className="option-description">
                  <h3>Map Style</h3>
                  <p>Choose a map style</p>
                </div>
                <div className="map-style-options">
                  <div 
                    className={`map-style-option ${mapSettings.mapStyle === 'mapbox://styles/mapbox/dark-v11' ? 'active' : ''}`}
                    onClick={() => handleMapStyleChange('mapbox://styles/mapbox/dark-v11')}
                  >
                    <div className="map-style-preview dark"></div>
                    <span>Dark</span>
                  </div>
                  <div 
                    className={`map-style-option ${mapSettings.mapStyle === 'mapbox://styles/mapbox/light-v11' ? 'active' : ''}`}
                    onClick={() => handleMapStyleChange('mapbox://styles/mapbox/light-v11')}
                  >
                    <div className="map-style-preview light"></div>
                    <span>Light</span>
                  </div>
                  <div 
                    className={`map-style-option ${mapSettings.mapStyle === 'mapbox://styles/mapbox/satellite-streets-v12' ? 'active' : ''}`}
                    onClick={() => handleMapStyleChange('mapbox://styles/mapbox/satellite-streets-v12')}
                  >
                    <div className="map-style-preview satellite"></div>
                    <span>Satellite</span>
                  </div>
                </div>
              </div>
              
              <div className="settings-option">
                <div className="option-description">
                  <h3>Show Legend</h3>
                  <p>Show or hide the map legend</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={mapSettings.showLegend} 
                    onChange={() => handleToggleChange('showLegend')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="settings-option">
                <div className="option-description">
                  <h3>Show State Sidebar</h3>
                  <p>Show or hide the states selection sidebar</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={mapSettings.showStateSidebar} 
                    onChange={() => handleToggleChange('showStateSidebar')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="settings-option">
                <div className="option-description">
                  <h3>Show Popups</h3>
                  <p>Enable or disable information popups on the map</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={mapSettings.showPopups} 
                    onChange={() => handleToggleChange('showPopups')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default SettingsPage;