import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import Header from '../components/common/Header';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ContactSection from '../components/landing/ContactSection';
import '../styles/landingStyles.css';

const LandingPage = () => {
  const { addToast } = useToast();

  useEffect(() => {
    // Welcome toast for new visitors
    const isFirstVisit = !localStorage.getItem('visitedBefore');
    if (isFirstVisit) {
      addToast('Welcome to India\'s Electoral Data Dashboard', 'info');
      localStorage.setItem('visitedBefore', 'true');
    }
  }, [addToast]);

  return (
    <div className="landing-page">
      <Header />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        
        <section className="cta-section">
          <div className="section-container">
            <motion.div 
              className="cta-content"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2>Ready to explore electoral data?</h2>
              <p>Access the dashboard to dive into comprehensive electoral information and mapping tools.</p>
              <div className="cta-buttons">
                <Link to="/dashboard" className="button button-primary button-large">
                  Go to Dashboard
                </Link>
                <Link to="/register" className="button button-secondary button-large">
                  Create Account
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        
        <ContactSection />
      </main>
      
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-logo">
            <img src="/logo.svg" alt="Electoral Data" />
            <h3>Electoral Data Dashboard</h3>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>Navigation</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/map">Electoral Map</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                <li><a href="#!">Documentation</a></li>
                <li><a href="#!">API</a></li>
                <li><a href="#!">Data Sources</a></li>
                <li><a href="#!">Help Center</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><a href="#!">Privacy Policy</a></li>
                <li><a href="#!">Terms of Service</a></li>
                <li><a href="#!">Data Usage Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Election Commission of India. All rights reserved.</p>
          <div className="social-links">
            <a href="#!" aria-label="Twitter">Twitter</a>
            <a href="#!" aria-label="Facebook">Facebook</a>
            <a href="#!" aria-label="Instagram">Instagram</a>
            <a href="#!" aria-label="YouTube">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;