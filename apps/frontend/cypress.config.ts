import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'cypress',
      webServerCommands: {
        default: 'nx run frontend:serve',
      },
    }),
    baseUrl: 'http://localhost:4200',
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    env: {
      apiUrl: 'http://localhost:4200/api',
    },
    setupNodeEvents(on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if ((browser.name === 'chrome' || browser.name === 'chromium') && browser.isHeadless) {
          launchOptions.args.push('--window-size=1440,900');
          launchOptions.args.push('--force-device-scale-factor=1');
          launchOptions.args.push('--hide-scrollbars');
        }
        return launchOptions;
      });
    },
  },
});

