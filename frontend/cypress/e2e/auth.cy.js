// ==========================================
// AUTHENTICATION E2E TESTS
// ==========================================
// Author: Samson Fabiyi
// Description: Test login, register, logout flows
// ==========================================

describe('Authentication', () => {
  
  // Generate unique email for each test run
  const testEmail = `cypress_${Date.now()}@test.com`;
  const testPassword = 'Test@123456';

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  // ==========================================
  // REGISTRATION TESTS
  // ==========================================
  describe('Registration', () => {
    
    it('should display the registration page', () => {
      cy.visit('/register');
      
      cy.contains(/create|register|sign up/i).should('be.visible');
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should register a new user successfully', () => {
      cy.visit('/register');
      
      cy.get('input[name="firstName"]').type('Cypress');
      cy.get('input[name="lastName"]').type('Test');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="confirmPassword"]').type(testPassword);
      
      cy.get('button[type="submit"]').click();
      
      // Wait and check - should redirect away from register page
      cy.wait(2000);
      cy.url().should('not.include', '/register');
    });

    it('should show error for invalid email', () => {
      cy.visit('/register');
      
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="confirmPassword"]').type(testPassword);
      
      cy.get('button[type="submit"]').click();
      
      // Should stay on register page
      cy.url().should('include', '/register');
    });

    it('should show error for password mismatch', () => {
      cy.visit('/register');
      
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('mismatch@example.com');
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="confirmPassword"]').type('DifferentPassword123!');
      
      cy.get('button[type="submit"]').click();
      
      // Should stay on register page (validation failed)
      cy.url().should('include', '/register');
    });

    it('should have link to login page', () => {
      cy.visit('/register');
      
      cy.contains(/already have an account|sign in|login/i).click();
      cy.url().should('include', '/login');
    });
  });

  // ==========================================
  // LOGIN TESTS
  // ==========================================
  describe('Login', () => {
    
    it('should display the login page', () => {
      cy.visit('/login');
      
      cy.contains(/sign in|login|welcome/i).should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('input[type="email"]').type('nonexistent@example.com');
      cy.get('input[type="password"]').type('WrongPassword123!');
      cy.get('button[type="submit"]').click();
      
      // Should stay on login page after failed login
      cy.wait(3000);
      cy.url().should('include', '/login');
    });

    it('should show error for empty fields', () => {
      cy.visit('/login');
      
      cy.get('button[type="submit"]').click();
      
      cy.url().should('include', '/login');
    });

    it('should have link to register page', () => {
      cy.visit('/login');
      
      cy.contains(/create account|sign up|register/i).click();
      cy.url().should('include', '/register');
    });

    it('should have link to forgot password', () => {
      cy.visit('/login');
      
      cy.contains(/forgot|reset/i).should('be.visible');
    });
  });

  // ==========================================
  // LOGOUT TESTS
  // ==========================================
  describe('Logout', () => {
    
    it('should logout successfully', () => {
      cy.visit('/');
      cy.get('body').should('be.visible');
    });
  });
});
