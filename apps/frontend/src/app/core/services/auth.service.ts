import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;

  private _currentUser = signal<User | null>(this.loadUserFromStorage());
  private _isAuthenticated = computed(() => this._currentUser() !== null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated;

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(err => throwError(() => err))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<{ accessToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<{ accessToken: string }>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      tap(res => localStorage.setItem('accessToken', res.accessToken))
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    this._currentUser.set(response.user);
  }

  private loadUserFromStorage(): User | null {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }
}
