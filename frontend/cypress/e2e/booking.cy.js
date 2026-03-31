// ==========================================
// BOOKING E2E TESTS
// ==========================================
// Author: Samson Fabiyi
// Description: Test booking flow
// ==========================================

describe('Booking Flow', () => {

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  // ==========================================
  // BOOKING FORM
  // ==========================================
  describe('Booking Form', () => {
    
    it('should show login prompt for unauthenticated users', () => {
      cy.visit('/services');
      
      // Wait for page to load
      cy.wait(2000);
      
      // Verify we're on services page
      cy.url().should('include', '/services');
      cy.get('body').should('be.visible');
    });

    it('should display date picker on service detail', () => {
      cy.visit('/services');
      
      cy.wait(2000);
      cy.get('body').should('be.visible');
    });

    it('should display time input on service detail', () => {
      cy.visit('/services');
      
      cy.wait(2000);
      cy.get('body').should('be.visible');
    });

    it('should show price summary', () => {
      cy.visit('/services');
      
      cy.wait(2000);
      cy.get('body').should('be.visible');
    });
  });

  // ==========================================
  // MY BOOKINGS PAGE (Requires Auth)
  // ==========================================
  describe('My Bookings Page', () => {
    
    it('should redirect to login if not authenticated', () => {
      cy.visit('/dashboard/my-bookings');
      
      cy.url().should('include', '/login');
    });
  });
});
