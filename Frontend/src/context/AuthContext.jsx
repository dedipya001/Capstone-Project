import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulated auth for now - will be replaced with actual implementation
  const login = (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Hardcoded for demo
        if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
          const user = {
            id: 1,
            name: 'Admin User',
            email: credentials.email,
            role: 'admin',
            avatar: 'https://i.pravatar.cc/150?u=admin@example.com'
          };
          
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
          resolve(user);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Check for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);