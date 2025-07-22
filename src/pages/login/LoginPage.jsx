import React, { useState } from 'react';
import './LoginPage.css';
import ongcLogo from '../../assets/ongc-logo.png';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data.message);
        onLogin();
      } else {
        setError(data.error || 'Invalid username or password.');
      }
    } catch (networkError) {
      console.error('Login API call failed:', networkError);
      setError('Could not connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ongc-login-container">
      <div className="ongc-login-left-panel">
        <img
          src={ongcLogo}
          alt="ONGC Logo"
          className="ongc-login-logo"
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x50/ffffff/000000?text=ONGC'; }}
        />
        <h1 className="ongc-login-main-heading">Contracts Management System</h1>
        <p className="ongc-login-description">ONGC's Central Hub for Managing Contracts</p>
      </div>

      <div className="ongc-login-right-form">
        <h2 className="ongc-login-sub-heading">User Login</h2>
        <p className="ongc-login-sub-description">Please enter your credentials to continue</p>

        <form onSubmit={handleSubmit} className="ongc-login-form">
          <div className="ongc-input-group">
            <span className="ongc-input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </span>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>

          <div className="ongc-input-group">
            <span className="ongc-input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>

          {error && <p id="error-message" className="ongc-login-error-message">{error}</p>}

          <button type="submit" className="ongc-login-submit-button" disabled={isLoading}>
            {isLoading ? <span className="ongc-login-spinner"></span> : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;