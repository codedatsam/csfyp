// ==========================================
// CYPRESS CONFIGURATION
// ==========================================
// Author: Samson Fabiyi
// Description: E2E test configuration
// ==========================================

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Base URL for your frontend
    baseUrl: 'http://localhost:5173',
    
    // Test files location
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Support file
    supportFile: 'cypress/support/e2e.js',
    
    // Viewport settings (desktop)
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Video recording (disable for faster tests)
    video: false,
    
    // Screenshot on failure
    screenshotOnRunFailure: true,
    
    // Timeout settings
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Retry failed tests
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Environment variables
    env: {
      apiUrl: 'http://localhost:5000/api/v1'
    },

    setupNodeEvents(on, config) {
      // Fix for Chromium IPC errors
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
        }
        
        if (browser.name === 'electron') {
          launchOptions.preferences.webPreferences = {
            ...launchOptions.preferences.webPreferences,
            nodeIntegration: false,
            contextIsolation: true
          };
        }
        
        return launchOptions;
      });
    },
  },
});
