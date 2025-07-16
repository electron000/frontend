import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Import your page components
import LoginPage from './pages/login/LoginPage'; 
import Leaderboard from './pages/ongc-contracts/Leaderboard';


/**
 * A wrapper component to protect routes that require authentication.
 * If the user is not authenticated, it redirects them to the login page.
 */
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
 * A wrapper for the LoginPage to handle redirection after a successful login.
 */
const LoginWrapper = ({ onLogin }) => {
    const navigate = useNavigate();
    
    const handleLoginSuccess = () => {
        onLogin(); // Set auth state in the main App component
        navigate('/ongc-contracts'); // Redirect to the leaderboard page
    };

    return <LoginPage onLogin={handleLoginSuccess} />;
};

function App() {
  // This state will be the single source of truth for authentication.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // These functions will be passed down to the components to update the state.
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Router>
      <Routes>
        {/* Route 1: The Login Page (public) */}
        <Route path="/login" element={<LoginWrapper onLogin={handleLogin} />} />

        {/* Route 2: The Leaderboard Page (protected) */}
        <Route 
          path="/ongc-contracts" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Leaderboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Route 3: A catch-all redirect. 
            If the user is logged in, it goes to the leaderboard.
            Otherwise, it goes to the login page.
        */}
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated ? "/ongc-contracts" : "/login"} replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
