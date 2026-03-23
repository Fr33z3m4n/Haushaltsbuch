describe('Navigation & Layout', () => {
  beforeEach(() => {
    cy.mockAll();
    cy.login();
    cy.visit('/dashboard');
  });

  it('navigiert zu Konten', () => {
    cy.contains('Konten').click();
    cy.url().should('include', '/konten');
  });

  it('navigiert zu Kategorien', () => {
    cy.contains('Kategorien').click();
    cy.url().should('include', '/kategorien');
  });

  it('navigiert zu Buchungen', () => {
    cy.contains('Buchungen').click();
    cy.url().should('include', '/buchungen');
  });

  it('navigiert zur Monatsübersicht', () => {
    cy.contains('Monatsübersicht').click();
    cy.url().should('include', '/monats');
  });

  it('navigiert zur Jahresübersicht', () => {
    cy.contains('Jahresübersicht').click();
    cy.url().should('include', '/jahres');
  });

  it('öffnet User-Dropdown in der Topbar', () => {
    cy.get('[class*="topbar"], header').within(() => {
      cy.get('button').first().click();
    });
    cy.contains('Einstellungen').should('be.visible');
  });

  it('meldet den Benutzer ab', () => {
    cy.intercept('POST', '/api/auth/logout', { statusCode: 200, body: {} }).as('logout');
    cy.get('[class*="topbar"], header').within(() => {
      cy.get('button').first().click();
    });
    cy.contains('Abmelden').click();
    cy.url().should('include', '/login');
  });
});
