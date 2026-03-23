import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <!-- Mobile backdrop: closes sidebar when clicked -->
    <div class="sidebar-backdrop"
         *ngIf="sidebarOpen()"
         (click)="sidebarOpen.set(false)">
    </div>

    <app-sidebar
      [mobileOpen]="sidebarOpen()"
      [desktopOpen]="sidebarDesktopOpen()"
      (navClicked)="sidebarOpen.set(false)"></app-sidebar>

    <div class="content-wrapper" [class.sidebar-collapsed]="!sidebarDesktopOpen()">
      <app-topbar (toggleSidebar)="toggleSidebar()"></app-topbar>

      <main class="page-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .sidebar-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1040;
    }
  `]
})
export class MainLayoutComponent {
  sidebarOpen = signal(false);
  sidebarDesktopOpen = signal(true);

  toggleSidebar(): void {
    if (window.innerWidth < 768) {
      this.sidebarOpen.update(v => !v);
    } else {
      this.sidebarDesktopOpen.update(v => !v);
    }
  }
}
