import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'konten',
        loadComponent: () => import('./features/accounts/accounts.component').then(m => m.AccountsComponent)
      },
      {
        path: 'kategorien',
        loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'buchungen',
        loadComponent: () => import('./features/transactions/transactions.component').then(m => m.TransactionsComponent)
      },
      {
        path: 'monatsübersicht',
        loadComponent: () => import('./features/monthly-overview/monthly-overview.component').then(m => m.MonthlyOverviewComponent)
      },
      {
        path: 'jahresübersicht',
        loadComponent: () => import('./features/yearly-overview/yearly-overview.component').then(m => m.YearlyOverviewComponent)
      },
      {
        path: 'einstellungen',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'benutzerverwaltung',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/users-management.component').then(m => m.UsersManagementComponent)
      },
      {
        path: 'quittungen',
        loadComponent: () => import('./features/receipts/receipts.component').then(m => m.ReceiptsComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
