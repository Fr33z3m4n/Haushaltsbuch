import './commands';

// Disable CSS animations for reliable test assertions (modals, transitions)
Cypress.on('window:before:load', (win) => {
  const style = win.document.createElement('style');
  style.textContent = '*, *::before, *::after { transition-duration: 0ms !important; animation-duration: 0ms !important; }';
  win.document.head.appendChild(style);
});

beforeEach(() => {
  cy.on('uncaught:exception', (err) => {
    if (err.message.includes('ServiceWorker') || err.message.includes('ngsw')) {
      return false;
    }
    return true;
  });
});
