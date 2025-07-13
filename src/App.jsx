import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Leaderboard from './pages/ongc-contracts/Leaderboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routing to /ongc-contacts */}
        <Route path="/ongc-contracts" element={<Leaderboard />} />
        {/* Redirecting any other route to /ongc-contacts */}
        <Route path="*" element={<Navigate to="/ongc-contracts" replace />} />
      </Routes>
    </Router>
  );
}

export default App;