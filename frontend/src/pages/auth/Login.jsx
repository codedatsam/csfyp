// ==========================================
// LOGIN PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: User login interface
// ==========================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Loader2, Sparkles, Heart, Coffee } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await login(formData);
      
      if (response.success) {
        toast.success('Login successful! Welcome back! 🎉');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if it's an unverified email error
      if (error.error && error.error.includes('verify your email')) {
        toast.error('Please verify your email first');
        // Redirect to verification page
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.error(error.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            Husleflow
          </h1>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to continue your hustle
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@university.ac.uk"
                />
              </div>
              {errors.email && (
                <p className="error-text">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="link">
                    Forgot password?
                </Link>
              </div>
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
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="link font-semibold">
                Join the hustle
              </Link>
            </p>
          </div>
        </div>

        {/* Creative Footer */}
        <footer className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
              <span>&</span>
              <Coffee className="h-3 w-3 text-amber-600" />
              <span>by students, for students</span>
            </div>
            <div className="flex items-center space-x-1 text-primary-600 text-sm">
              <Sparkles className="h-3 w-3" />
              <span className="font-semibold">Husleflow</span>
              <Sparkles className="h-3 w-3" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Login;