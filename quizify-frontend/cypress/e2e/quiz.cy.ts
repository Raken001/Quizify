// Quiz functionality E2E tests
describe('Quiz Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.loginViaUI('testuser@example.com', 'password123');
    cy.visit('/dashboard');
  });

  it('should display quiz start page', () => {
    cy.visit('/quiz');
    
    cy.get('h1').should('contain', 'Start Quiz');
    cy.get('button').should('contain', 'Start Quiz');
  });

  it('should start a new quiz', () => {
    cy.visit('/quiz');
    
    // Select options if available
    cy.get('select, [role="combobox"]').each(($select) => {
      cy.wrap($select).select(0);
    });
    
    cy.get('button:contains("Start Quiz")').click();
    
    // Should display quiz questions
    cy.get('.question-container, [data-testid="question"]').should('be.visible');
    cy.get('h2').should('contain', 'Question');
  });

  it('should answer quiz questions', () => {
    cy.startQuiz();
    
    // Answer first question
    cy.get('[data-testid="answer-option"], input[type="radio"]').first().click();
    cy.get('button:contains("Next")').click();
    
    // Answer second question
    cy.get('[data-testid="answer-option"], input[type="radio"]').first().click();
    cy.get('button:contains("Next")').click();
    
    // Verify we're on next question
    cy.get('.question-container, [data-testid="question"]').should('be.visible');
  });

  it('should submit quiz and view results', () => {
    cy.startQuiz();
    
    // Answer all questions quickly
    for (let i = 0; i < 10; i++) {
      cy.get('[data-testid="answer-option"], input[type="radio"]').first().click();
      
      if (i < 9) {
        cy.get('button:contains("Next")').click();
      } else {
        cy.get('button:contains("Submit")').click();
      }
    }
    
    // Should display results
    cy.url().should('include', '/results');
    cy.get('.results-container, [data-testid="results"]').should('be.visible');
    cy.get('.score, [data-testid="score"]').should('be.visible');
  });

  it('should show correct progress indicator', () => {
    cy.startQuiz();
    
    cy.get('.progress, [data-testid="progress"]').should('contain', '1');
    cy.get('.progress, [data-testid="progress"]').should('contain', '10');
    
    cy.get('[data-testid="answer-option"], input[type="radio"]').first().click();
    cy.get('button:contains("Next")').click();
    
    cy.get('.progress, [data-testid="progress"]').should('contain', '2');
  });

  it('should allow going back to previous questions', () => {
    cy.startQuiz();
    
    cy.get('[data-testid="answer-option"], input[type="radio"]').first().click();
    cy.get('button:contains("Next")').click();
    
    cy.get('button:contains("Previous")').click();
    
    // Should be back on first question
    cy.get('.progress, [data-testid="progress"]').should('contain', '1');
  });
});
