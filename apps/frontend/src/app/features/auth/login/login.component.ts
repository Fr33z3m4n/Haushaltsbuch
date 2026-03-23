import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="login-card card p-4">
        <div class="text-center mb-4">
          <div class="login-logo"><i class="fa-solid fa-piggy-bank"></i></div>
          <h2 class="fw-bold mt-2">HaushaltsBuch</h2>
          <p class="text-muted">Bitte melden Sie sich an</p>
        </div>

        <div class="alert alert-danger" *ngIf="errorMessage()">{{ errorMessage() }}</div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label fw-bold small">E-Mail-Adresse</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-envelope"></i></span>
              <input type="email" class="form-control" formControlName="email"
                     placeholder="name@beispiel.de"
                     [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              <div class="invalid-feedback">Bitte geben Sie eine gültige E-Mail-Adresse ein.</div>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold small">Passwort</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-lock"></i></span>
              <input [type]="showPassword() ? 'text' : 'password'" class="form-control"
                     formControlName="password" placeholder="Passwort"
                     [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <button type="button" class="btn btn-outline-secondary" (click)="showPassword.update(v => !v)">
                <i class="fa-solid" [class.fa-eye]="!showPassword()" [class.fa-eye-slash]="showPassword()"></i>
              </button>
              <div class="invalid-feedback">Passwort muss mindestens 6 Zeichen lang sein.</div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 fw-bold"
                  [disabled]="isLoading() || loginForm.invalid">
            <span class="spinner-border spinner-border-sm me-2" *ngIf="isLoading()"></span>
            {{ isLoading() ? 'Anmelden...' : 'Anmelden' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Zugangsdaten.');
        this.isLoading.set(false);
      }
    });
  }
}
