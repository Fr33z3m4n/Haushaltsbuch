import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'gauge', route: '/dashboard' },
  { label: 'Monatsübersicht', icon: 'calendar-check', route: '/monatsübersicht' },
  { label: 'Jahresübersicht', icon: 'calendar', route: '/jahresübersicht' },
  { label: 'Buchungen', icon: 'right-left', route: '/buchungen' },
  { label: 'Konten', icon: 'building-columns', route: '/konten' },
  { label: 'Kategorien', icon: 'tags', route: '/kategorien' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar" [class.mobile-open]="mobileOpen" [class.collapsed]="!desktopOpen">
      <a class="sidebar-brand" routerLink="/dashboard">
        <i class="fa-solid fa-piggy-bank"></i>
        <span>HaushaltsBuch</span>
      </a>

      <hr class="sidebar-divider my-0">

      <ul class="nav flex-column mt-3">
        <li class="sidebar-heading">Navigation</li>

        <li class="nav-item" *ngFor="let item of navItems">
          <a class="nav-link"
             [routerLink]="item.route"
             routerLinkActive="active"
             (click)="onNavClick()">
            <i class="fa-solid fa-{{item.icon}}"></i>
            <span>{{ item.label }}</span>
          </a>
        </li>
      </ul>

      <hr class="sidebar-divider">

      <ul class="nav flex-column">
        <li class="sidebar-heading">Konto</li>
        <li class="nav-item" *ngIf="currentUser()?.isAdmin">
          <a class="nav-link" routerLink="/benutzerverwaltung" routerLinkActive="active" (click)="onNavClick()">
            <i class="fa-solid fa-people-group"></i>
            <span>Benutzerverwaltung</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/einstellungen" routerLinkActive="active" (click)="onNavClick()">
            <i class="fa-solid fa-gear"></i>
            <span>Einstellungen</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" (click)="logout($event)">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Abmelden</span>
          </a>
        </li>
      </ul>

      <div class="mt-auto p-3 sidebar-footer-info">
        <span *ngIf="currentUser()" class="sidebar-user-info">
          <i class="fa-solid fa-circle-user me-1"></i>{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}
        </span>
        <span class="sidebar-version">
          <i class="fa-solid fa-code-branch me-1"></i>v{{ appVersion }}
        </span>
      </div>
    </nav>
  `
})
export class SidebarComponent {
  @Input() mobileOpen = false;
  @Input() desktopOpen = true;
  @Output() navClicked = new EventEmitter<void>();

  navItems = NAV_ITEMS;
  currentUser;
  readonly appVersion = environment.version;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.currentUser;
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
  }

  onNavClick(): void {
    this.navClicked.emit();
  }
}
