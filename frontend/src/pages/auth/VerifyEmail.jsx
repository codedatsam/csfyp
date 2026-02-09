// ==========================================
// VERIFY EMAIL PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Email verification interface
// ==========================================

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import api from '../../services/api';

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  
  const { updateUser } = useAuth();

  const [email, setEmail] = useState(emailParam || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  // Auto-verify if token in URL
  useEffect(() => {
    if (token) {
      verifyWithToken(token);
    }
  }, [token]);

  const verifyWithToken = async (verificationToken) => {
    setVerifying(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-email', {
        token: verificationToken
      });

      if (response.success) {
        setVerified(true);
        toast.success('Email verified successfully! 🎉');
        
        // Store tokens and user data
        if (response.data.tokens) {
          localStorage.setItem('accessToken', response.data.tokens.accessToken);
          localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          updateUser(response.data.user);
        }

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.error || 'Verification failed. The link may be expired.');
      toast.error(err.error || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!code || code.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-code', {
        email,
        code
      });

      if (response.success) {
        setVerified(true);
        toast.success('Email verified successfully! 🎉');
        
        // Store tokens and user data
        if (response.data.tokens) {
          localStorage.setItem('accessToken', response.data.tokens.accessToken);
          localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          updateUser(response.data.user);
        }

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Code verification error:', err);
      setError(err.error || 'Invalid or expired code');
      toast.error(err.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setResending(true);

    try {
      const response = await api.post('/auth/resend-verification', { email });
      
      if (response.success) {
        toast.success('Verification email sent! Check your inbox.');
      }
    } catch (err) {
      console.error('Resend error:', err);
      toast.error(err.error || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  // Loading state (verifying from URL token)
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verified! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Your account is now active. Redirecting to dashboard...
            </p>
            <Loader2 className="h-6 w-6 text-primary-600 animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Main verification form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            Husleflow
          </h1>
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-gray-600">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Verification Failed</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Code Field */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                className="input text-center text-2xl tracking-widest font-mono"
                placeholder="XXXXXX"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Check your email for the 6-digit code
              </p>
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
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Verify Email
                </>
              )}
            </button>
          </form>

          {/* Resend Email */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the email?
            </p>
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="btn btn-secondary inline-flex items-center"
            >
              {resending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Code
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              📧 Check your spam/junk folder<br/>
              ⏰ Code expires in 24 hours<br/>
              🔄 Request a new code if expired
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link to="/login" className="text-sm link">
            Already verified? Sign in
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          © 2026 Husleflow. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;