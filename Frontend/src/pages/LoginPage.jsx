import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/components.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();
  
  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(credentials);
      addToast('Successfully logged in!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to log in');
      addToast('Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials helper function
  const fillDemoCredentials = () => {
    setCredentials({
      email: 'admin@example.com',
      password: 'password'
    });
    addToast('Demo credentials filled. Click login to continue.', 'info');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div 
          className="auth-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <img src="/logo.svg" alt="Electoral Data" />
              <h1>Electoral Data</h1>
            </Link>
            <h2>Sign In</h2>
            <p>Access the electoral data dashboard</p>
          </div>
          
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={credentials.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>
            
            <div className="form-action">
              <button 
                type="submit" 
                className="button button-primary button-full-width" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
          
          <div className="auth-links">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          
          <div className="auth-divider">
            <span>OR</span>
          </div>
          
          <div className="auth-alternatives">
            <button 
              className="button button-secondary button-full-width"
              onClick={fillDemoCredentials}
            >
              Use Demo Account
            </button>
            
            <p className="auth-signup">
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="auth-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="auth-info">
            <h2>India's Electoral Data Dashboard</h2>
            <p>Access comprehensive visualization and analysis of electoral boundaries, demographics, and voting patterns across India's parliamentary constituencies.</p>
            <Link to="/" className="button button-outline">
              Learn More
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;