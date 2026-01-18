// ==========================================
// MAIN APP COMPONENT
// ==========================================
// Author: Samson Fabiyi
// Description: Main app with routing
// ==========================================

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import VerifyEmail from './pages/auth/VerifyEmail';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
  {/* Public Routes */}
  <Route 
    path="/" 
    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} 
  />
  <Route 
    path="/login" 
    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
  />
  <Route 
    path="/register" 
    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
  />
  
  {/* Email Verification */}
  <Route path="/verify-email" element={<VerifyEmail />} />
  
  {/* Password Reset Routes */}
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />

  {/* Protected Routes */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  {/* 404 */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

    
  );
}

export default App;