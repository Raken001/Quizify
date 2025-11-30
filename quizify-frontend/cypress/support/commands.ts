// Type definitions for custom commands (must come first)
declare global {
  namespace Cypress {
    interface Chainable {
      loginViaUI(email: string, password: string): Cypress.Chainable<void>;
      startQuiz(): Cypress.Chainable<void>;
    }
  }
}

// Support file for custom commands
Cypress.Commands.add('loginViaUI', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for redirect to dashboard
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('startQuiz', () => {
  cy.visit('/quiz');
  
  // Select default options if needed
  cy.get('select, [role="combobox"]').each(($select) => {
    cy.wrap($select).select(0);
  });
  
  cy.get('button:contains("Start Quiz")').click();
  cy.get('.question-container, [data-testid="question"]').should('be.visible');
});

export {};
