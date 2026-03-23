import { Component, OnInit, AfterViewInit, OnDestroy, signal, ViewChild, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Modal } from 'bootstrap';
import { UsersService, CreateUserRequest } from '../../core/services/users.service';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Benutzerverwaltung" breadcrumb="Benutzerverwaltung"></app-page-header>

    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span><i class="fa-solid fa-people-group me-2"></i><strong>Benutzer</strong></span>
        <button class="btn btn-primary btn-sm" (click)="openCreate()">
          <i class="fa-solid fa-user-plus me-1"></i>Neuer Benutzer
        </button>
      </div>

      <div class="card-body p-0">
        <div class="text-center py-4" *ngIf="isLoading()">
          <div class="spinner-border text-primary"></div>
        </div>

        <div class="table-responsive" *ngIf="!isLoading()">
          <table class="table table-hover mb-0">
            <thead class="table-header-themed">
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Rolle</th>
                <th>Status</th>
                <th>Erstellt</th>
                <th class="text-end">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users()">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                         style="width:36px;height:36px;font-size:0.9rem;font-weight:700;flex-shrink:0">
                      {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                    </div>
                    <div>
                      <div class="fw-bold small">{{ user.firstName }} {{ user.lastName }}</div>
                      <div *ngIf="user.id === currentUser()?.id" class="text-muted" style="font-size:0.7rem">(Du)</div>
                    </div>
                  </div>
                </td>
                <td class="small align-middle">{{ user.email }}</td>
                <td class="align-middle">
                  <span class="badge" [class.bg-danger]="user.isAdmin" [class.bg-secondary]="!user.isAdmin">
                    {{ user.isAdmin ? 'Administrator' : 'Benutzer' }}
                  </span>
                </td>
                <td class="align-middle">
                  <span class="badge" [class.bg-success]="user.isActive" [class.bg-warning]="!user.isActive">
                    {{ user.isActive ? 'Aktiv' : 'Inaktiv' }}
                  </span>
                </td>
                <td class="small text-muted align-middle">{{ user.createdAt | date:'dd.MM.yyyy' }}</td>
                <td class="text-end align-middle">
                  <div class="position-relative d-inline-block">
                    <button class="btn btn-outline-secondary btn-sm"
                            (click)="toggleDropdown(user.id, $event)">
                      <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end"
                         [class.show]="openDropdownId() === user.id"
                         style="position:absolute;right:0;top:100%;z-index:1000">
                      <button class="dropdown-item" (click)="openEdit(user); closeDropdown()">
                        <i class="fa-solid fa-pencil me-2"></i>Bearbeiten
                      </button>
                      <button class="dropdown-item" (click)="toggleActive(user); closeDropdown()">
                        <i class="fa-solid me-2" [class.fa-circle-pause]="user.isActive" [class.fa-circle-play]="!user.isActive"></i>
                        {{ user.isActive ? 'Deaktivieren' : 'Aktivieren' }}
                      </button>
                      <div class="dropdown-divider"></div>
                      <button class="dropdown-item text-danger"
                              (click)="confirmDelete(user); closeDropdown()"
                              [disabled]="user.id === currentUser()?.id">
                        <i class="fa-solid fa-trash me-2"></i>Löschen
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
              <tr *ngIf="users().length === 0">
                <td colspan="6" class="text-center text-muted py-4">Keine Benutzer vorhanden</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" #formModalEl tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-user me-2"></i>{{ editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer' }}
            </h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="form">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Vorname *</label>
                  <input type="text" class="form-control" formControlName="firstName"
                         [class.is-invalid]="form.get('firstName')?.invalid && form.get('firstName')?.touched">
                  <div class="invalid-feedback">Vorname erforderlich</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nachname *</label>
                  <input type="text" class="form-control" formControlName="lastName"
                         [class.is-invalid]="form.get('lastName')?.invalid && form.get('lastName')?.touched">
                  <div class="invalid-feedback">Nachname erforderlich</div>
                </div>
                <div class="col-12">
                  <label class="form-label">E-Mail *</label>
                  <input type="email" class="form-control" formControlName="email"
                         [class.is-invalid]="form.get('email')?.invalid && form.get('email')?.touched">
                  <div class="invalid-feedback">Gültige E-Mail erforderlich</div>
                </div>
                <div class="col-12">
                  <label class="form-label">
                    Passwort {{ editingUser ? '(leer lassen = unverändert)' : '*' }}
                  </label>
                  <input type="password" class="form-control" formControlName="password"
                         [class.is-invalid]="form.get('password')?.invalid && form.get('password')?.touched"
                         autocomplete="new-password">
                  <div class="invalid-feedback">Mind. 8 Zeichen, 1 Großbuchstabe, 1 Zahl</div>
                  <div class="form-text" *ngIf="!editingUser">
                    Mind. 8 Zeichen, 1 Großbuchstabe, 1 Zahl
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="isAdminCheck" formControlName="isAdmin"
                           [disabled]="editingUser?.id === currentUser()?.id">
                    <label class="form-check-label" for="isAdminCheck">
                      <strong>Administrator</strong>
                      <span class="text-muted small ms-2">— darf Benutzer verwalten</span>
                    </label>
                  </div>
                </div>
                <div class="col-12" *ngIf="editingUser">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="isActiveCheck" formControlName="isActive"
                           [disabled]="editingUser?.id === currentUser()?.id">
                    <label class="form-check-label" for="isActiveCheck">
                      <strong>Aktiv</strong>
                      <span class="text-muted small ms-2">— inaktive Benutzer können sich nicht anmelden</span>
                    </label>
                  </div>
                </div>
              </div>
              <div class="alert alert-danger mt-3 mb-0" *ngIf="errorMessage()">
                {{ errorMessage() }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Abbrechen</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="isSaving()">
              <span class="spinner-border spinner-border-sm me-1" *ngIf="isSaving()"></span>
              {{ editingUser ? 'Speichern' : 'Erstellen' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div class="modal fade" #confirmModalEl tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fa-solid fa-trash me-2 text-danger"></i>Benutzer löschen</h5>
            <button type="button" class="btn-close" (click)="cancelDelete()"></button>
          </div>
          <div class="modal-body">{{ confirmMessage }}</div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cancelDelete()">Abbrechen</button>
            <button class="btn btn-danger" (click)="executeDelete()">Löschen</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('formModalEl') formModalEl!: ElementRef;
  @ViewChild('confirmModalEl') confirmModalEl!: ElementRef;

  users = signal<User[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');
  editingUser: User | null = null;
  openDropdownId = signal<string | null>(null);
  confirmMessage = '';

  form!: FormGroup;
  private bsModal!: Modal;
  private bsConfirmModal!: Modal;
  private pendingDeleteUser: User | null = null;

  currentUser;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private fb: FormBuilder,
    private elRef: ElementRef
  ) {
    this.currentUser = this.authService.currentUser;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.openDropdownId.set(null);
    }
  }

  toggleDropdown(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openDropdownId.set(this.openDropdownId() === id ? null : id);
  }

  closeDropdown(): void {
    this.openDropdownId.set(null);
  }

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.bsModal = new Modal(this.formModalEl.nativeElement, { backdrop: 'static', keyboard: false });
    this.bsConfirmModal = new Modal(this.confirmModalEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.bsModal?.dispose();
    this.bsConfirmModal?.dispose();
  }

  load(): void {
    this.isLoading.set(true);
    this.usersService.getAll().subscribe({
      next: (users: User[]) => { this.users.set(users); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  buildForm(user?: User): void {
    const pwValidators = user
      ? [Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9]).*/)]
      : [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9]).*/)];

    this.form = this.fb.group({
      firstName: [user?.firstName ?? '', Validators.required],
      lastName:  [user?.lastName  ?? '', Validators.required],
      email:     [user?.email     ?? '', [Validators.required, Validators.email]],
      password:  ['', pwValidators],
      isAdmin:   [user?.isAdmin   ?? false],
      isActive:  [user?.isActive  ?? true],
    });
  }

  openCreate(): void {
    this.editingUser = null;
    this.errorMessage.set('');
    this.buildForm();
    this.bsModal.show();
  }

  openEdit(user: User): void {
    this.editingUser = user;
    this.errorMessage.set('');
    this.buildForm(user);
    this.bsModal.show();
  }

  closeModal(): void {
    this.bsModal.hide();
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.errorMessage.set('');
    const val = this.form.value;

    if (this.editingUser) {
      const payload: any = {
        firstName: val.firstName,
        lastName: val.lastName,
        email: val.email,
        isAdmin: val.isAdmin,
        isActive: val.isActive,
      };
      if (val.password) payload.password = val.password;

      this.usersService.update(this.editingUser.id, payload).subscribe({
        next: (updated: User) => {
          this.users.update(list => list.map(u => u.id === updated.id ? { ...u, ...updated } : u));
          this.isSaving.set(false);
          this.closeModal();
        },
        error: (err: any) => {
          this.errorMessage.set(err.error?.error ?? 'Fehler beim Speichern');
          this.isSaving.set(false);
        }
      });
    } else {
      const payload: CreateUserRequest = {
        firstName: val.firstName,
        lastName: val.lastName,
        email: val.email,
        password: val.password,
        isAdmin: val.isAdmin,
      };
      this.usersService.create(payload).subscribe({
        next: (user: User) => {
          this.users.update(list => [...list, user]);
          this.isSaving.set(false);
          this.closeModal();
        },
        error: (err: any) => {
          this.errorMessage.set(err.error?.error ?? 'Fehler beim Erstellen');
          this.isSaving.set(false);
        }
      });
    }
  }

  toggleActive(user: User): void {
    this.usersService.update(user.id, { isActive: !user.isActive }).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? { ...u, ...updated } : u));
      }
    });
  }

  confirmDelete(user: User): void {
    this.pendingDeleteUser = user;
    this.confirmMessage = `Soll "${user.firstName} ${user.lastName}" wirklich gelöscht werden? Alle Daten dieses Benutzers bleiben erhalten.`;
    this.bsConfirmModal.show();
  }

  cancelDelete(): void {
    this.bsConfirmModal.hide();
    this.pendingDeleteUser = null;
  }

  executeDelete(): void {
    this.bsConfirmModal.hide();
    if (this.pendingDeleteUser) {
      this.usersService.delete(this.pendingDeleteUser.id).subscribe({
        next: () => this.users.update(list => list.filter(u => u.id !== this.pendingDeleteUser!.id))
      });
    }
    this.pendingDeleteUser = null;
  }
}
