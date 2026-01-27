// ==========================================
// EDIT PROFILE PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Edit user profile with avatar
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Loader2,
  Save,
  Heart,
  Coffee,
  Sparkles,
  Camera,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

function EditProfile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        location: user.location || '',
        avatar: user.avatar || ''
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      setAvatarPreview(base64);
      setFormData(prev => ({ ...prev, avatar: base64 }));
    } catch (error) {
      toast.error('Failed to process image');
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setFormData(prev => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      toast.error('First name and last name are required');
      return;
    }

    try {
      setLoading(true);
      
      // Only send non-empty values
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      
      // Only include phone if it has a value
      if (formData.phone && formData.phone.trim()) {
        dataToSend.phone = formData.phone;
      }
      
      // Only include location if it has a value
      if (formData.location && formData.location.trim()) {
        dataToSend.location = formData.location;
      }

      // Include avatar (can be base64 or empty string to remove)
      if (formData.avatar !== user?.avatar) {
        dataToSend.avatar = formData.avatar;
      }
      
      const response = await api.patch('/auth/profile', dataToSend);
      
      if (response.success) {
        toast.success('Profile updated! ✨');
        // Refresh user data in context
        if (refreshUser) {
          await refreshUser();
        }
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Get avatar initials
  const getInitials = () => {
    return `${formData.firstName?.charAt(0) || ''}${formData.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Link */}
          <Link to="/dashboard" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Your Profile ✏️
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-28 h-28 rounded-full object-cover border-4 border-primary-200"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-primary-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-primary-200">
                      {getInitials()}
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                
                <p className="text-xs text-gray-500 mt-2">
                  Click the camera icon to upload a photo (max 2MB)
                </p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input pl-10 w-full"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input pl-10 w-full"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="input pl-10 w-full bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+44 7xxx xxxxxx"
                    className="input pl-10 w-full"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Hatfield, London"
                    className="input pl-10 w-full"
                  />
                </div>
              </div>

              {/* Account Type (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  user?.role === 'PROVIDER' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role === 'PROVIDER' ? '💼 Service Provider' : '🎓 Student'}
                </div>
                <p className="text-xs text-gray-500 mt-1">All users can both book and offer services</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <Link to="/dashboard" className="flex-1 btn btn-secondary text-center">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn btn-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container-custom py-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>&</span>
              <Coffee className="h-4 w-4 text-amber-600" />
              <span>by students, for students</span>
            </div>
            <div className="flex items-center space-x-1 text-primary-600">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold">Husleflow</span>
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-xs text-gray-400">© 2026 Husleflow</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default EditProfile;
