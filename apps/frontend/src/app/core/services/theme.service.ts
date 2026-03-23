import { Injectable, signal, effect } from '@angular/core';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'haushaltsbuch.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.loadTheme());

  readonly isDark = () => this._theme() === 'dark';
  readonly theme = this._theme.asReadonly();

  constructor() {
    effect(() => {
      const t = this._theme();
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem(STORAGE_KEY, t);
    });
  }

  toggle(): void {
    this._theme.set(this._theme() === 'dark' ? 'light' : 'dark');
  }

  private loadTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
