// ==========================================
// HUSTLEFLOW API SERVER
// ==========================================
// Description: Main Express.js server with authentication
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

// Database configuration
const { connectDatabase, checkDatabaseHealth } = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://husleflow.com',
      'https://www.husleflow.com',
      'https://husleflow.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all in development, restrict in production if needed
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parse JSON bodies (limit 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${path} - IP: ${ip}`);
  next();
});

// ==========================================
// HEALTH CHECK ROUTES
// ==========================================

// Basic health check
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    res.status(200).json({ 
      status: 'OK',
      message: 'Hustleflow API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        api: 'running',
        database: dbHealth.status,
        payment: 'PayPal (sandbox)',
        authentication: 'active'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    res.status(200).json({
      status: 'OK',
      message: 'Hustleflow API - Detailed Health Check',
      server: {
        uptime: Math.floor(process.uptime()),
        uptimeFormatted: formatUptime(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        memory: {
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
        }
      },
      services: {
        api: 'running',
        database: dbHealth.status,
        databaseMessage: dbHealth.message,
        paypal: process.env.PAYPAL_MODE || 'not configured',
        authentication: 'JWT enabled',
        cors: 'enabled',
        helmet: 'enabled'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Detailed health check failed',
      error: error.message
    });
  }
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// ==========================================
// API ROUTES
// ==========================================

// API welcome route
app.get('/api/v1', (req, res) => {
  res.json({ 
    message: 'Welcome to Hustleflow API v1',
    description: 'Booking system for vocational services',
    version: '1.0.0',
    author: 'Samson Fabiyi',
    studentId: '22065067',
    university: 'University of Hertfordshire',
    project: 'BSc Computer Science Final Year Project',
    supervisor: 'Dr. Barry Nichols',
    technologies: {
      backend: 'Node.js + Express.js',
      database: 'PostgreSQL (Supabase)',
      orm: 'Prisma',
      authentication: 'JWT + bcrypt',
      payment: 'PayPal SDK'
    },
    endpoints: {
      health: '/health',
      detailedHealth: '/health/detailed',
      api: '/api/v1',
      authentication: '/api/v1/auth',
      docs: '/api/v1/docs (coming soon)'
    },
    availableRoutes: {
      'POST /api/v1/auth/register': 'Register new user',
      'POST /api/v1/auth/login': 'Login user',
      'GET /api/v1/auth/profile': 'Get user profile (protected)',
      'PATCH /api/v1/auth/profile': 'Update user profile (protected)',
      'POST /api/v1/auth/change-password': 'Change password (protected)',
      'POST /api/v1/auth/logout': 'Logout user (protected)'
    }
  });
});

// Mount authentication routes
app.use('/api/v1/auth', authRoutes);

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
    message: 'The requested endpoint does not exist',
    availableEndpoints: {
      health: '/health',
      api: '/api/v1',
      auth: '/api/v1/auth'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error occurred:');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({ 
    success: false, 
    error: err.message || 'Internal server error',
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err
    })
  });
});

// ==========================================
// START SERVER
// ==========================================

async function startServer() {
  try {
    // Connect to database first
    await connectDatabase();
    
    // Then start HTTP server
    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('🚀 HUSTLEFLOW API SERVER STARTED');
      console.log('========================================');
      console.log(`📍 Environment:  ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Port:         ${PORT}`);
      console.log(`🔗 Health:       http://localhost:${PORT}/health`);
      console.log(`📡 API:          http://localhost:${PORT}/api/v1`);
      console.log(`🔐 Auth:         http://localhost:${PORT}/api/v1/auth`);
      console.log(`💳 Payment:      PayPal (${process.env.PAYPAL_MODE || 'sandbox'})`);
      console.log(`🗄️  Database:     PostgreSQL (Supabase) - Connected`);
      console.log('========================================');
      console.log('📚 Available Routes:');
      console.log('   POST   /api/v1/auth/register');
      console.log('   POST   /api/v1/auth/login');
      console.log('   GET    /api/v1/auth/profile');
      console.log('   PATCH  /api/v1/auth/profile');
      console.log('   POST   /api/v1/auth/change-password');
      console.log('   POST   /api/v1/auth/logout');
      console.log('========================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('\n📴 SIGTERM received. Shutting down gracefully...');
  const { disconnectDatabase } = require('./config/database');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n📴 SIGINT received. Shutting down gracefully...');
  const { disconnectDatabase } = require('./config/database');
  await disconnectDatabase();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;