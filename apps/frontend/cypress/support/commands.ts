// ***********************************************
// Custom Cypress Commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      visitAuthenticated(url: string): Chainable<void>;
      mockAuth(): Chainable<void>;
      mockAccounts(): Chainable<void>;
      mockCategories(): Chainable<void>;
      mockTransactions(): Chainable<void>;
      mockDashboard(): Chainable<void>;
      mockMonthlyOverview(): Chainable<void>;
      mockUsers(): Chainable<void>;
      mockAll(): Chainable<void>;
    }
  }
}

// Login via UI form (used only in 01-login tests)
Cypress.Commands.add('login', (email = 'test@test.de', password = 'Test1234!') => {
  cy.fixture('auth').then((auth) => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: auth.loginSuccess,
    }).as('loginRequest');

    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
  });
});

// Visit a protected page with auth tokens pre-set via onBeforeLoad
// This runs BEFORE Angular initializes so AuthService reads the correct user
Cypress.Commands.add('visitAuthenticated', (url: string) => {
  cy.fixture('auth').then((auth) => {
    const { accessToken, refreshToken, user } = auth.loginSuccess;
    cy.visit(url, {
      onBeforeLoad(win) {
        win.localStorage.setItem('accessToken', accessToken);
        win.localStorage.setItem('refreshToken', refreshToken);
        win.localStorage.setItem('currentUser', JSON.stringify(user));
      },
    });
  });
});

// Mock auth/profile endpoint
Cypress.Commands.add('mockAuth', () => {
  cy.fixture('auth').then((auth) => {
    cy.intercept('GET', '**/api/auth/profile', {
      statusCode: 200,
      body: auth.loginSuccess.user,
    }).as('getProfile');
    // Also mock refresh token to prevent auth errors
    cy.intercept('POST', '**/api/auth/refresh', {
      statusCode: 200,
      body: { accessToken: auth.loginSuccess.accessToken },
    }).as('refreshToken');
  });
});

Cypress.Commands.add('mockAccounts', () => {
  cy.fixture('accounts').then((accounts) => {
    cy.intercept('GET', '**/api/accounts*', { statusCode: 200, body: accounts }).as('getAccounts');
  });
});

Cypress.Commands.add('mockCategories', () => {
  cy.fixture('categories').then((categories) => {
    cy.intercept('GET', '**/api/categories*', { statusCode: 200, body: categories }).as('getCategories');
  });
});

Cypress.Commands.add('mockTransactions', () => {
  cy.fixture('transactions').then((transactions) => {
    cy.intercept('GET', '**/api/transactions*', { statusCode: 200, body: transactions }).as('getTransactions');
  });
});

Cypress.Commands.add('mockDashboard', () => {
  cy.fixture('dashboard').then((data) => {
    cy.intercept('GET', '**/api/dashboard*', { statusCode: 200, body: data }).as('getDashboard');
    cy.intercept('GET', '**/api/monthly-overview*', { statusCode: 200, body: data }).as('getMonthlyOverviewDash');
    cy.intercept('GET', '**/api/yearly-overview*', { statusCode: 200, body: data }).as('getYearlyOverviewDash');
  });
});

Cypress.Commands.add('mockMonthlyOverview', () => {
  cy.fixture('monthly-overview').then((data) => {
    cy.intercept('GET', '**/api/monthly-overview*', { statusCode: 200, body: data }).as('getMonthlyOverview');
  });
});

Cypress.Commands.add('mockUsers', () => {
  cy.fixture('users').then((users) => {
    cy.intercept('GET', '**/api/users*', { statusCode: 200, body: users }).as('getUsers');
  });
});

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
