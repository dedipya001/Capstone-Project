import React, { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import StatsSummary from './StatsSummary';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import '../../styles/dashboardStyles.css';

const Dashboard = () => {
  const { addToast } = useToast();
  
  useEffect(() => {
    // Welcome toast when dashboard loads
    addToast('Welcome to the Electoral Data Dashboard', 'info');
    
    // Simulate system notifications
    const timer = setTimeout(() => {
      addToast('New boundary data available for Madhya Pradesh', 'success');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [addToast]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="last-updated">Last updated: March 16, 2025 - 12:04 UTC</p>
      </div>
      
      <StatsSummary />
      
      <div className="dashboard-grid">
        <div className="dashboard-column">
          <RecentActivity />
        </div>
        <div className="dashboard-column">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;