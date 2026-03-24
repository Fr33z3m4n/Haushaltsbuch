/**
 * Marketing Screenshots Spec
 * Generates promotional screenshots for all main app pages.
 * Run: npx cypress run --project apps/frontend --spec "apps/frontend/cypress/e2e/screenshots.cy.ts"
 * Screenshots saved to: apps/frontend/cypress/screenshots/
 */

const VIEWPORT_W = 1440;
const VIEWPORT_H = 900;

const shot = (name: string) =>
  cy.screenshot(`promo/${name}`, { overwrite: true, capture: 'viewport' });

const waitForAngular = () => cy.wait(800);

describe('Marketing Screenshots', () => {
  before(() => {
    cy.viewport(VIEWPORT_W, VIEWPORT_H);
  });

  beforeEach(() => {
    cy.viewport(VIEWPORT_W, VIEWPORT_H);
  });

  // ─── 1. Login ─────────────────────────────────────────────────────────────
  it('01 – Login', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('max.mustermann@haushaltsbuch.de');
    waitForAngular();
    shot('01-login');
  });

  // ─── 2. Dashboard ─────────────────────────────────────────────────────────
  it('02 – Dashboard', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('dashboard').then((dashboard) => {
        cy.fixture('monthly-overview').then((monthly) => {
          cy.fixture('yearly-overview').then((yearly) => {
            cy.intercept('GET', '**/api/auth/profile', { statusCode: 200, body: auth.loginSuccess.user });
            cy.intercept('POST', '**/api/auth/refresh', { statusCode: 200, body: { accessToken: auth.loginSuccess.accessToken } });
            cy.intercept('GET', '**/api/dashboard*', { statusCode: 200, body: dashboard });
            cy.intercept('GET', '**/api/monthly-overview*', { statusCode: 200, body: monthly });
            cy.intercept('GET', '**/api/yearly-overview*', { statusCode: 200, body: yearly });
            cy.intercept('GET', '**/api/accounts*', { statusCode: 200, body: [] });
            cy.intercept('GET', '**/api/categories*', { statusCode: 200, body: [] });
            cy.intercept('GET', '**/api/transactions*', { statusCode: 200, body: [] });
            cy.intercept('GET', '**/api/users*', { statusCode: 200, body: [] });

            cy.visitAuthenticated('/dashboard');
            cy.wait(1200);
            shot('02-dashboard');
          });
        });
      });
    });
  });

  // ─── 3. Jahresübersicht ───────────────────────────────────────────────────
  it('03 – Jahresübersicht', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('yearly-overview').then((yearly) => {
        cy.intercept('GET', '**/api/auth/profile', { statusCode: 200, body: auth.loginSuccess.user });
        cy.intercept('POST', '**/api/auth/refresh', { statusCode: 200, body: { accessToken: auth.loginSuccess.accessToken } });
        cy.intercept('GET', '**/api/yearly-overview*', { statusCode: 200, body: yearly });
        cy.intercept('GET', '**/api/monthly-overview*', { statusCode: 200, body: {} });
        cy.intercept('GET', '**/api/dashboard*', { statusCode: 200, body: {} });

        cy.visitAuthenticated('/jahres%C3%BCbersicht');        cy.wait(1200);
        shot('03-jahresuebersicht');
      });
    });
  });

  // ─── 4. Monatsübersicht ───────────────────────────────────────────────────
  it('04 – Monatsübersicht', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('monthly-overview').then((monthly) => {
        cy.intercept('GET', '**/api/auth/profile', { statusCode: 200, body: auth.loginSuccess.user });
        cy.intercept('POST', '**/api/auth/refresh', { statusCode: 200, body: { accessToken: auth.loginSuccess.accessToken } });
        cy.intercept('GET', '**/api/monthly-overview*', { statusCode: 200, body: monthly });
        cy.intercept('GET', '**/api/yearly-overview*', { statusCode: 200, body: {} });
        cy.intercept('GET', '**/api/dashboard*', { statusCode: 200, body: {} });

        cy.visitAuthenticated('/monats%C3%BCbersicht');
        cy.wait(1200);
        shot('04-monatsuebersicht');
      });
    });
  });

  // ─── 5. Konten ────────────────────────────────────────────────────────────
  it('05 – Konten', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('accounts').then((accounts) => {
        cy.intercept('GET', '**/api/auth/profile', { statusCode: 200, body: auth.loginSuccess.user });
        cy.intercept('POST', '**/api/auth/refresh', { statusCode: 200, body: { accessToken: auth.loginSuccess.accessToken } });
        cy.intercept('GET', '**/api/accounts*', { statusCode: 200, body: accounts });
        cy.intercept('GET', '**/api/dashboard*', { statusCode: 200, body: {} });

        cy.visitAuthenticated('/konten');
        cy.wait(1000);
        shot('05-konten');
      });
    });
  });

  // ─── 6. Kategorien ────────────────────────────────────────────────────────
  it('06 – Kategorien', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('categories').then((categories) => {
        cy.intercept('GET', '**/api/auth/profile', { statusCode: 200, body: auth.loginSuccess.user });
        cy.intercept('POST', '**/api/auth/refresh', { statusCode: 200, body: { accessToken: auth.loginSuccess.accessToken } });
        cy.intercept('GET', '**/api/categories*', { statusCode: 200, body: categories });
        cy.intercept('GET', '**/api/dashboard*', { statusCode: 200, body: {} });

        cy.visitAuthenticated('/kategorien');
        cy.wait(1000);
        shot('06-kategorien');
      });
    });
  });

  // ─── 7. Buchungen ─────────────────────────────────────────────────────────
  it('07 – Buchungen', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('transactions').then((transactions) => {
        cy.fixture('categories').then((categories) => {
          cy.fixture('accounts').then((accounts) => {
            cy.intercept('GET', '**/api/auth/profile', { statusCode: 200, body: auth.loginSuccess.user });
            cy.intercept('POST', '**/api/auth/refresh', { statusCode: 200, body: { accessToken: auth.loginSuccess.accessToken } });
            cy.intercept('GET', '**/api/transactions*', { statusCode: 200, body: transactions });
            cy.intercept('GET', '**/api/categories*', { statusCode: 200, body: categories });
            cy.intercept('GET', '**/api/accounts*', { statusCode: 200, body: accounts });
            cy.intercept('GET', '**/api/dashboard*', { statusCode: 200, body: {} });

            cy.visitAuthenticated('/buchungen');
            cy.wait(1000);
            shot('07-buchungen');
          });
        });
      });
    });
  });

  // ─── 8. Einstellungen ─────────────────────────────────────────────────────
  it('08 – Einstellungen', () => {
    cy.fixture('auth').then((auth) => {
      cy.intercept('GET', '**/api/auth/profile', { statusCode: 200, body: auth.loginSuccess.user });
      cy.intercept('POST', '**/api/auth/refresh', { statusCode: 200, body: { accessToken: auth.loginSuccess.accessToken } });
      cy.intercept('GET', '**/api/dashboard*', { statusCode: 200, body: {} });

      cy.visitAuthenticated('/einstellungen');
      cy.wait(1000);
      shot('08-einstellungen');
    });
  });

  // ─── 9. Benutzerverwaltung ────────────────────────────────────────────────
  it('09 – Benutzerverwaltung', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('users').then((users) => {
        cy.intercept('GET', '**/api/auth/profile', { statusCode: 200, body: auth.loginSuccess.user });
        cy.intercept('POST', '**/api/auth/refresh', { statusCode: 200, body: { accessToken: auth.loginSuccess.accessToken } });
        cy.intercept('GET', '**/api/users*', { statusCode: 200, body: users });
        cy.intercept('GET', '**/api/dashboard*', { statusCode: 200, body: {} });

        cy.visitAuthenticated('/benutzerverwaltung');
        cy.wait(1000);
        shot('09-benutzerverwaltung');
      });
    });
  });
});
