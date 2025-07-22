import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/login/LoginPage'; 
import Leaderboard from './pages/ongc-contracts/Leaderboard';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const LoginRoute = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    onLogin(); 
    navigate('/ongc-contracts'); 
  };

  return <LoginPage onLogin={handleLoginSuccess} />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<LoginRoute onLogin={handleLogin} />} 
        />

        <Route 
          path="/ongc-contracts" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Leaderboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

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