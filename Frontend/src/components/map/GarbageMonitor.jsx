// src/components/map/GarbageMonitor.jsx
import React, { useState } from 'react';

const GarbageMonitor = ({ garbagePoints, stats, onClose, onPointSelect }) => {
  const [filterStatus, setFilterStatus] = useState(null);

  // Filter points by status if a status filter is active
  const filteredPoints = filterStatus 
    ? garbagePoints.filter(point => point.status === filterStatus)
    : garbagePoints;

  // Sort points by fill level descending
  const sortedPoints = [...filteredPoints].sort((a, b) => b.fillLevel - a.fillLevel);

  // Format date to user-friendly string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // Check if the date is today
    if (date.setHours(0,0,0,0) === today.setHours(0,0,0,0)) {
      return `Today, ${new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    
    // Check if the date is yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.setHours(0,0,0,0) === yesterday.setHours(0,0,0,0)) {
      return `Yesterday, ${new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    
    // Otherwise return full date
    return new Date(dateString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="garbage-monitor-panel">
      <div className="monitor-header">
        <h2>
          <span className="monitor-icon">🗑️</span>
          Garbage Collection Monitor
        </h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="monitor-stats">
        <div className="monitor-stat">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Points</div>
        </div>
        <div className="monitor-stat normal">
          <div className="stat-value">{stats.normal}</div>
          <div className="stat-label">Normal</div>
        </div>
        <div className="monitor-stat attention">
          <div className="stat-value">{stats.attention}</div>
          <div className="stat-label">Attention</div>
        </div>
        <div className="monitor-stat critical">
          <div className="stat-value">{stats.critical}</div>
          <div className="stat-label">Critical</div>
        </div>
        <div className="monitor-stat">
          <div className="stat-value">{stats.averageFillLevel}%</div>
          <div className="stat-label">Avg. Fill</div>
        </div>
      </div>

      <div className="monitor-filters">
        <button
          className={`filter-pill ${filterStatus === null ? 'active' : ''}`}
          onClick={() => setFilterStatus(null)}
        >
          All Points
        </button>
        <button
          className={`filter-pill normal ${filterStatus === 'normal' ? 'active' : ''}`}
          onClick={() => setFilterStatus('normal')}
        >
          Normal
        </button>
        <button
          className={`filter-pill attention ${filterStatus === 'attention' ? 'active' : ''}`}
          onClick={() => setFilterStatus('attention')}
        >
          Attention
        </button>
        <button
          className={`filter-pill critical ${filterStatus === 'critical' ? 'active' : ''}`}
          onClick={() => setFilterStatus('critical')}
        >
          Critical
        </button>
      </div>

      <div className="monitor-points-container">
        <h3>Collection Points {filterStatus ? `(${filterStatus})` : ''}</h3>
        <div className="monitor-points-list">
          {sortedPoints.map(point => (
            <div 
              key={point.id} 
              className={`point-card ${point.status}`}
              onClick={() => onPointSelect(point)}
            >
              <div className="point-header">
                <h4>{point.name}</h4>
                <span className={`point-status ${point.status}`}>
                  {point.status}
                </span>
              </div>
              <div className="point-details">
                <div className="fill-bar-container">
                  <div 
                    className={`fill-bar ${point.status}`}
                    style={{ width: `${point.fillLevel}%` }}
                  ></div>
                  <span className="fill-text">{point.fillLevel}% Full</span>
                </div>
                <div className="point-meta">
                  <div className="point-address">{point.address}</div>
                  <div className="point-time">
                    Last collection: {formatDate(point.lastCollected)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {sortedPoints.length === 0 && (
            <div className="no-points-message">
              No collection points matching the current filter
            </div>
          )}
        </div>
      </div>

      <div className="monitor-footer">
        <button className="action-button schedule-button">
          <span className="action-icon">📅</span> Schedule Collections
        </button>
        <button className="action-button report-button">
          <span className="action-icon">📊</span> Generate Report
        </button>
      </div>
    </div>
  );
};

export default GarbageMonitor;