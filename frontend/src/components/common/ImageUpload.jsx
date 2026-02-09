// ==========================================
// IMAGE UPLOAD COMPONENT
// ==========================================
// Handles image upload to Cloudinary via backend
// ==========================================

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

function ImageUpload({ 
  value, 
  onChange, 
  type = 'service', // 'profile', 'service', 'business'
  placeholder = 'Upload Image',
  className = '',
  previewSize = 'md' // 'sm', 'md', 'lg'
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      setPreview(base64);
      
      // Upload to Cloudinary via backend
      try {
        setUploading(true);
        const response = await api.post(`/upload/${type}`, { image: base64 });
        
        if (response.success && response.data?.url) {
          setPreview(response.data.url);
          onChange(response.data.url);
          toast.success('Image uploaded successfully');
        } else {
          toast.error(response.error || 'Upload failed');
          setPreview(value || '');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        setPreview(value || '');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id={`image-upload-${type}`}
      />
      
      {preview ? (
        <div className={`relative ${sizeClasses[previewSize]} rounded-lg overflow-hidden border-2 border-gray-200`}>
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <label
          htmlFor={`image-upload-${type}`}
          className={`${sizeClasses[previewSize]} flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors`}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500 text-center px-2">{placeholder}</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}

export default ImageUpload;
