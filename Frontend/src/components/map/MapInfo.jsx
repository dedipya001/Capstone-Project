import React from 'react';

const MapInfo = ({ onClose }) => {
  return (
    <div className="map-info-panel">
      <div className="info-header">
        <h2>About Vijayawada Map</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="info-content">
        <p>
          Vijayawada is the second largest city in the Indian state of Andhra Pradesh. 
          This interactive map highlights key landmarks, historical sites, and points of interest 
          throughout the city.
        </p>
        
        <h3>How to Use This Map</h3>
        <ul>
          <li><strong>Click on markers</strong> to see details about each location</li>
          <li><strong>Use the filter buttons</strong> to show specific types of landmarks</li>
          <li><strong>Search</strong> for specific places in Vijayawada</li>
          <li><strong>Reset view</strong> to return to the default city overview</li>
        </ul>
        
        <h3>About Vijayawada</h3>
        <p>
          Vijayawada, situated on the banks of the Krishna River, is a major commercial and 
          cultural center of Andhra Pradesh. Known for its rich history, religious significance, 
          and as an educational hub, the city offers diverse attractions for visitors and residents alike.
        </p>
        
        <div className="city-stats">
          <div className="stat-item">
            <span className="stat-value">1.1 million+</span>
            <span className="stat-label">Population</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">61 km²</span>
            <span className="stat-label">Area</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">1888</span>
            <span className="stat-label">Established as Municipality</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapInfo;