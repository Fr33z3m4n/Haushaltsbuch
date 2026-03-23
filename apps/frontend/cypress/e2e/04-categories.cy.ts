describe('Kategorien', () => {
  beforeEach(() => {
    cy.mockAll();
    cy.visitAuthenticated('/kategorien');
    cy.wait('@getCategories');
  });

  it('zeigt Einnahmen- und Ausgaben-Kategorien', () => {
    cy.contains('Einnahmen-Kategorien').should('be.visible');
    cy.contains('Ausgaben-Kategorien').should('be.visible');
  });

  it('zeigt vorhandene Kategorien', () => {
    cy.contains('Gehalt').should('be.visible');
    cy.contains('Miete').should('be.visible');
    cy.contains('Versicherung').should('be.visible');
  });

  it('öffnet das Modal für neue Kategorie', () => {
    cy.contains('Neue Kategorie').click();
    cy.get('.modal.show').should('be.visible');
    cy.get('.modal-title').should('contain', 'Neue Kategorie');
  });

  it('schließt das Modal beim Klick auf Abbrechen', () => {
    cy.contains('Neue Kategorie').click();
    cy.get('.modal.show').contains('Abbrechen').click();
    cy.get('.modal.show').should('not.exist');
  });

  it('speichert eine neue Kategorie', () => {
    const newCat = { id: 'cat-new', name: 'Sport', type: 'expense', color: '#4e73df', icon: 'dumbbell' };
    cy.intercept('POST', '**/api/categories*', { statusCode: 201, body: newCat }).as('createCategory');

    cy.contains('Neue Kategorie').click();
    cy.get('.modal.show input[formControlName="name"]').type('Sport');
    cy.get('.modal.show select[formControlName="type"]').select('expense');
    cy.get('.modal.show button[type="submit"]').click();
    cy.wait('@createCategory');
    cy.get('.modal.show').should('not.exist');
  });

  it('öffnet Bearbeiten-Modal', () => {
    cy.get('.btn-outline-primary').first().click();
    cy.get('.modal.show').should('be.visible');
    cy.get('.modal-title').should('contain', 'Kategorie bearbeiten');
  });

  it('öffnet Löschen-Bestätigung', () => {
    cy.get('.btn-outline-danger').first().click();
    cy.get('.modal.show').should('be.visible');
    cy.get('.modal.show .btn-danger').should('be.visible');
  });
});
