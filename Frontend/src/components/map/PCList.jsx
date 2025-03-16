import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/mapStyles.css';

const PCList = ({ state, pcList, selectedPC, onSelectPC, onBack }) => {
  return (
    <motion.div
      className="pc-list"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{state}</h3>
        <button className="back-button" onClick={onBack}>
          Back
        </button>
      </div>
      <p>{pcList.length} Parliamentary Constituencies</p>
      <hr style={{ borderColor: '#ff00ff', marginBottom: '10px' }} />
      {pcList.map(pc => (
        <div 
          key={pc.name} 
          className={`pc-option ${pc.name === selectedPC ? 'selected' : ''}`}
          onClick={() => onSelectPC(pc)}
        >
          {pc.number}. {pc.name}
        </div>
      ))}
    </motion.div>
  );
};

export default PCList;