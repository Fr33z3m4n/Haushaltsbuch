import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatCardVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card stat-card stat-{{variant}} mb-4">
      <div class="card-body overflow-hidden">
        <div class="d-flex justify-content-between align-items-center">
          <div class="stat-text-content">
            <div class="stat-label mb-1">{{ label }}</div>
            <div class="stat-value">{{ value }}</div>
            <div *ngIf="subLabel" class="text-muted small mt-1">{{ subLabel }}</div>
          </div>
          <div class="stat-icon d-none d-sm-block flex-shrink-0">
            <i class="fa-solid fa-{{icon}}"></i>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() icon = 'graph-up';
  @Input() variant: StatCardVariant = 'primary';
  @Input() subLabel = '';
}
