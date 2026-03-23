import { Injectable, ApplicationRef, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first } from 'rxjs/operators';
import { interval, concat } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UpdateService {
  private swUpdate = inject(SwUpdate);
  private appRef = inject(ApplicationRef);

  init(): void {
    if (!this.swUpdate.isEnabled) return;

    // Warte bis die App stabil ist, dann alle 6h auf Updates prüfen
    const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable));
    const everyTwoHours$ = interval(2 * 60 * 60 * 1000);
    concat(appIsStable$, everyTwoHours$).subscribe(() => this.swUpdate.checkForUpdate());

    // Wenn neue Version verfügbar → automatisch neu laden
    this.swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => {
        console.log('[PWA] Neue Version verfügbar – lade neu...');
        document.location.reload();
      });

    // Nicht wiederherstellbarer SW-Fehler → neu laden
    this.swUpdate.unrecoverable.subscribe(() => {
      console.warn('[PWA] Service Worker nicht wiederherstellbar – lade neu...');
      document.location.reload();
    });
  }
}
