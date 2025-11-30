// Cypress configuration for E2E tests
import './commands';

// Disable uncaught exception handling for development
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  return false;
});

beforeEach(() => {
  // Clear localStorage before each test
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});
