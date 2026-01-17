// ==========================================
// HUSTLEFLOW API SERVER
// ==========================================
// Description: Main Express.js server
// Author: Samson Fabiyi (22065067)
// Project: BSc Computer Science Final Year
// University: University of Hertfordshire
// Supervisor: Dr. Barry Nichols
// Date: November 2024
// ==========================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies (limit 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ==========================================
// HEALTH CHECK ROUTES
// ==========================================

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'Hustleflow API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Detailed health check
app.get('/health/detailed', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Hustleflow API - Detailed Health Check',
    server: {
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform
    },
    services: {
      database: 'Not connected yet',
      paypal: 'Not configured yet',
      api: 'Running'
    },
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// API WELCOME ROUTE
// ==========================================

app.get('/api/v1', (req, res) => {
  res.json({ 
    message: 'Welcome to Hustleflow API v1',
    description: 'Booking system for vocational services',
    version: '1.0.0',
    author: 'Samson Fabiyi',
    university: 'University of Hertfordshire',
    project: 'BSc Computer Science Final Year Project',
    payment: 'PayPal Integration',
    database: 'PostgreSQL (Supabase)',
    endpoints: {
      health: '/health',
      detailedHealth: '/health/detailed',
      api: '/api/v1',
      docs: '/api/v1/docs (coming soon)'
    }
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    message: 'The requested endpoint does not exist'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error occurred:');
  console.error(err.stack);
  
  res.status(err.status || 500).json({ 
    success: false, 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err
    })
  });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 HUSTLEFLOW API SERVER STARTED');
  console.log('========================================');
  console.log(`📍 Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Port:         ${PORT}`);
  console.log(`🔗 Health:       http://localhost:${PORT}/health`);
  console.log(`📡 API:          http://localhost:${PORT}/api/v1`);
  console.log(`💳 Payment:      PayPal (${process.env.PAYPAL_MODE || 'sandbox'})`);
  console.log(`🗄️  Database:     PostgreSQL (Supabase)`);
  console.log('========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;