describe('Monatsübersicht', () => {
  beforeEach(() => {
    cy.mockAll();
    cy.login();
    cy.visit('/monatsübersicht');
    cy.wait('@getMonthlyOverview');
  });

  it('zeigt die Monatsübersicht an', () => {
    cy.contains('Monatsübersicht').should('be.visible');
  });

  it('zeigt Einnahmen-Sektion', () => {
    cy.contains('Einnahmen').should('be.visible');
  });

  it('zeigt Ausgaben-Sektion', () => {
    cy.contains('Ausgaben').should('be.visible');
  });

  it('zeigt Kategorien-Accordions', () => {
    cy.contains('Gehalt').should('be.visible');
    cy.contains('Miete').should('be.visible');
    cy.contains('Versicherung').should('be.visible');
  });

  it('klappt ein Accordion auf und zu', () => {
    // First accordion button opens its panel
    cy.get('.accordion-button').first().as('btn');
    // Check initial state (should be open by default)
    cy.get('.accordion-collapse.show').should('exist');

    // Click to collapse
    cy.get('@btn').click();
    cy.get('@btn').should('have.class', 'collapsed');
  });

  it('wechselt zum nächsten Monat', () => {
    cy.get('button[aria-label*="nächster"], button').contains('›').click();
    cy.wait('@getMonthlyOverview');
  });

  it('wechselt zum vorherigen Monat', () => {
    cy.get('button').contains('‹').click();
    cy.wait('@getMonthlyOverview');
  });

  it('zeigt Summenwerte', () => {
    // Total income and expense should be shown
    cy.contains('3.000,00').should('exist');
    cy.contains('810,00').or(cy.contains('800,00')).should('exist');
  });
});
