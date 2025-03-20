import React from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import '../../styles/landingStyles.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">
            India's Garbage Monitoring Data <span className="highlight">Dashboard</span>
          </h1>
          <p className="hero-description">
            Comprehensive visualization and analysis of garbage boundaries, demographics, and cleaning patterns across India's parliamentary constituencies.
          </p>
          <div className="hero-buttons">
            <Button to="/dashboard" variant="primary" size="large">
              Go to Dashboard
            </Button>
            <Button to="/map" variant="secondary" size="large">
              Explore Map
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          className="hero-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <img src="/images/india-map-preview.png" alt="" />
        </motion.div>
      </div>
      
      <div className="hero-stats">
        <motion.div 
          className="stat-item"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>543</h3>
          <p>Parliamentary Constituencies</p>
        </motion.div>
        <motion.div 
          className="stat-item"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3>28</h3>
          <p>States</p>
        </motion.div>
        <motion.div 
          className="stat-item"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h3>8</h3>
          <p>Union Territories</p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;