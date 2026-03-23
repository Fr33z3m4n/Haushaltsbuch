describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('zeigt die Login-Seite an', () => {
    cy.get('h1, h2, h3').should('contain.text', 'Haushaltsbuch').or('contain.text', 'Anmelden').or('contain.text', 'Login');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('zeigt Fehler bei falschen Zugangsdaten', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Ungültige Zugangsdaten' },
    }).as('failedLogin');

    cy.get('input[type="email"]').type('falsch@test.de');
    cy.get('input[type="password"]').type('FalschesPasswort1!');
    cy.get('button[type="submit"]').click();
    cy.wait('@failedLogin');

    cy.get('.alert-danger, [class*="error"], [class*="alert"]').should('be.visible');
  });

  it('leitet nach erfolgreichem Login zum Dashboard weiter', () => {
    cy.fixture('auth').then((auth) => {
      cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: auth.loginSuccess }).as('login');
      cy.intercept('GET', '/api/auth/profile', { statusCode: 200, body: auth.loginSuccess.user }).as('profile');
      cy.intercept('GET', '/api/dashboard*', { statusCode: 200, body: {} }).as('dashboard');
    });

    cy.get('input[type="email"]').type('test@test.de');
    cy.get('input[type="password"]').type('Test1234!');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');
    cy.url().should('include', '/dashboard');
  });

  it('verhindert Zugriff auf geschützte Seiten ohne Login', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');

    cy.visit('/konten');
    cy.url().should('include', '/login');

    cy.visit('/buchungen');
    cy.url().should('include', '/login');
  });
});
