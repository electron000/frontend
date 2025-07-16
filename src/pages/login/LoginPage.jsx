import React, { useState } from 'react';
import './LoginPage.css'; // Make sure to create and link this CSS file

// It's better to import the logo, but a URL is used here for simplicity.
const ONGC_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/ONGC_Logo.svg/1200px-ONGC_Logo.svg.png';

/**
 * A reusable login page component with an enhanced design.
 * @param {object} props - The component props.
 * @param {function} props.onLogin - A callback function that is executed on successful login.
 */
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the form submission process.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a network request for authentication.
    setTimeout(() => {
      // --- IMPORTANT ---
      // Replace this hard-coded check with a real API call to your authentication backend.
      if (username === 'admin' && password === 'password') {
        onLogin(); // Trigger the callback passed from the parent component.
      } else {
        setError('Invalid username or password. Please try again.');
      }
      // -----------------

      setIsLoading(false); // Reset loading state after the check is complete.
    }, 1000);
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <img 
          src={ONGC_LOGO_URL} 
          alt="ONGC Logo" 
          className="login-logo" 
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x50/ffffff/000000?text=ONGC'; }}
        />
        <h2 className="login-title">CONTRACTS MANAGEMENT SYSTEM</h2>
        <p className="login-subtitle">Please sign in to continue</p>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <span className="input-icon">
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
          
          <div className="input-group">
            <span className="input-icon">
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
          
          {error && <p id="error-message" className="login-error-message">{error}</p>}
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
