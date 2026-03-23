import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" (click)="cancelled.emit()"></button>
    </div>
    <div class="modal-body">{{ message }}</div>
    <div class="modal-footer">
      <button class="btn btn-secondary" (click)="cancelled.emit()">Abbrechen</button>
      <button class="btn btn-danger" (click)="confirmed.emit()">Löschen</button>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() title = 'Bestätigen';
  @Input() message = 'Möchten Sie diesen Eintrag wirklich löschen?';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
