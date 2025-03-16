import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Dashboard from '../components/dashboard/Dashboard';
import AuthGuard from '../components/common/AuthGuard';
import '../styles/dashboardStyles.css';

const DashboardPage = () => {
  return (
    <AuthGuard>
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-main">
          <Sidebar />
          <div className="dashboard-content">
            <Dashboard />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardPage;