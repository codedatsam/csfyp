// ==========================================
// REGISTER PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: User registration interface
// ==========================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Loader2, Sparkles, Heart, Coffee, X } from 'lucide-react';
import api from '../../services/api';

// All available UK locations
const UK_LOCATIONS = [
  // Major Cities
  'London',
  'Manchester',
  'Birmingham',
  'Leeds',
  'Liverpool',
  'Bristol',
  'Sheffield',
  'Newcastle',
  'Nottingham',
  'Leicester',
  // Major Cities
  'Hatfield',
  'St Albans',
  'Cambridge',
  'Oxford',
  'Brighton',
  'Southampton',
  'Reading',
  'Coventry',
  'Cardiff',
  'Edinburgh',
  'Glasgow',
  'Belfast',
  'York',
  'Bath',
  'Durham',
  'Exeter',
  'Norwich',
  'Warwick',
  'Lancaster',
  'Loughborough',
  // More Locations
  'Welwyn Garden City',
  'Stevenage',
  'Watford',
  'Hemel Hempstead',
  'Hertford',
  'Bishops Stortford',
  // Other
  'Other'
].sort();

function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CLIENT',
    location: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain a number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = 'Password must contain special character';
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // First name
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    // Last name
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Location validation (now required)
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    // Terms validation
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms and Conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      const { confirmPassword, ...registrationData } = formData;
      
      const response = await api.post('/auth/register', registrationData);
      
      if (response.success) {
        toast.success('Registration successful! Please check your email to verify your account.');
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        toast.error(error.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-2/5 relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200')"
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-purple-700/90" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-5xl font-bold mb-6">Husleflow</h1>
          <p className="text-xl text-white/80 text-center max-w-md mb-8">
            Join our community of service providers and customers.
          </p>
          
          {/* Features */}
          <div className="space-y-4 w-full max-w-xs">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-white/20 p-2 rounded-lg">✨</div>
              <div>
                <p className="font-medium">Easy Booking</p>
                <p className="text-sm text-white/70">Book services in seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-white/20 p-2 rounded-lg">🛡️</div>
              <div>
                <p className="font-medium">Verified Providers</p>
                <p className="text-sm text-white/70">Trusted professionals</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="bg-white/20 p-2 rounded-lg">💰</div>
              <div>
                <p className="font-medium">Earn Money</p>
                <p className="text-sm text-white/70">Offer your services</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-600 mb-2 lg:hidden">
              Husleflow
            </h1>
            <h2 className="text-3xl font-bold text-gray-900">
              Create Your Account
            </h2>
            <p className="mt-2 text-gray-600">
              Join thousands of users buying and selling services
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.firstName ? 'input-error' : ''}`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="error-text">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.lastName ? 'input-error' : ''}`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p className="error-text">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
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
                  placeholder="you@email.com"
                />
              </div>
              {errors.email && (
                <p className="error-text">{errors.email}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="error-text">{errors.password}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Min 8 chars, uppercase, lowercase, number, special char
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
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
            </div>

            {/* Phone & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="+44 7700 900123"
                  />
                </div>
              </div>

              {/* Location - Now Required with Dropdown */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.location ? 'input-error' : ''}`}
                  >
                    <option value="">Select your location</option>
                    {UK_LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                {errors.location && (
                  <p className="error-text">{errors.location}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (errors.terms) {
                      setErrors(prev => ({ ...prev, terms: '' }));
                    }
                  }}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <button 
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Terms and Conditions
                  </button>{' '}
                  and{' '}
                  <button 
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {errors.terms && (
                <p className="error-text mt-1">{errors.terms}</p>
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
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="link font-semibold">
                Sign in
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

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Terms and Conditions</h2>
              <button onClick={() => setShowTermsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] prose prose-sm">
              <p className="text-sm text-gray-500 mb-4">Last updated: January 2025</p>
              
              <h3 className="font-semibold text-gray-900">1. Acceptance of Terms</h3>
              <p className="text-gray-600">
                By creating an account and using Husleflow, you agree to be bound by these Terms and Conditions. 
                If you do not agree to these terms, please do not use our platform.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4">2. Description of Service</h3>
              <p className="text-gray-600">
                Husleflow is a peer-to-peer marketplace that connects service providers with customers 
                seeking services. We provide the platform for these connections but are not a party to any 
                agreements between users.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4">3. User Accounts</h3>
              <p className="text-gray-600">
                You must provide accurate, complete, and current information when creating an account. You are 
                responsible for maintaining the confidentiality of your account credentials and for all activities 
                under your account.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4">4. User Conduct</h3>
              <p className="text-gray-600">You agree not to:</p>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Post false, misleading, or fraudulent content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use the platform for any illegal activities</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>

              <h3 className="font-semibold text-gray-900 mt-4">5. Services and Bookings</h3>
              <p className="text-gray-600">
                Service providers are solely responsible for the services they offer, including quality, safety, 
                and legality. Husleflow does not guarantee the quality or outcome of any services booked through 
                the platform. Users engage with each other at their own risk.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4">6. Payments and Fees</h3>
              <p className="text-gray-600">
                All payments and financial arrangements are made directly between users. Husleflow may introduce 
                payment processing features in the future, which will be subject to additional terms.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4">7. Cancellations and Refunds</h3>
              <p className="text-gray-600">
                Cancellation and refund policies are determined by individual service providers. We encourage 
                users to clearly communicate their policies. Husleflow is not responsible for any disputes 
                regarding cancellations or refunds.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4">8. Intellectual Property</h3>
              <p className="text-gray-600">
                All content and materials on Husleflow, including logos, designs, and software, are owned by 
                Husleflow or its licensors. You may not copy, modify, or distribute our content without permission.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4">9. Limitation of Liability</h3>
              <p className="text-gray-600">
                Husleflow is provided "as is" without warranties of any kind. We are not liable for any damages 
                arising from your use of the platform, including but not limited to direct, indirect, incidental, 
                or consequential damages.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4">10. Privacy Policy</h3>
              <p className="text-gray-600">
                Your privacy is important to us. By using Husleflow, you consent to the collection and use of 
                your information as described in our Privacy Policy. We collect personal information (name, email, 
                location) to provide our services and may use cookies to improve your experience.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4">11. Account Termination</h3>
              <p className="text-gray-600">
                We reserve the right to suspend or terminate your account at any time for violations of these 
                terms or for any other reason at our discretion. You may also delete your account at any time 
                through your account settings.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4">12. Changes to Terms</h3>
              <p className="text-gray-600">
                We may update these terms from time to time. Continued use of the platform after changes 
                constitutes acceptance of the new terms. We will notify users of significant changes via email 
                or platform notification.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4">13. Contact Us</h3>
              <p className="text-gray-600">
                If you have questions about these Terms and Conditions, please contact us at support@husleflow.com
              </p>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowTermsModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                  setErrors(prev => ({ ...prev, terms: '' }));
                }}
                className="btn btn-primary"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
