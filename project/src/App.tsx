import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ModernApp } from './components/modern/ModernApp';
import { ModernAdminLogin } from './components/modern/ModernAdminLogin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<ModernAdminLogin />} />
          <Route path="/*" element={<ModernApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;