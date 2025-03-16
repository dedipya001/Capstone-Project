import React from 'react';
import Card from '../common/Card';
import '../../styles/dashboardStyles.css';

const RecentActivity = () => {
  // Mock data - will be replaced with actual API data
  const activities = [
    {
      id: 1,
      type: 'update',
      description: 'Data updated for West Bengal constituencies',
      user: 'Amit Shah',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'error',
      description: 'Boundary error reported in Tamil Nadu map',
      user: 'System Alert',
      time: '5 hours ago'
    },
    {
      id: 3,
      type: 'new',
      description: 'New demographic data added for Karnataka',
      user: 'Rahul Gandhi',
      time: '1 day ago'
    },
    {
      id: 4,
      type: 'access',
      description: 'New user "data_analyst1" granted access',
      user: 'Admin',
      time: '2 days ago'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'update': return '🔄';
      case 'error': return '⚠️';
      case 'new': return '✨';
      case 'access': return '🔑';
      default: return '📝';
    }
  };

  return (
    <Card title="Recent Activity" className="recent-activity">
      <ul className="activity-list">
        {activities.map(activity => (
          <li key={activity.id} className={`activity-item activity-${activity.type}`}>
            <div className="activity-icon">{getActivityIcon(activity.type)}</div>
            <div className="activity-details">
              <p className="activity-description">{activity.description}</p>
              <div className="activity-meta">
                <span className="activity-user">{activity.user}</span>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button className="view-all-button">View All Activity</button>
    </Card>
  );
};

export default RecentActivity;