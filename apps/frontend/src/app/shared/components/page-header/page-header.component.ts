import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h1>{{ title }}</h1>
        <nav aria-label="breadcrumb" *ngIf="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a routerLink="/dashboard">Dashboard</a></li>
            <li class="breadcrumb-item active">{{ breadcrumb }}</li>
          </ol>
        </nav>
      </div>
      <ng-content></ng-content>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() breadcrumb = '';
}
