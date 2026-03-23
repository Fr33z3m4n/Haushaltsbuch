declare global {
  interface Window {
    __env?: Record<string, string>;
  }
}

export const environment = {
  production: true,
  version: '1.0.1',
  get apiUrl(): string {
    return window.__env?.['apiUrl'] ?? '/api';
  }
};
