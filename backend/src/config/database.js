// ==========================================
// DATABASE CONFIGURATION
// ==========================================
// Database: PostgreSQL (Supabase)
// ORM: Prisma Client
// Author: Samson Fabiyi
// ==========================================

const { PrismaClient } = require('@prisma/client');

// Singleton pattern for Prisma Client
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'colorless',
  });
} else {
  // In development, use global to prevent multiple instances during hot-reload
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'colorless',
    });
  }
  prisma = global.prisma;
}

// Test database connection
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    console.log('📊 Database: PostgreSQL (Supabase)');
    console.log('🔧 ORM: Prisma Client');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Check database health
async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', message: 'Database is responsive' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
}

// Graceful shutdown
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected gracefully');
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n📴 SIGINT received. Closing database connection...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n📴 SIGTERM received. Closing database connection...');
  await disconnectDatabase();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await disconnectDatabase();
  process.exit(1);
});

module.exports = { 
  prisma, 
  connectDatabase, 
  disconnectDatabase,
  checkDatabaseHealth
};