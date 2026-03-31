// ==========================================
// CYPRESS CUSTOM COMMANDS
// ==========================================
// Author: Samson Fabiyi
// Description: Reusable test commands
// ==========================================

// Generate unique test email
Cypress.Commands.add('generateTestEmail', () => {
  return `test_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;
});

// Login command - reusable across tests
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  
  // Wait for redirect to dashboard or home
  cy.url().should('not.include', '/login');
});

// Login via API (faster for tests that need authenticated state)
Cypress.Commands.add('loginViaApi', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password }
  }).then((response) => {
    const { accessToken, refreshToken } = response.body.data.tokens;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(response.body.data.user));
  });
});

// Register new user via API
Cypress.Commands.add('registerViaApi', (userData) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: userData,
    failOnStatusCode: false
  });
});

// Logout command
Cypress.Commands.add('logout', () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  cy.visit('/');
});

// Check toast message
Cypress.Commands.add('checkToast', (message) => {
  cy.contains(message, { timeout: 10000 }).should('be.visible');
});

// Wait for API response
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(alias).its('response.statusCode').should('be.oneOf', [200, 201]);
});
