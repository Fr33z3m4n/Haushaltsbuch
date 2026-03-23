describe('Monatsübersicht', () => {
  beforeEach(() => {
    cy.mockAll();
    cy.visitAuthenticated('/monats%C3%BCbersicht');
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
    cy.contains('Gehalt').should('exist');
    cy.contains('Miete').should('exist');
    cy.contains('Versicherung').should('exist');
  });

  it('klappt ein Accordion auf und zu', () => {
    cy.get('.accordion-button').first().as('btn');
    cy.get('.accordion-collapse.show').should('exist');
    cy.get('@btn').click();
    cy.get('@btn').should('have.class', 'collapsed');
  });

  it('wechselt zum nächsten Monat', () => {
    cy.get('.btn-outline-primary').last().click();
    cy.wait('@getMonthlyOverview');
  });

  it('wechselt zum vorherigen Monat', () => {
    cy.get('.btn-outline-primary').first().click();
    cy.wait('@getMonthlyOverview');
  });

  it('zeigt Summenwerte', () => {
    cy.contains('3.000,00').should('exist');
    cy.contains('810,00').should('exist');
  });
});
