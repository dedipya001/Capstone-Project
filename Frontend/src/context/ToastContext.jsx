// src/context/ToastContext.jsx
import React, { createContext, useState, useContext, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Create context
const ToastContext = createContext();

// Toast component
export const Toast = ({ id, message, type, onClose, duration = 5000 }) => {
  React.useEffect(() => {
    // Auto-remove toast after duration
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { borderColor: '#4caf50', background: 'rgba(76, 175, 80, 0.2)' };
      case 'error':
        return { borderColor: '#f44336', background: 'rgba(244, 67, 54, 0.2)' };
      case 'warning':
        return { borderColor: '#ff9800', background: 'rgba(255, 152, 0, 0.2)' };
      case 'info':
      default:
        return { borderColor: '#2196f3', background: 'rgba(33, 150, 243, 0.2)' };
    }
  };
  
  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        borderLeft: '4px solid',
        backgroundColor: getToastStyle().background,
        borderColor: getToastStyle().borderColor,
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '350px'
      }}
    >
      <div style={{ marginRight: '12px' }}>
        {getToastIcon()}
      </div>
      <div style={{ flexGrow: 1 }}>
        {message}
      </div>
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        ×
      </button>
    </motion.div>
  );
};

// Toast provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  // Keep track of toasts that have already been shown
  const shownToastsRef = useRef(new Set());
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 5000, options = {}) => {
    // If this is a one-time toast and has an ID, check if we've shown it already
    if (options.once && options.id) {
      if (shownToastsRef.current.has(options.id)) {
        return; // Skip this toast, it's been shown before
      }
      // Mark this toast as shown
      shownToastsRef.current.add(options.id);
    }

    const id = options.id || Math.random().toString(36).substring(2, 9);
    
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  // Clear toast history (useful when navigating away or for testing)
  const clearToastHistory = useCallback(() => {
    shownToastsRef.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearToastHistory }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};