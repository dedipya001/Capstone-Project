import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import '../../styles/dashboardStyles.css';

const QuickActions = () => {
  const actions = [
    {
      icon: '🗺️',
      title: 'Geological Map',
      description: 'View and analyze the Geological map data',
      path: '/map',
      primary: true
    },
    {
      icon: '📤',
      title: 'Export Data',
      description: 'Export electoral data in various formats',
      path: '/export',
    },
    {
      icon: '🔍',
      title: 'Search Constituencies',
      description: 'Find and filter constituencies by criteria',
      path: '/search',
    },
    {
      icon: '📝',
      title: 'Report Issue',
      description: 'Report data errors or map inaccuracies',
      path: '/report',
    }
  ];

  return (
    <Card title="Quick Actions" className="quick-actions">
      <div className="actions-grid">
        {actions.map((action, index) => (
          <Link 
            to={action.path} 
            key={index} 
            className={`action-card ${action.primary ? 'primary' : ''}`}
          >
            <div className="action-icon">{action.icon}</div>
            <h4 className="action-title">{action.title}</h4>
            <p className="action-description">{action.description}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;