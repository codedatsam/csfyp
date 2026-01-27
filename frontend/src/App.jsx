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

// Services Pages
import BrowseServices from './pages/services/BrowseServices';
import ServiceDetail from './pages/services/ServiceDetail';
import MyServices from './pages/services/MyServices';

// Bookings Pages
import MyBookings from './pages/bookings/MyBookings';

// Messages disabled for now
// import Messages from './pages/messages/Messages';

// Profile Pages
import EditProfile from './pages/profile/EditProfile';

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

      {/* Services Routes (Public) */}
      <Route path="/services" element={<BrowseServices />} />
      <Route path="/services/:id" element={<ServiceDetail />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* My Services (Provider) */}
      <Route
        path="/dashboard/my-services"
        element={
          <ProtectedRoute>
            <MyServices />
          </ProtectedRoute>
        }
      />

      {/* My Bookings */}
      <Route
        path="/dashboard/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      {/* Edit Profile */}
      <Route
        path="/dashboard/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      {/* Messages disabled for now */}

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;