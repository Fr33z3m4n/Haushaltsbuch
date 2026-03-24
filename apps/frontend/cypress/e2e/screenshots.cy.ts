/**
 * Marketing Screenshots Spec
 * Generates promotional screenshots for all main app pages.
 * Desktop: 1440x900 | Mobile: 390x844 (iPhone 14)
 *
 * Run: npx cypress run --project apps/frontend --spec "apps/frontend/cypress/e2e/screenshots.cy.ts"
 * Screenshots saved to: docs/screenshots/
 */

const DESKTOP_W = 1440;
const DESKTOP_H = 900;
const MOBILE_W = 390;
const MOBILE_H = 844;

const hideScrollbars = (win: Window) => {
  const style = win.document.createElement('style');
  style.textContent = [
    '::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }',
    '* { scrollbar-width: none !important; -ms-overflow-style: none !important; }',
  ].join('\n');
  win.document.head.appendChild(style);
};

const shot = (name: string) => {
  cy.window().then((win) => { win.scrollTo(0, 0); });
  cy.screenshot(`promo/${name}`, { overwrite: true, capture: 'viewport' });
};

const waitForRender = () => cy.wait(1000);

const mockCommon = (auth: any) => {
  cy.intercept('GET', '**/api/auth/profile', { statusCode: 200, body: auth.loginSuccess.user });
  cy.intercept('POST', '**/api/auth/refresh', { statusCode: 200, body: { accessToken: auth.loginSuccess.accessToken } });
  cy.intercept('GET', '**/api/dashboard*', { statusCode: 200, body: {} });
};

const visitPage = (auth: any, url: string) => {
  const { accessToken, refreshToken, user } = auth.loginSuccess;
  cy.visit(url, {
    onBeforeLoad(win) {
      win.localStorage.setItem('accessToken', accessToken);
      win.localStorage.setItem('refreshToken', refreshToken);
      win.localStorage.setItem('currentUser', JSON.stringify(user));
      hideScrollbars(win);
    },
  });
};

// ─── DESKTOP ─────────────────────────────────────────────────────────────────
describe('Screenshots – Desktop (1440x900)', () => {
  beforeEach(() => cy.viewport(DESKTOP_W, DESKTOP_H));

  it('01 – Login', () => {
    cy.visit('/login', { onBeforeLoad: hideScrollbars });
    cy.get('input[type="email"]').type('max.mustermann@haushaltsbuch.de');
    waitForRender();
    shot('desktop/01-login');
  });

  it('02 – Dashboard', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('dashboard').then((dashboard) => {
        cy.fixture('monthly-overview').then((monthly) => {
          cy.fixture('yearly-overview').then((yearly) => {
            mockCommon(auth);
            cy.intercept('GET', '**/api/monthly-overview*', { statusCode: 200, body: monthly });
            cy.intercept('GET', '**/api/yearly-overview*', { statusCode: 200, body: yearly });
            cy.intercept('GET', '**/api/accounts*', { statusCode: 200, body: [] });
            cy.intercept('GET', '**/api/categories*', { statusCode: 200, body: [] });
            cy.intercept('GET', '**/api/transactions*', { statusCode: 200, body: [] });
            cy.intercept('GET', '**/api/users*', { statusCode: 200, body: [] });
            cy.intercept('GET', '**/api/dashboard*', { statusCode: 200, body: dashboard });
            visitPage(auth, '/dashboard');
            waitForRender();
            shot('desktop/02-dashboard');
          });
        });
      });
    });
  });

  it('03 – Jahresübersicht', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('yearly-overview').then((yearly) => {
        mockCommon(auth);
        cy.intercept('GET', '**/api/yearly-overview*', { statusCode: 200, body: yearly });
        visitPage(auth, '/jahres%C3%BCbersicht');
        waitForRender();
        shot('desktop/03-jahresuebersicht');
      });
    });
  });

  it('04 – Monatsübersicht', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('monthly-overview').then((monthly) => {
        mockCommon(auth);
        cy.intercept('GET', '**/api/monthly-overview*', { statusCode: 200, body: monthly });
        visitPage(auth, '/monats%C3%BCbersicht');
        waitForRender();
        shot('desktop/04-monatsuebersicht');
      });
    });
  });

  it('05 – Konten', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('accounts').then((accounts) => {
        mockCommon(auth);
        cy.intercept('GET', '**/api/accounts*', { statusCode: 200, body: accounts });
        visitPage(auth, '/konten');
        waitForRender();
        shot('desktop/05-konten');
      });
    });
  });

  it('06 – Kategorien', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('categories').then((categories) => {
        mockCommon(auth);
        cy.intercept('GET', '**/api/categories*', { statusCode: 200, body: categories });
        visitPage(auth, '/kategorien');
        waitForRender();
        shot('desktop/06-kategorien');
      });
    });
  });

  it('07 – Buchungen', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('transactions').then((transactions) => {
        cy.fixture('categories').then((categories) => {
          cy.fixture('accounts').then((accounts) => {
            mockCommon(auth);
            cy.intercept('GET', '**/api/transactions*', { statusCode: 200, body: transactions });
            cy.intercept('GET', '**/api/categories*', { statusCode: 200, body: categories });
            cy.intercept('GET', '**/api/accounts*', { statusCode: 200, body: accounts });
            visitPage(auth, '/buchungen');
            waitForRender();
            shot('desktop/07-buchungen');
          });
        });
      });
    });
  });

  it('08 – Einstellungen', () => {
    cy.fixture('auth').then((auth) => {
      mockCommon(auth);
      visitPage(auth, '/einstellungen');
      waitForRender();
      shot('desktop/08-einstellungen');
    });
  });

  it('09 – Benutzerverwaltung', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('users').then((users) => {
        mockCommon(auth);
        cy.intercept('GET', '**/api/users*', { statusCode: 200, body: users });
        visitPage(auth, '/benutzerverwaltung');
        waitForRender();
        shot('desktop/09-benutzerverwaltung');
      });
    });
  });
});

