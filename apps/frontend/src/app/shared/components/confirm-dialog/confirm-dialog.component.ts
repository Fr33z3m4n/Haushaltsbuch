import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">{{ message }}</div>
    <div class="modal-footer">
      <button class="btn btn-secondary" (click)="activeModal.dismiss()">Abbrechen</button>
      <button class="btn btn-danger" (click)="activeModal.close('confirmed')">Löschen</button>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() title = 'Bestätigen';
  @Input() message = 'Möchten Sie diesen Eintrag wirklich löschen?';

  constructor(public activeModal: NgbActiveModal) {}
}
