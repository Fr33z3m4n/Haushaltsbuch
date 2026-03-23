import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Einstellungen" breadcrumb="Einstellungen"></app-page-header>

    <div class="row">
      <!-- Profile Info -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header border-left-primary">
            <i class="fa-solid fa-circle-user me-2"></i><strong>Mein Profil</strong>
          </div>
          <div class="card-body">
            <div class="d-flex align-items-center mb-4">
              <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                   style="width:64px;height:64px;font-size:1.5rem;font-weight:700">
                {{ userInitials }}
              </div>
              <div>
                <h5 class="mb-0 fw-bold">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</h5>
                <p class="text-muted mb-0">{{ currentUser()?.email }}</p>
                <span class="badge" [class.bg-warning]="currentUser()?.isAdmin" [class.bg-secondary]="!currentUser()?.isAdmin">
                  {{ currentUser()?.isAdmin ? 'Administrator' : 'Benutzer' }}
                </span>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold small text-muted">Vorname</label>
              <div class="form-control-plaintext border rounded px-3 py-2 bg-themed">
                {{ currentUser()?.firstName }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold small text-muted">Nachname</label>
              <div class="form-control-plaintext border rounded px-3 py-2 bg-themed">
                {{ currentUser()?.lastName }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold small text-muted">E-Mail-Adresse</label>
              <div class="form-control-plaintext border rounded px-3 py-2 bg-themed">
                {{ currentUser()?.email }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header border-left-warning">
            <i class="fa-solid fa-shield-halved me-2"></i><strong>Passwort ändern</strong>
          </div>
          <div class="card-body">
            <div class="alert alert-success d-flex align-items-center" *ngIf="successMsg()">
              <i class="fa-solid fa-circle-check me-2"></i>{{ successMsg() }}
            </div>
            <div class="alert alert-danger" *ngIf="errorMsg()">{{ errorMsg() }}</div>

            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <div class="mb-3">
                <label class="form-label fw-bold small">Aktuelles Passwort <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fa-solid fa-lock"></i></span>
                  <input [type]="showCurrent() ? 'text' : 'password'" class="form-control"
                         formControlName="currentPassword" placeholder="Aktuelles Passwort"
                         [class.is-invalid]="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched">
                  <button type="button" class="btn btn-outline-secondary" (click)="showCurrent.update(v => !v)">
                    <i class="fa-solid" [class.fa-eye]="!showCurrent()" [class.fa-eye-slash]="showCurrent()"></i>
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold small">Neues Passwort <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fa-solid fa-lock"></i></span>
                  <input [type]="showNew() ? 'text' : 'password'" class="form-control"
                         formControlName="newPassword" placeholder="Mindestens 8 Zeichen"
                         [class.is-invalid]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched">
                  <button type="button" class="btn btn-outline-secondary" (click)="showNew.update(v => !v)">
                    <i class="fa-solid" [class.fa-eye]="!showNew()" [class.fa-eye-slash]="showNew()"></i>
                  </button>
                  <div class="invalid-feedback">Mindestens 8 Zeichen erforderlich.</div>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold small">Passwort bestätigen <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fa-solid fa-lock"></i></span>
                  <input [type]="showConfirm() ? 'text' : 'password'" class="form-control"
                         formControlName="confirmPassword" placeholder="Passwort wiederholen"
                         [class.is-invalid]="passwordForm.hasError('mismatch') && passwordForm.get('confirmPassword')?.touched">
                  <button type="button" class="btn btn-outline-secondary" (click)="showConfirm.update(v => !v)">
                    <i class="fa-solid" [class.fa-eye]="!showConfirm()" [class.fa-eye-slash]="showConfirm()"></i>
                  </button>
                  <div class="invalid-feedback">Passwörter stimmen nicht überein.</div>
                </div>
              </div>

              <div class="d-grid">
                <button type="submit" class="btn btn-warning fw-bold"
                        [disabled]="passwordForm.invalid || isSaving()">
                  <span class="spinner-border spinner-border-sm me-1" *ngIf="isSaving()"></span>
                  <i class="fa-solid fa-shield-halved me-1" *ngIf="!isSaving()"></i>
                  {{ isSaving() ? 'Wird gespeichert...' : 'Passwort ändern' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="col-12">
        <div class="card border-danger">
          <div class="card-header bg-danger text-white">
            <i class="fa-solid fa-triangle-exclamation me-2"></i><strong>Sitzung</strong>
          </div>
          <div class="card-body">
            <p class="text-muted mb-3">Melden Sie sich von dieser Anwendung ab.</p>
            <button class="btn btn-outline-danger" (click)="logout()">
              <i class="fa-solid fa-right-from-bracket me-2"></i>Abmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  currentUser;
  isLoading = signal(false);
  isSaving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  showCurrent = signal(false);
  showNew = signal(false);
  showConfirm = signal(false);

  passwordForm: FormGroup;

  get userInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.currentUser = this.authService.currentUser;
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPw = form.get('newPassword')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return newPw === confirm ? null : { mismatch: true };
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isSaving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.http.post(`${environment.apiUrl}/auth/change-password`, { currentPassword, newPassword }).subscribe({
      next: () => {
        this.successMsg.set('Passwort erfolgreich geändert.');
        this.passwordForm.reset();
        this.isSaving.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Fehler beim Ändern des Passworts.');
        this.isSaving.set(false);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
