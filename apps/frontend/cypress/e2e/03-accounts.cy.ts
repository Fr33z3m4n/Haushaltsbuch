describe('Konten', () => {
  beforeEach(() => {
    cy.mockAll();
    cy.login();
    cy.visit('/konten');
    cy.wait('@getAccounts');
  });

  it('zeigt die Kontenliste an', () => {
    cy.contains('Girokonto').should('be.visible');
    cy.contains('PayPal').should('be.visible');
    cy.contains('Kreditkarte').should('be.visible');
  });

  it('zeigt den "Neues Konto" Button', () => {
    cy.contains('Neues Konto').should('be.visible');
  });

  it('öffnet das Modal beim Klick auf "Neues Konto"', () => {
    cy.contains('Neues Konto').click();
    cy.get('.modal.show').should('be.visible');
    cy.get('.modal-title').should('contain', 'Neues Konto');
  });

  it('schließt das Modal beim Klick auf Abbrechen', () => {
    cy.contains('Neues Konto').click();
    cy.get('.modal.show').should('be.visible');
    cy.get('.modal.show').contains('Abbrechen').click();
    cy.get('.modal.show').should('not.exist');
  });

  it('speichert ein neues Konto', () => {
    cy.fixture('accounts').then((accounts) => {
      const newAccount = { id: 'acc-new', name: 'Sparkasse', type: 'bank', color: '#4e73df', isActive: true };
      cy.intercept('POST', '/api/accounts', { statusCode: 201, body: newAccount }).as('createAccount');
      cy.intercept('GET', '/api/accounts', { statusCode: 200, body: [...accounts, newAccount] }).as('getAccountsUpdated');
    });

    cy.contains('Neues Konto').click();
    cy.get('.modal.show input[formControlName="name"]').type('Sparkasse');
    cy.get('.modal.show button[type="submit"]').click();
    cy.wait('@createAccount');
    cy.get('.modal.show').should('not.exist');
  });

  it('öffnet Bearbeiten-Modal für ein Konto', () => {
    // Open dropdown for first account
    cy.get('.fa-ellipsis-vertical').first().click();
    cy.contains('Bearbeiten').first().click();
    cy.get('.modal.show').should('be.visible');
    cy.get('.modal-title').should('contain', 'Konto bearbeiten');
    cy.get('.modal.show input[formControlName="name"]').should('have.value', 'Girokonto');
  });

  it('öffnet Löschen-Bestätigung', () => {
    cy.get('.fa-ellipsis-vertical').first().click();
    cy.contains('Loeschen').first().click();
    cy.get('.modal.show').should('be.visible');
    cy.get('.modal.show .btn-danger').should('contain', 'Loeschen');
  });

  it('löscht ein Konto nach Bestätigung', () => {
    cy.intercept('DELETE', '/api/accounts/acc-1', { statusCode: 200, body: {} }).as('deleteAccount');
    cy.fixture('accounts').then((accounts) => {
      cy.intercept('GET', '/api/accounts', { statusCode: 200, body: accounts.filter((a: any) => a.id !== 'acc-1') }).as('getAccountsAfterDelete');
    });

    cy.get('.fa-ellipsis-vertical').first().click();
    cy.contains('Loeschen').first().click();
    cy.get('.modal.show .btn-danger').click();
    cy.wait('@deleteAccount');
  });
});
