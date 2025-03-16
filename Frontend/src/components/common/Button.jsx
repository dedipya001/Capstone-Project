import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../styles/components.css';

const Button = ({ 
  children, 
  to, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  type = 'button',
  icon,
  className = '',
  ...props 
}) => {
  const buttonClasses = `
    button 
    button-${variant} 
    button-${size}
    ${fullWidth ? 'button-full-width' : ''} 
    ${icon ? 'button-with-icon' : ''}
    ${className}
  `;

  const buttonContent = (
    <>
      {icon && <span className="button-icon">{icon}</span>}
      <span className="button-text">{children}</span>
    </>
  );

  // If "to" prop is provided, render as Link
  if (to) {
    return (
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <Link to={to} className={buttonClasses} {...props}>
          {buttonContent}
        </Link>
      </motion.div>
    );
  }

  // Otherwise render as button
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {buttonContent}
    </motion.button>
  );
};

export default Button;