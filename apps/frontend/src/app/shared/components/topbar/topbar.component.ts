import { Component, Output, EventEmitter, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  template: `
    <nav class="topbar">
      <button class="btn btn-link topbar-icon-btn me-3" (click)="toggleSidebar.emit()">
        <i class="fa-solid fa-bars fs-4"></i>
      </button>

      <div class="ms-auto d-flex align-items-center gap-1">
        <span class="text-muted small me-2 d-none d-md-block">
          {{ currentDate | date:'EEEE, d. MMMM yyyy':'':'de' }}
        </span>

        <div class="topbar-divider d-none d-md-block"></div>

        <!-- Dark mode toggle -->
        <button class="btn btn-link topbar-icon-btn"
                (click)="themeService.toggle()"
                [title]="themeService.isDark() ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'">
          <i class="fa-solid fs-5" [class.fa-moon]="!themeService.isDark()" [class.fa-sun]="themeService.isDark()"></i>
        </button>

        <div class="topbar-divider d-none d-md-block"></div>

        <!-- User dropdown -->
        <div class="dropdown" [class.show]="dropdownOpen()">
          <button class="btn btn-link topbar-icon-btn d-flex align-items-center"
                  type="button"
                  (click)="toggleDropdown($event)">
            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                 style="width:35px;height:35px;font-size:0.8rem;font-weight:700">
              {{ userInitials }}
            </div>
            <span class="d-none d-md-block small fw-bold">{{ userName }}</span>
            <i class="fa-solid fa-chevron-down ms-1 small"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-end shadow" [class.show]="dropdownOpen()">
            <a class="dropdown-item" routerLink="/einstellungen" (click)="dropdownOpen.set(false)">
              <i class="fa-solid fa-gear me-2"></i>Einstellungen
            </a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#" (click)="logout($event)">
              <i class="fa-solid fa-right-from-bracket me-2"></i>Abmelden
            </a>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  currentDate = new Date();
  dropdownOpen = signal(false);

  get userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  get userName(): string {
    const user = this.authService.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private elementRef: ElementRef
  ) {}

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen.set(false);
    }
  }

  logout(event: Event): void {
    event.preventDefault();
    this.dropdownOpen.set(false);
    this.authService.logout();
  }
}

