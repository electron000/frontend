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
   * Handles the form submission by calling the backend API.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call your Python backend API endpoint
      const response = await fetch('https://backend-2m6l.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // Send username and password
      });

      const data = await response.json();

      if (response.ok) {
        // If login is successful (status 200)
        console.log('Login successful:', data.message);
        onLogin(); // Trigger the callback passed from the parent component
      } else {
        // If login fails (e.g., status 401), show the error from the backend
        setError(data.error || 'Invalid username or password.');
      }
    } catch (networkError) {
      // Handle network errors (e.g., server is down)
      console.error('Login API call failed:', networkError);
      setError('Could not connect to the server. Please try again later.');
    } finally {
      // This will run after the try/catch block, regardless of the outcome
      setIsLoading(false);
    }
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
        <p className="login-subtitle">Please login to continue</p>
        
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
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
