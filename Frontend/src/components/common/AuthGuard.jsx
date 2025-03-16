import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking auth
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default AuthGuard;