import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/mapStyles.css';

const LoadingOverlay = ({ loading }) => {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div 
          className="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;