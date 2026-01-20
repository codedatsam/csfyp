// ==========================================
// RESET PASSWORD PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Reset password with token
// ==========================================

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, CheckCircle, Loader2, XCircle } from 'lucide-react';
import api from '../../services/api';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      return;
    }

    try {
      const response = await api.get(`/auth/verify-reset-token/${token}`);
      
      if (response.success) {
        setTokenValid(true);
        setEmail(response.data.email);
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setTokenValid(false);
      toast.error('Invalid or expired reset link');
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase letter';
    } else if (!/[a-z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain lowercase letter';
    } else if (!/[0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain a number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain special character';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword: formData.newPassword
      });
      
      if (response.success) {
        setSuccess(true);
        toast.success('Password reset successful! 🎉');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.errors) {
        error.errors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        toast.error(error.error || 'Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. 
              Please request a new one.
            </p>
            <Link to="/forgot-password" className="btn btn-primary w-full mb-3">
              Request New Link
            </Link>
            <Link to="/login" className="btn btn-secondary w-full">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. 
              Redirecting to login...
            </p>
            <Link to="/login" className="btn btn-primary w-full">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            Husleflow
          </h1>
          <h2 className="text-3xl font-bold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-gray-600">
            Resetting password for: <strong>{email}</strong>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.newPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.newPassword && (
                <p className="error-text">{errors.newPassword}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must be 8+ characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="error-text">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;