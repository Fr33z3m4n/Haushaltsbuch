describe('Benutzerverwaltung', () => {
  beforeEach(() => {
    cy.mockAll();
    cy.visitAuthenticated('/benutzerverwaltung');
    cy.wait('@getUsers');
  });

  it('zeigt die Benutzerliste an', () => {
    cy.contains('Benutzerverwaltung').should('be.visible');
    cy.contains('Max Mustermann').should('be.visible');
    cy.contains('Erika Musterfrau').should('be.visible');
  });

  it('zeigt Rollen-Badges', () => {
    cy.contains('Administrator').should('be.visible');
    cy.contains('Benutzer').should('be.visible');
  });

  it('öffnet Modal für neuen Benutzer', () => {
    cy.contains('Neuer Benutzer').click();
    cy.get('.modal.show').should('be.visible');
    cy.get('.modal-title').should('contain', 'Neuer Benutzer');
  });

  it('schließt das Modal beim Abbrechen', () => {
    cy.contains('Neuer Benutzer').click();
    cy.get('.modal.show').contains('Abbrechen').click();
    cy.get('.modal.show').should('not.exist');
  });

  it('erstellt einen neuen Benutzer', () => {
    const newUser = {
      id: '3', firstName: 'Hans', lastName: 'Meyer',
      email: 'hans@test.de', isAdmin: false, isActive: true,
      createdAt: new Date().toISOString()
    };
    cy.intercept('POST', '**/api/users*', { statusCode: 201, body: newUser }).as('createUser');

    cy.contains('Neuer Benutzer').click();
    cy.get('.modal.show input[formControlName="firstName"]').type('Hans');
    cy.get('.modal.show input[formControlName="lastName"]').type('Meyer');
    cy.get('.modal.show input[formControlName="email"]').type('hans@test.de');
    cy.get('.modal.show input[formControlName="password"]').type('Sicher1234!');
    cy.get('.modal.show').contains('Erstellen').click();
    cy.wait('@createUser');
    cy.get('.modal.show').should('not.exist');
  });

  it('öffnet Bearbeiten-Modal für einen Benutzer', () => {
    cy.get('.fa-ellipsis-vertical').first().click();
    cy.contains('Bearbeiten').first().click();
    cy.get('.modal.show').should('be.visible');
    cy.get('.modal-title').should('contain', 'Benutzer bearbeiten');
  });
});
