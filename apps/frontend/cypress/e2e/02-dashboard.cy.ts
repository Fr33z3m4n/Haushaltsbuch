describe('Dashboard', () => {
  beforeEach(() => {
    cy.mockAll();
    cy.visitAuthenticated('/dashboard');
  });

  it('zeigt das Dashboard nach dem Login an', () => {
    cy.url().should('include', '/dashboard');
  });

  it('zeigt Navigationslinks in der Sidebar', () => {
    cy.get('nav, [class*="sidebar"]').first().within(() => {
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
