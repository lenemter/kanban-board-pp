// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import apiClient from './api';

// Theme mapping
const THEME_CLASSES = {
    1: 'theme-light',
    2: 'theme-dark',
    3: 'theme-dark-purple',
    4: 'theme-amoled',
    5: 'theme-mint',
    6: 'theme-ocean',
    7: 'theme-sunset',
    8: 'theme-nord',
    9: 'theme-rosepine'
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status and load theme on app load
    const checkAuth = async () => {
      try {
        const isValid = await apiClient.checkAuth();
        setIsAuthenticated(isValid);
        
        // Load user theme if authenticated
        if (isValid) {
          try {
            const user = await apiClient.getUserMe();
            applyTheme(user.theme);
          } catch (error) {
            console.error('Failed to load user theme:', error);
            // Apply default theme
            applyTheme(1);
          }
        } else {
          // Apply default theme for unauthenticated users
          applyTheme(1);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        applyTheme(1);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const applyTheme = (themeId) => {
    // Remove all theme classes
    Object.values(THEME_CLASSES).forEach(className => {
      document.documentElement.classList.remove(className);
    });

    // Apply selected theme
    const themeClass = THEME_CLASSES[themeId] || THEME_CLASSES[3];
    document.documentElement.classList.add(themeClass);
    console.log('Applied theme:', themeClass);
  };

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
    
    // Load and apply user theme after login
    try {
      const user = await apiClient.getUserMe();
      applyTheme(user.theme);
    } catch (error) {
      console.error('Failed to load user theme after login:', error);
    }
  };

  const handleLogout = () => {
    apiClient.clearToken();
    setIsAuthenticated(false);
    // Reset to default theme on logout
    applyTheme(1);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: 'var(--color-text-primary)'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <DashboardPage onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/board/:boardId" 
          element={<BoardPage onLogout={handleLogout} />}
        />
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;