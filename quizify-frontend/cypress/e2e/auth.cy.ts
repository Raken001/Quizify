// Authentication E2E tests
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should redirect unauthenticated users to login', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('should display login page', () => {
    cy.visit('/login');
    cy.get('form').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Login');
  });

  it('should register a new user', () => {
    cy.visit('/register');
    
    cy.get('input[type="email"]').type('newuser@example.com');
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('password123');
    cy.get('input[placeholder="First Name"]').type('John');
    cy.get('input[placeholder="Last Name"]').type('Doe');
    
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard on successful registration
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Dashboard');
  });

  it('should login with valid credentials', () => {
    // Assuming user already registered
    cy.visit('/login');
    
    cy.get('input[type="email"]').type('testuser@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should show error for invalid email format', () => {
    cy.visit('/register');
    
    cy.get('input[type="email"]').type('invalidemail');
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('password123');
    
    cy.get('button[type="submit"]').click();
    
    // Should show validation error
    cy.get('.error-message, .alert-danger, [role="alert"]').should('be.visible');
  });

  it('should show error for weak password', () => {
    cy.visit('/register');
    
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').first().type('123');
    cy.get('input[type="password"]').last().type('123');
    
    cy.get('button[type="submit"]').click();
    
    // Should show validation error
    cy.get('.error-message, .alert-danger, [role="alert"]').should('be.visible');
  });

  it('should logout successfully', () => {
    // Login first
    cy.visit('/login');
    cy.get('input[type="email"]').type('testuser@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Find and click logout button
    cy.get('[data-testid="logout-btn"], button:contains("Logout")').click();
    
    // Should redirect to login
    cy.url().should('include', '/login');
  });
});
