import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/components.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <motion.div 
        className="not-found-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <Link to="/" className="button button-primary">
            Go Home
          </Link>
          <Link to="/dashboard" className="button button-secondary">
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;