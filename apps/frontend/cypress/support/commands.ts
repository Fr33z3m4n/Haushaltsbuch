// ***********************************************
// Custom Cypress Commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      mockAuth(): Chainable<void>;
      mockAccounts(): Chainable<void>;
      mockCategories(): Chainable<void>;
      mockTransactions(): Chainable<void>;
      mockDashboard(): Chainable<void>;
      mockMonthlyOverview(year?: number, month?: number): Chainable<void>;
      mockUsers(): Chainable<void>;
      mockAll(): Chainable<void>;
    }
  }
}

// Login via UI
Cypress.Commands.add('login', (email = 'test@test.de', password = 'Test1234!') => {
  cy.fixture('auth').then((auth) => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: auth.loginSuccess,
    }).as('loginRequest');
  });
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.wait('@loginRequest');
});

// Mock auth/profile endpoint
Cypress.Commands.add('mockAuth', () => {
  cy.fixture('auth').then((auth) => {
    cy.intercept('GET', '/api/auth/profile', {
      statusCode: 200,
      body: auth.loginSuccess.user,
    }).as('getProfile');
  });
});

// Mock accounts
Cypress.Commands.add('mockAccounts', () => {
  cy.fixture('accounts').then((accounts) => {
    cy.intercept('GET', '/api/accounts', { statusCode: 200, body: accounts }).as('getAccounts');
  });
});

// Mock categories
Cypress.Commands.add('mockCategories', () => {
  cy.fixture('categories').then((categories) => {
    cy.intercept('GET', '/api/categories', { statusCode: 200, body: categories }).as('getCategories');
  });
});

// Mock transactions
Cypress.Commands.add('mockTransactions', () => {
  cy.fixture('transactions').then((transactions) => {
    cy.intercept('GET', '/api/transactions', { statusCode: 200, body: transactions }).as('getTransactions');
  });
});

// Mock dashboard
Cypress.Commands.add('mockDashboard', () => {
  cy.fixture('dashboard').then((data) => {
    cy.intercept('GET', '/api/dashboard*', { statusCode: 200, body: data }).as('getDashboard');
  });
});

// Mock monthly overview
Cypress.Commands.add('mockMonthlyOverview', (year?: number, month?: number) => {
  cy.fixture('monthly-overview').then((data) => {
    cy.intercept('GET', '/api/monthly-overview*', { statusCode: 200, body: data }).as('getMonthlyOverview');
  });
});

// Mock users
Cypress.Commands.add('mockUsers', () => {
  cy.fixture('users').then((users) => {
    cy.intercept('GET', '/api/users', { statusCode: 200, body: users }).as('getUsers');
  });
});

// Mock everything at once (convenience)
Cypress.Commands.add('mockAll', () => {
  cy.mockAuth();
  cy.mockAccounts();
  cy.mockCategories();
  cy.mockTransactions();
  cy.mockDashboard();
  cy.mockMonthlyOverview();
  cy.mockUsers();
});

export {};
