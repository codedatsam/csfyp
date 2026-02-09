// ==========================================
// LOGIN PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: User login interface
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateLoginForm } from '../../utils/validators';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Loader2, Sparkles, Heart, Coffee } from 'lucide-react';

// Error codes from backend
const ERROR_CODES = {
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS'
};

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form using extracted validator
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });
      
      if (response.success) {
        // Handle remember me - store preference
        if (formData.rememberMe) {
          localStorage.setItem('rememberEmail', formData.email);
        } else {
          localStorage.removeItem('rememberEmail');
        }
        
        toast.success('Login successful! Welcome back! 🎉');
        // Navigation handled by AuthContext or useEffect above
      }
    } catch (error) {
      // Only update state if still mounted
      if (!isMounted.current) return;
      
      console.error('Login error:', error);
      
      // Handle specific error codes
      switch (error.code) {
        case ERROR_CODES.EMAIL_NOT_VERIFIED:
          toast.error('Please verify your email first');
          navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
          break;
        case ERROR_CODES.ACCOUNT_DEACTIVATED:
          toast.error('Your account has been deactivated. Please contact support.');
          break;
        case ERROR_CODES.INVALID_CREDENTIALS:
          toast.error('Invalid email or password');
          setErrors({ password: 'Invalid email or password' });
          break;
        default:
          toast.error(error.error || 'Login failed. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200')"
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-purple-700/90" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-5xl font-bold mb-6">Husleflow</h1>
          <p className="text-xl text-white/80 text-center max-w-md">
            Connect with trusted professionals and book services instantly.
          </p>
          
          {/* Floating Stats */}
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-white/70">Happy Customers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">100+</p>
              <p className="text-sm text-white/70">Service Providers</p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-sm">
            <p className="text-white/90 italic">"Found an amazing hair stylist through Husleflow. Booking was so easy!"</p>
            <p className="text-white/60 text-sm mt-2">— Sarah M.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-600 mb-2 lg:hidden">
              Husleflow
            </h1>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600">
              Sign in to continue
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                    placeholder="you@email.com"
                  />
                </div>
                {errors.email && (
                  <p id="email-error" role="alert" className="error-text">{errors.email}</p>
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
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className={`input pl-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p id="password-error" role="alert" className="error-text">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
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
                className="btn btn-primary w-full flex items-center justify-center py-3"
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
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
              <span>&</span>
              <Coffee className="h-3 w-3 text-amber-600" />
              <span>by Husleflow</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default Login;
