import React, { useState, useCallback, useMemo } from 'react';
import apiClient from '../api';
import { Mail, KeyRound, User, ChevronLeft, LogIn, UserPlus } from 'lucide-react';

// =======================================
// Form Subcomponents
// =======================================

/**
 *  Login form component
 */
const LoginForm = ({ email, password, setEmail, setPassword, error, isLoading, handleSwitch }) => (
  <form>
    <label htmlFor="email">
      <Mail size={16} /> Email
    </label>
    <input 
      id="email" 
      type="email" 
      value={email} 
      onChange={(e) => setEmail(e.target.value)} 
      required 
      placeholder="your@email.com"
      autoComplete="email"
    />
    
    <label htmlFor="password">
      <KeyRound size={16} /> Password
    </label>
    <input 
      id="password" 
      type="password" 
      value={password} 
      onChange={(e) => setPassword(e.target.value)} 
      required
      placeholder="••••••••"
      autoComplete="current-password"
    />

    {error && <p className="error-message">{error}</p>}

    <div className="modal-actions-col">
      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        <LogIn size={18} /> {isLoading ? 'Logging in...' : 'Login'}
      </button>
      <button type="button" className="btn-link" onClick={handleSwitch}>
        No account? Register
      </button>
    </div>
  </form>
);

/**
 * Register form component
 */
const RegisterForm = ({ email, name, password, confirmPassword, setEmail, setName, setPassword, setConfirmPassword, error, isLoading, handleSwitch }) => (
  <form>
    <label htmlFor="reg-email">
      <Mail size={16} /> Email
    </label>
    <input 
      id="reg-email" 
      type="email" 
      value={email} 
      onChange={(e) => setEmail(e.target.value)} 
      required 
      placeholder="your@email.com"
      autoComplete="email"
    />

    <label htmlFor="reg-name">
      <User size={16} /> Name (Optional)
    </label>
    <input 
      id="reg-name" 
      type="text" 
      value={name} 
      onChange={(e) => setName(e.target.value)} 
      placeholder="Your Name"
      autoComplete="name"
    />
    
    <label htmlFor="reg-password">
      <KeyRound size={16} /> Password
    </label>
    <input 
      id="reg-password" 
      type="password" 
      value={password} 
      onChange={(e) => setPassword(e.target.value)} 
      required
      placeholder="••••••••"
      autoComplete="new-password"
    />

    <label htmlFor="confirm-password">
      <KeyRound size={16} /> Confirm Password
    </label>
    <input 
      id="confirm-password" 
      type="password" 
      value={confirmPassword} 
      onChange={(e) => setConfirmPassword(e.target.value)} 
      required
      placeholder="••••••••"
      autoComplete="new-password"
    />

    {error && <p className="error-message">{error}</p>}

    <div className="modal-actions-col">
      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        <UserPlus size={18} /> {isLoading ? 'Registering...' : 'Register'}
      </button>
      <button type="button" className="btn-link" onClick={handleSwitch}>
        <ChevronLeft size={14} /> Back to Login
      </button>
    </div>
  </form>
);

// =======================================
// Main AuthPage Component
// =======================================

/**
 * Component for the login and registration page.
 * Manages authentication state and logic.
 * @param {function} onLoginSuccess - callback on successful login.
 */
function AuthPage({ onLoginSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use useMemo to cache the title
  const viewTitle = useMemo(() => isLoginView ? 'Kanban-Board Login' : 'Create Account', [isLoginView]);
  
  // useCallback to cache functions
  const clearForm = useCallback(() => {
    setEmail('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  }, []);

  const handleSwitch = useCallback(() => {
    clearForm();
    setIsLoginView(prev => !prev);
  }, [clearForm]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic check for required fields
    if (!email || !password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }
    
    try {
      if (isLoginView) {
        // Login logic
        await apiClient.login(email, password);
        onLoginSuccess();
      } else {
        // Registration logic
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsLoading(false);
          return;
        }
        
        // Prevent sending empty name if not filled
        const username = name.trim() || email.split('@')[0];

        await apiClient.register(email, username, password);
        
        alert('Registration successful! Please log in now.');
        handleSwitch(); // Switch to login form
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, name, password, confirmPassword, isLoginView, onLoginSuccess, handleSwitch]);


  const formProps = {
    email,
    name,
    password,
    confirmPassword,
    setEmail,
    setName,
    setPassword,
    setConfirmPassword,
    error,
    isLoading,
    handleSwitch,
  };

  return (
    <div className="auth-page-container">
      <div className="auth-modal">
        <h3>{viewTitle}</h3>
        <div onSubmit={handleSubmit}>
          {isLoginView ? (
            <LoginForm {...formProps} />
          ) : (
            <RegisterForm {...formProps} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;