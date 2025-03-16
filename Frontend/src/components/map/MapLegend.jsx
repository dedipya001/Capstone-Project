import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/mapStyles.css';

const MapLegend = () => {
  const legendItems = [
    { color: '#00aa44', label: 'States' },
    { color: '#440044', label: 'Parliamentary Constituencies' },
    { color: '#ff00ff', label: 'Selected PC' },
    { color: '#00ff00', label: 'Search Location' }
  ];

  return (
    <motion.div
      className="map-legend"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h4>Map Legend</h4>
      {legendItems.map((item, index) => (
        <div key={index} className="legend-item">
          <div className="legend-color" style={{ background: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </motion.div>
  );
};

export default MapLegend;