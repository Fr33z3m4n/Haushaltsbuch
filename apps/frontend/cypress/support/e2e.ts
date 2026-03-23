import './commands';

// Store JWT token in localStorage before each test if already logged in
beforeEach(() => {
  // Suppress uncaught exceptions from the app (e.g. SW registration errors in test env)
  cy.on('uncaught:exception', (err) => {
    if (err.message.includes('ServiceWorker') || err.message.includes('ngsw')) {
      return false;
    }
    return true;
  });
});
