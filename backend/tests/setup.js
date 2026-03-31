// ==========================================
// TEST SETUP
// ==========================================
// Author: Samson Fabiyi
// Description: Setup and teardown for tests
// ==========================================

const { prisma } = require('../src/config/database');

// Increase timeout for database operations
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Disconnect from database
  await prisma.$disconnect();
});

// Global test helpers
global.testHelpers = {
  // Generate random email for testing
  generateTestEmail: () => `test_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
  
  // Generate random password
  generateTestPassword: () => 'Test@123456',
  
  // Wait helper
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};
