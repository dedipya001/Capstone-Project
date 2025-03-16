// src/components/dashboard/Dashboard.jsx
import React, { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import StatsSummary from './StatsSummary';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import '../../styles/dashboardStyles.css';

const Dashboard = () => {
  const { addToast } = useToast();
  
  useEffect(() => {
    // Welcome toast when dashboard loads - only once per session
    addToast(
      'Welcome to the Electoral Data Dashboard', 
      'info',
      5000,
      { once: true, id: 'dashboard-welcome' }
    );
    
    // Simulate system notifications - this will show each time
    const timer = setTimeout(() => {
      addToast('New boundary data available for Madhya Pradesh', 'success');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs only once on mount

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