import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/mapStyles.css';

const StateSelector = ({ statesList, selectedState, onSelectState }) => {
  return (
    <motion.div
      className="state-selector"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3>States & Union Territories</h3>
      <hr style={{ borderColor: '#00ff00', marginBottom: '10px' }} />
      {statesList.map(state => (
        <div 
          key={state} 
          className={`state-option ${state === selectedState ? 'selected' : ''}`}
          onClick={() => onSelectState(state)}
        >
          {state}
        </div>
      ))}
    </motion.div>
  );
};

export default StateSelector;