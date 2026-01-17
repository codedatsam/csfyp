// ==========================================
// API SERVICE CONFIGURATION
// ==========================================
// Author: Samson Fabiyi
// Description: Axios instance with interceptors
// ==========================================

import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Return error message from server
      return Promise.reject(data);
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        success: false,
        error: 'No response from server. Please check your connection.',
      });
    } else {
      // Something else happened
      return Promise.reject({
        success: false,
        error: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default api;