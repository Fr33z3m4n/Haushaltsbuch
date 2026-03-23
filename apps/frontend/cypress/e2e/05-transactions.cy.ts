describe('Buchungen', () => {
  beforeEach(() => {
    cy.mockAll();
    cy.login();
    cy.visit('/buchungen');
    cy.wait('@getTransactions');
  });

  it('zeigt die Buchungsliste an', () => {
    cy.contains('Buchungen').should('be.visible');
    cy.contains('Gehalt').should('be.visible');
    cy.contains('Miete').should('be.visible');
  });

  it('zeigt Einnahmen und Ausgaben als Badges', () => {
    cy.get('.badge.bg-success').should('exist'); // income
    cy.get('.badge.bg-danger').should('exist');  // expense
  });

  it('öffnet das Formular-Modal für neue Buchung', () => {
    cy.contains('Neue Buchung').click();
    cy.get('.modal.show').should('be.visible');
    cy.get('.modal-title').should('contain', 'Neue Buchung');
  });

  it('schließt das Modal beim Klick auf Abbrechen', () => {
    cy.contains('Neue Buchung').click();
    cy.get('.modal.show').contains('Abbrechen').click();
    cy.get('.modal.show').should('not.exist');
  });

  it('speichert eine neue Buchung', () => {
    const newTx = {
      id: 'tx-new', name: 'Netflix', type: 'expense', amount: 13.99,
      frequency: 'monthly', dayOfMonth: 5, startDate: '2024-01-01', endDate: null,
      accountId: 'acc-1', categoryId: 'cat-2', notes: '',
      account: { id: 'acc-1', name: 'Girokonto', color: '#4e73df' },
      category: { id: 'cat-2', name: 'Miete', color: '#e74a3b', icon: 'house' },
    };
    cy.intercept('POST', '/api/transactions', { statusCode: 201, body: newTx }).as('createTx');

    cy.contains('Neue Buchung').click();
    cy.get('.modal.show input[formControlName="name"]').type('Netflix');
    cy.get('.modal.show select[formControlName="type"]').select('expense');
    cy.get('.modal.show input[formControlName="amount"]').type('13.99');
    cy.get('.modal.show select[formControlName="frequency"]').select('monthly');
    cy.get('.modal.show input[formControlName="dayOfMonth"]').clear().type('5');
    cy.get('.modal.show select[formControlName="accountId"]').select('Girokonto');
    cy.get('.modal.show select[formControlName="categoryId"]').select('Miete');
    cy.get('.modal.show input[formControlName="startDate"]').type('2024-01-01');
    cy.get('.modal.show button[type="submit"]').click();
    cy.wait('@createTx');
    cy.get('.modal.show').should('not.exist');
  });

  it('filtert Buchungen nach Typ', () => {
    cy.get('select').contains('Alle Typen').parent().select('income');
    cy.contains('Miete').should('not.exist');
    cy.contains('Gehalt').should('be.visible');
  });

  it('sucht nach Buchungen', () => {
    cy.get('input[placeholder*="Suchen"]').type('Miete');
    cy.contains('Gehalt').should('not.exist');
    cy.contains('Miete').should('be.visible');
  });

  it('setzt Filter zurück', () => {
    cy.get('input[placeholder*="Suchen"]').type('Miete');
    cy.contains('Zuruecksetzen').click();
    cy.contains('Gehalt').should('be.visible');
    cy.contains('Miete').should('be.visible');
  });

  it('öffnet Bearbeiten-Modal', () => {
    cy.get('.btn-outline-primary').first().click();
    cy.get('.modal.show').should('be.visible');
    cy.get('.modal-title').should('contain', 'Buchung bearbeiten');
  });

  it('löscht eine Buchung', () => {
    cy.intercept('DELETE', '/api/transactions/tx-1', { statusCode: 200, body: {} }).as('deleteTx');
    cy.get('.btn-outline-danger').first().click();
    cy.get('.modal.show .btn-danger').click();
    cy.wait('@deleteTx');
  });
});
