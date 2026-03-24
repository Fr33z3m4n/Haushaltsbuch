import './commands';

// Disable CSS animations for reliable test assertions (modals, transitions)
// Also hide scrollbars for clean screenshots
Cypress.on('window:before:load', (win) => {
  const style = win.document.createElement('style');
  style.textContent = [
    '*, *::before, *::after { transition-duration: 0ms !important; animation-duration: 0ms !important; }',
    '::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }',
    '* { scrollbar-width: none !important; -ms-overflow-style: none !important; }',
  ].join('\n');
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
