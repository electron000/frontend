import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/login/LoginPage'; 
import MIS from './pages/management-info-system/MIS';

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
    navigate('/MIS'); 
  };

  return <LoginPage onLogin={handleLoginSuccess} />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<LoginRoute onLogin={handleLogin} />} 
        />

        <Route 
          path="/MIS" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MIS onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated ? "/MIS" : "/login"} replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
