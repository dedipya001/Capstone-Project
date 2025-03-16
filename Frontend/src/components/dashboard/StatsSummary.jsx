import React from 'react';
import Card from '../common/Card';
import '../../styles/dashboardStyles.css';

const StatsSummary = () => {
  // Mock data - will be replaced with actual API data
  const stats = [
    {
      title: 'Total Constituencies',
      value: '543',
      change: '+0',
      changeType: 'neutral',
      icon: '🗳️'
    },
    {
      title: 'Data Coverage',
      value: '93%',
      change: '+2%',
      changeType: 'positive',
      icon: '📊'
    },
    {
      title: 'Errors Reported',
      value: '27',
      change: '-5',
      changeType: 'positive',
      icon: '⚠️'
    },
    {
      title: 'Last Update',
      value: '2h ago',
      change: '',
      changeType: 'neutral',
      icon: '🔄'
    }
  ];

  return (
    <div className="stats-summary">
      {stats.map((stat, index) => (
        <Card key={index} className="stat-card" hoverable>
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-content">
            <h4 className="stat-title">{stat.title}</h4>
            <div className="stat-value">{stat.value}</div>
            {stat.change && (
              <div className={`stat-change ${stat.changeType}`}>
                {stat.change}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsSummary;