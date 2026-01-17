// ==========================================
// FORGOT PASSWORD PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Request password reset
// ==========================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send, Loader2 } from 'lucide-react';
import api from '../../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.success) {
        setSubmitted(true);
        toast.success('Password reset instructions sent!');
        
        // In development, show the reset URL
        if (response.data?.resetUrl) {
          setResetUrl(response.data.resetUrl);
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      // Don't reveal if email exists or not
      setSubmitted(true);
      toast.success('If that email exists, instructions have been sent');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600">
                If an account exists for <strong>{email}</strong>, you will receive 
                password reset instructions shortly.
              </p>
            </div>

            {/* Development Only - Show Reset URL */}
            {resetUrl && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-xs font-semibold text-yellow-800 mb-2">
                  🔧 DEVELOPMENT MODE - Reset URL:
                </p>
                <a 
                  href={resetUrl}
                  className="text-sm text-primary-600 hover:text-primary-700 break-all"
                >
                  {resetUrl}
                </a>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                📧 Check your email inbox (and spam folder)
              </p>
              <p className="text-sm text-gray-600">
                🔗 Click the reset link in the email
              </p>
              <p className="text-sm text-gray-600">
                ⏰ Link expires in 1 hour
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link to="/login" className="btn btn-secondary w-full flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            Hustleflow
          </h1>
          <h2 className="text-3xl font-bold text-gray-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-gray-600">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {/* Form */}
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                />
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
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm link flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Remember your password?{' '}
          <Link to="/login" className="link font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;