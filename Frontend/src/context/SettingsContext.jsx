// src/context/SettingsContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { addToast } = useToast();
  
  // User profile settings
  const [userProfile, setUserProfile] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: 'https://i.pravatar.cc/150?u=admin@example.com',
    role: 'admin'
  });

  // Theme settings
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has previously set a theme preference
    const savedTheme = localStorage.getItem('theme');
    // If not, use system preference
    if (!savedTheme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return savedTheme === 'dark';
  });
  
  // Map settings
  const [mapSettings, setMapSettings] = useState({
    showLegend: true,
    showStateSidebar: true,
    mapStyle: 'mapbox://styles/mapbox/dark-v11',
    showPopups: true,
    enableInteractions: true
  });

  // Update theme in DOM and localStorage when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      addToast(`Switched to ${newMode ? 'dark' : 'light'} mode`, 'info', 3000);
      return newMode;
    });
  };

  // Update user profile
  const updateUserProfile = (updatedProfile) => {
    setUserProfile(prev => {
      const newProfile = { ...prev, ...updatedProfile };
      
      // In a real app, you'd make an API call here to update the user profile
      // For now, we'll just update the state and localStorage
      localStorage.setItem('userProfile', JSON.stringify(newProfile));
      
      addToast('Profile updated successfully', 'success', 5000);
      return newProfile;
    });
  };

  // Update map settings
  const updateMapSettings = (settings) => {
    setMapSettings(prev => {
      const newSettings = { ...prev, ...settings };
      localStorage.setItem('mapSettings', JSON.stringify(newSettings));
      
      // Show toast based on what was changed
      if (settings.mapStyle !== undefined) {
        const styleType = newSettings.mapStyle.includes('dark') ? 'dark' : 'light';
        addToast(`Map style changed to ${styleType}`, 'info', 3000);
      } else {
        addToast('Map settings updated', 'info', 3000);
      }
      
      return newSettings;
    });
  };

  // Load saved settings on initial render
  useEffect(() => {
    try {
      // Load user profile
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
      
      // Load map settings
      const savedMapSettings = localStorage.getItem('mapSettings');
      if (savedMapSettings) {
        setMapSettings(JSON.parse(savedMapSettings));
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
  }, []);

  return (
    <SettingsContext.Provider 
      value={{ 
        userProfile, 
        updateUserProfile,
        isDarkMode, 
        toggleDarkMode,
        mapSettings,
        updateMapSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);