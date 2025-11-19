import React, { useState } from 'react';
import apiClient from '../api';
import { Mail, KeyRound, User, ChevronLeft } from 'lucide-react';

/**
 * Компонент страницы входа и регистрации.
 * @param {function} onLoginSuccess
 */
function AuthPage({ onLoginSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const viewTitle = isLoginView ? 'Kanban-Board' : 'Create Account';
  
  const clearForm = () => {
    setEmail('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleSwitch = () => {
    clearForm();
    setIsLoginView(!isLoginView);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginView) {
        // Логика входа, используем метод login из API клиента
        await apiClient.login(email, password);
        onLoginSuccess();
      } else {
        // Логика регистрации, используем метод register из API клиента
        if (password !== confirmPassword) {
          setError('Пароли не совпадают.');
          setIsLoading(false);
          return;
        }
        
        // API-клиент register принимает email, name и password. 
        // Имя делаем опциональным (пока что)
        await apiClient.register(email, name || email.split('@')[0], password);
        
        alert('Регистрация прошла успешно! Пожалуйста, подтвердите вашу почту.');
        handleSwitch(); // Переключаемся на форму входа
      }
    } catch (err) {
      setError(err.message || 'Произошла непредвиденная ошибка.');
    } finally {
      setIsLoading(false);
    }
  };

  const LoginForm = (
    <form onSubmit={handleSubmit}>
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
      />

      {error && <p className="error-message">{error}</p>}

      <div className="modal-actions-col">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Вход...' : 'Login'}
        </button>
        <button type="button" className="btn-link" onClick={handleSwitch}>
          No account? Register
        </button>
      </div>
    </form>
  );

  const RegisterForm = (
    <form onSubmit={handleSubmit}>
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
      />

      <label htmlFor="reg-name">
        <User size={16} /> Name
      </label>
      <input 
        id="reg-name" 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Your Name"
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
      />

      {error && <p className="error-message">{error}</p>}

      <div className="modal-actions-col">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Регистрация...' : 'Register'}
        </button>
        <button type="button" className="btn-link" onClick={handleSwitch}>
          <ChevronLeft size={14} /> Back to Login
        </button>
      </div>
    </form>
  );

  return (
    <div className="auth-page-container">
      <div className="auth-modal">
        <h3>{viewTitle}</h3>
        {isLoginView ? LoginForm : RegisterForm}
      </div>
    </div>
  );
}

export default AuthPage;