// ─── MOBILE ──────────────────────────────────────────────────────────────────
describe('Screenshots – Mobile (390x844)', () => {
  beforeEach(() => cy.viewport(MOBILE_W, MOBILE_H));

  it('01 – Login', () => {
    cy.visit('/login', { onBeforeLoad: hideScrollbars });
    cy.get('input[type="email"]').type('max.mustermann@haushaltsbuch.de');
    waitForRender();
    shot('mobile/01-login');
  });

  it('02 – Dashboard', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('dashboard').then((dashboard) => {
        cy.fixture('monthly-overview').then((monthly) => {
          cy.fixture('yearly-overview').then((yearly) => {
            mockCommon(auth);
            cy.intercept('GET', '**/api/monthly-overview*', { statusCode: 200, body: monthly });
            cy.intercept('GET', '**/api/yearly-overview*', { statusCode: 200, body: yearly });
            cy.intercept('GET', '**/api/accounts*', { statusCode: 200, body: [] });
            cy.intercept('GET', '**/api/categories*', { statusCode: 200, body: [] });
            cy.intercept('GET', '**/api/transactions*', { statusCode: 200, body: [] });
            cy.intercept('GET', '**/api/users*', { statusCode: 200, body: [] });
            cy.intercept('GET', '**/api/dashboard*', { statusCode: 200, body: dashboard });
            visitPage(auth, '/dashboard');
            waitForRender();
            shot('mobile/02-dashboard');
          });
        });
      });
    });
  });

  it('03 – Jahresübersicht', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('yearly-overview').then((yearly) => {
        mockCommon(auth);
        cy.intercept('GET', '**/api/yearly-overview*', { statusCode: 200, body: yearly });
        visitPage(auth, '/jahres%C3%BCbersicht');
        waitForRender();
        shot('mobile/03-jahresuebersicht');
      });
    });
  });

  it('04 – Monatsübersicht', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('monthly-overview').then((monthly) => {
        mockCommon(auth);
        cy.intercept('GET', '**/api/monthly-overview*', { statusCode: 200, body: monthly });
        visitPage(auth, '/monats%C3%BCbersicht');
        waitForRender();
        shot('mobile/04-monatsuebersicht');
      });
    });
  });

  it('05 – Konten', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('accounts').then((accounts) => {
        mockCommon(auth);
        cy.intercept('GET', '**/api/accounts*', { statusCode: 200, body: accounts });
        visitPage(auth, '/konten');
        waitForRender();
        shot('mobile/05-konten');
      });
    });
  });

  it('06 – Kategorien', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('categories').then((categories) => {
        mockCommon(auth);
        cy.intercept('GET', '**/api/categories*', { statusCode: 200, body: categories });
        visitPage(auth, '/kategorien');
        waitForRender();
        shot('mobile/06-kategorien');
      });
    });
  });

  it('07 – Buchungen', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('transactions').then((transactions) => {
        cy.fixture('categories').then((categories) => {
          cy.fixture('accounts').then((accounts) => {
            mockCommon(auth);
            cy.intercept('GET', '**/api/transactions*', { statusCode: 200, body: transactions });
            cy.intercept('GET', '**/api/categories*', { statusCode: 200, body: categories });
            cy.intercept('GET', '**/api/accounts*', { statusCode: 200, body: accounts });
            visitPage(auth, '/buchungen');
            waitForRender();
            shot('mobile/07-buchungen');
          });
        });
      });
    });
  });

  it('08 – Einstellungen', () => {
    cy.fixture('auth').then((auth) => {
      mockCommon(auth);
      visitPage(auth, '/einstellungen');
      waitForRender();
      shot('mobile/08-einstellungen');
    });
  });

  it('09 – Benutzerverwaltung', () => {
    cy.fixture('auth').then((auth) => {
      cy.fixture('users').then((users) => {
        mockCommon(auth);
        cy.intercept('GET', '**/api/users*', { statusCode: 200, body: users });
        visitPage(auth, '/benutzerverwaltung');
        waitForRender();
        shot('mobile/09-benutzerverwaltung');
      });
    });
  });
});
