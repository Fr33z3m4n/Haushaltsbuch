describe('Navigation & Layout', () => {
  beforeEach(() => {
    cy.mockAll();
    cy.visitAuthenticated('/dashboard');
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
    cy.get('nav.topbar').find('.dropdown').find('button').click({ force: true });
    cy.get('nav.topbar .dropdown-menu').should('have.class', 'show');
    cy.contains('a.dropdown-item', 'Einstellungen').should('be.visible');
  });

  it('meldet den Benutzer ab', () => {
    cy.get('nav.topbar').find('.dropdown').find('button').click({ force: true });
    cy.get('nav.topbar .dropdown-menu').should('have.class', 'show');
    cy.contains('a.dropdown-item', 'Abmelden').click({ force: true });
    cy.url().should('include', '/login');
  });
});
