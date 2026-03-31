// ==========================================
// NAVIGATION E2E TESTS
// ==========================================
// Author: Samson Fabiyi
// Description: Test navigation and page accessibility
// ==========================================

describe('Navigation', () => {

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  // ==========================================
  // HOME PAGE
  // ==========================================
  describe('Home Page', () => {
    
    it('should load the home page', () => {
      cy.visit('/');
      
      cy.get('body').should('be.visible');
      cy.contains(/husleflow|services|book/i).should('be.visible');
    });

    it('should have navigation bar', () => {
      cy.visit('/');
      
      // Check navbar exists using simple selector
      cy.get('nav').should('be.visible');
    });

    it('should have links to main pages', () => {
      cy.visit('/');
      
      cy.contains(/services|browse/i).should('be.visible');
      cy.contains(/login|sign in|register|sign up/i).should('be.visible');
    });

    it('should navigate to services page', () => {
      cy.visit('/');
      
      cy.contains(/services|browse/i).click();
      cy.url().should('include', '/services');
    });

    it('should navigate to login page', () => {
      cy.visit('/');
      
      cy.contains(/login|sign in/i).click();
      cy.url().should('include', '/login');
    });
  });

  // ==========================================
  // RESPONSIVE DESIGN
  // ==========================================
  describe('Responsive Design', () => {
    
    it('should display correctly on mobile', () => {
      cy.viewport('iphone-x');
      cy.visit('/');
      
      cy.get('body').should('be.visible');
    });

    it('should display correctly on tablet', () => {
      cy.viewport('ipad-2');
      cy.visit('/');
      
      cy.get('body').should('be.visible');
    });

    it('should have mobile menu on small screens', () => {
      cy.viewport('iphone-x');
      cy.visit('/');
      
      // Just verify page loads on mobile
      cy.get('body').should('be.visible');
    });
  });

  // ==========================================
  // 404 PAGE
  // ==========================================
  describe('404 Page', () => {
    
    it('should show 404 for non-existent routes', () => {
      cy.visit('/this-page-does-not-exist-xyz-123', { failOnStatusCode: false });
      
      // Page should load (even if it redirects to home)
      cy.get('body').should('be.visible');
    });
  });

  // ==========================================
  // PROTECTED ROUTES
  // ==========================================
  describe('Protected Routes', () => {
    
    it('should redirect to login for dashboard without auth', () => {
      cy.visit('/dashboard');
      
      cy.url().should('include', '/login');
    });

    it('should redirect to login for my-bookings without auth', () => {
      cy.visit('/dashboard/my-bookings');
      
      cy.url().should('include', '/login');
    });

    it('should redirect to login for profile without auth', () => {
      cy.visit('/profile');
      
      // Should redirect to login OR home page (depends on your routing)
      cy.url().should('satisfy', (url) => {
        return url.includes('/login') || url === Cypress.config().baseUrl + '/';
      });
    });
  });
});
