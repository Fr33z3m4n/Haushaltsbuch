import { Component, OnInit, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { UsersService, CreateUserRequest } from '../../core/services/users.service';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, NgbDropdownModule],
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
                  <div ngbDropdown placement="bottom-end" container="body">
                    <button class="btn btn-outline-secondary btn-sm" ngbDropdownToggle>
                      <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <div ngbDropdownMenu>
                      <button ngbDropdownItem (click)="openEdit(user)">
                        <i class="fa-solid fa-pencil me-2"></i>Bearbeiten
                      </button>
                      <button ngbDropdownItem (click)="toggleActive(user)">
                        <i class="fa-solid me-2" [class.fa-circle-pause]="user.isActive" [class.fa-circle-play]="!user.isActive"></i>
                        {{ user.isActive ? 'Deaktivieren' : 'Aktivieren' }}
                      </button>
                      <div class="dropdown-divider"></div>
                      <button ngbDropdownItem class="text-danger"
                              (click)="confirmDelete(user)"
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

    <!-- Create/Edit Modal Template -->
    <ng-template #formModal let-modal>
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="fa-solid fa-user me-2"></i>{{ editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer' }}
        </h5>
        <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
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
        <button class="btn btn-secondary" (click)="modal.dismiss()">Abbrechen</button>
        <button class="btn btn-primary" (click)="save()" [disabled]="isSaving()">
          <span class="spinner-border spinner-border-sm me-1" *ngIf="isSaving()"></span>
          {{ editingUser ? 'Speichern' : 'Erstellen' }}
        </button>
      </div>
    </ng-template>
  `
})
export class UsersManagementComponent implements OnInit {
  @ViewChild('formModal') formModal!: TemplateRef<unknown>;

  users = signal<User[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');
  editingUser: User | null = null;

  form!: FormGroup;
  private modalRef: any;

  currentUser;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private ngbModal: NgbModal,
    private fb: FormBuilder
  ) {
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.load();
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
    this.modalRef = this.ngbModal.open(this.formModal, { centered: true, backdrop: 'static' });
  }

  openEdit(user: User): void {
    this.editingUser = user;
    this.errorMessage.set('');
    this.buildForm(user);
    this.modalRef = this.ngbModal.open(this.formModal, { centered: true, backdrop: 'static' });
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
          this.modalRef?.close();
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
          this.modalRef?.close();
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
    const ref = this.ngbModal.open(ConfirmDialogComponent, { centered: true });
    ref.componentInstance.title = 'Benutzer löschen';
    ref.componentInstance.message = `Soll "${user.firstName} ${user.lastName}" wirklich gelöscht werden? Alle Daten dieses Benutzers bleiben erhalten.`;
    ref.result.then(result => {
      if (result === 'confirmed') {
        this.usersService.delete(user.id).subscribe({
          next: () => this.users.update(list => list.filter(u => u.id !== user.id))
        });
      }
    }).catch(() => {});
  }
}
