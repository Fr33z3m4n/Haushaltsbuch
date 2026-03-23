describe('Dashboard', () => {
  beforeEach(() => {
    cy.mockAll();
    cy.login();
    cy.mockDashboard();
    cy.visit('/dashboard');
    cy.wait('@getDashboard');
  });

  it('zeigt das Dashboard nach dem Login an', () => {
    cy.url().should('include', '/dashboard');
  });

  it('zeigt Navigationslinks in der Sidebar', () => {
    cy.get('nav, [class*="sidebar"]').within(() => {
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Buchungen').should('be.visible');
      cy.contains('Konten').should('be.visible');
      cy.contains('Kategorien').should('be.visible');
    });
  });

  it('zeigt Monatsübersicht und Jahresübersicht Links', () => {
    cy.contains('Monatsübersicht').should('exist');
    cy.contains('Jahresübersicht').should('exist');
  });
});
