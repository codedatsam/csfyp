// ==========================================
// JEST CONFIGURATION
// ==========================================
// Author: Samson Fabiyi
// Description: Jest test configuration
// ==========================================

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: ['**/tests/**/*.test.js'],
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!node_modules/**'
  ],
  
  // Setup file (runs before tests)
  setupFilesAfterEnv: ['./tests/setup.js'],
  
  // Timeout for tests (10 seconds)
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Detect open handles (helps debug hanging tests)
  detectOpenHandles: true
};
