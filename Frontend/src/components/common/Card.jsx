import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/components.css';

const Card = ({ 
  children, 
  title, 
  className = '', 
  variant = 'default',
  onClick,
  hoverable = false,
  ...props 
}) => {
  return (
    <motion.div 
      className={`card card-${variant} ${hoverable ? 'card-hoverable' : ''} ${className}`}
      whileHover={hoverable ? { y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' } : {}}
      onClick={onClick}
      {...props}
    >
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">
        {children}
      </div>
    </motion.div>
  );
};

export default Card;