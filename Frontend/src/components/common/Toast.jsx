import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/components.css';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    // Adding keyboard support for accessibility
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getIcon = () => {
    switch(type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': default: return 'ℹ';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`toast toast-${type}`}
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        role="alert"
      >
        <div className="toast-icon">{getIcon()}</div>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={onClose} aria-label="Close notification">
          ×
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;