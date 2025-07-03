// Import commands
import './commands';

// Import accessibility testing
import 'cypress-axe';

// Import visual regression testing
import '@percy/cypress';

// Global before hook
before(() => {
  // Get CSRF token for API requests
  cy.request('/api/auth/csrf').then((response) => {
    Cypress.env('CSRF_TOKEN', response.body.csrfToken);
  });
});

// Global beforeEach hook
beforeEach(() => {
  // Intercept common API calls
  cy.intercept('GET', '/api/health', { statusCode: 200 }).as('healthCheck');
  
  // Set default viewport
  cy.viewport(1280, 720);
  
  // Clear session storage
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// Global afterEach hook
afterEach(() => {
  // Take screenshot on failure
  if (Cypress.currentTest.state === 'failed') {
    cy.screenshot(`failed-${Cypress.currentTest.title}`, {
      capture: 'fullPage'
    });
  }
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log the error
  console.error('Uncaught exception:', err);
  
  // Return false to prevent test failure on uncaught exceptions
  // in production code that don't affect the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  return true;
});

// Custom error handling
Cypress.on('fail', (error, runnable) => {
  // Log detailed error information
  console.error('Test failed:', {
    test: runnable.title,
    error: error.message,
    stack: error.stack
  });
  
  throw error;
});