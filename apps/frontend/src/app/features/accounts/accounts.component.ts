import { Component, OnInit, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from '../../core/services/account.service';
import { Account, AccountType, ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_ICONS } from '../../core/models/account.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, NgbDropdownModule],
  template: `
    <app-page-header title="Konten" breadcrumb="Konten">
      <button class="btn btn-primary" (click)="openModal()">
        <i class="fa-solid fa-plus me-1"></i>Neues Konto
      </button>
    </app-page-header>

    <div class="text-center py-5" *ngIf="isLoading()">
      <div class="spinner-border text-primary"></div>
    </div>

    <div class="alert alert-danger alert-dismissible" *ngIf="errorMsg()">
      {{ errorMsg() }}
      <button type="button" class="btn-close" (click)="errorMsg.set('')"></button>
    </div>

    <div class="row" *ngIf="!isLoading()">
      <div class="col-xl-3 col-md-4 col-sm-6 mb-4" *ngFor="let account of accounts()">
        <div class="card h-100" style="border-left: 4px solid {{ account.color }}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="d-flex align-items-center">
                <div class="rounded-circle d-flex align-items-center justify-content-center me-3"
                     [style.background-color]="account.color"
                     style="width:42px;height:42px;opacity:0.9">
                  <i class="fa-solid fa-{{getIcon(account.type)}} text-white fs-5"></i>
                </div>
                <div>
                  <h6 class="mb-0 fw-bold">{{ account.name }}</h6>
                  <span class="badge rounded-pill text-bg-secondary small">{{ getLabel(account.type) }}</span>
                </div>
              </div>
              <div ngbDropdown placement="bottom-end">
                <button class="btn btn-sm btn-link text-muted p-0" ngbDropdownToggle>
                  <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
                <div ngbDropdownMenu class="shadow-sm">
                  <button ngbDropdownItem (click)="openModal(account)">
                    <i class="fa-solid fa-pencil me-2 text-primary"></i>Bearbeiten
                  </button>
                  <button ngbDropdownItem class="text-danger" (click)="confirmDelete(account)">
                    <i class="fa-solid fa-trash me-2"></i>Loeschen
                  </button>
                </div>
              </div>
            </div>
            <p class="text-muted small mb-0" *ngIf="account.description">{{ account.description }}</p>
            <p class="text-muted small mb-0" *ngIf="!account.description"><em>Keine Beschreibung</em></p>
          </div>
          <div class="card-footer bg-transparent border-0">
            <span class="badge" [class.bg-success]="account.isActive" [class.bg-secondary]="!account.isActive">
              {{ account.isActive ? 'Aktiv' : 'Inaktiv' }}
            </span>
          </div>
        </div>
      </div>

      <div class="col-12 text-center py-5" *ngIf="accounts().length === 0">
        <i class="fa-solid fa-building-columns fs-1 text-muted d-block mb-3"></i>
        <p class="text-muted">Noch keine Konten vorhanden. Erstellen Sie Ihr erstes Konto.</p>
        <button class="btn btn-primary" (click)="openModal()">
          <i class="fa-solid fa-plus me-1"></i>Konto hinzufuegen
        </button>
      </div>
    </div>

    <ng-template #formModal>
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="fa-solid fa-building-columns me-2"></i>
          {{ editingAccount() ? 'Konto bearbeiten' : 'Neues Konto' }}
        </h5>
        <button type="button" class="btn-close" (click)="closeModal()"></button>
      </div>
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="modal-body">
          <div class="alert alert-danger" *ngIf="saveError()">{{ saveError() }}</div>
          <div class="mb-3">
            <label class="form-label fw-bold small">Name <span class="text-danger">*</span></label>
            <input type="text" class="form-control" formControlName="name" placeholder="z.B. Girokonto"
                   [class.is-invalid]="form.get('name')?.invalid && form.get('name')?.touched">
            <div class="invalid-feedback">Name ist erforderlich.</div>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold small">Typ <span class="text-danger">*</span></label>
            <select class="form-select" formControlName="type">
              <option value="bank">Bank</option>
              <option value="paypal">PayPal</option>
              <option value="credit_card">Kreditkarte</option>
              <option value="cash">Barvermoegen</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold small">Beschreibung</label>
            <textarea class="form-control" formControlName="description" rows="2"
                      placeholder="Optionale Beschreibung"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold small">Farbe</label>
            <div class="d-flex align-items-center gap-3">
              <input type="color" class="form-control form-control-color" formControlName="color"
                     style="width:50px;height:38px">
              <span class="text-muted small">Waehlen Sie eine Farbe</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeModal()">Abbrechen</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSaving()">
            <span class="spinner-border spinner-border-sm me-1" *ngIf="isSaving()"></span>
            {{ isSaving() ? 'Speichern...' : 'Speichern' }}
          </button>
        </div>
      </form>
    </ng-template>
  `
})
export class AccountsComponent implements OnInit {
  @ViewChild('formModal') formModal!: TemplateRef<unknown>;

  accounts = signal<Account[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  editingAccount = signal<Account | null>(null);
  isSaving = signal(false);
  saveError = signal('');

  form: FormGroup;
  private modalRef: NgbModalRef | null = null;

  constructor(
    private accountService: AccountService,
    private fb: FormBuilder,
    private ngbModal: NgbModal
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['bank', Validators.required],
      description: [''],
      color: ['#4e73df']
    });
  }

  ngOnInit(): void { this.loadAccounts(); }

  loadAccounts(): void {
    this.isLoading.set(true);
    this.accountService.getAll().subscribe({
      next: (data) => { this.accounts.set(data); this.isLoading.set(false); },
      error: () => { this.errorMsg.set('Fehler beim Laden der Konten.'); this.isLoading.set(false); }
    });
  }

  openModal(account?: Account): void {
    this.editingAccount.set(account ?? null);
    this.saveError.set('');
    if (account) {
      this.form.patchValue({ name: account.name, type: account.type, description: account.description ?? '', color: account.color });
    } else {
      this.form.reset({ name: '', type: 'bank', description: '', color: '#4e73df' });
    }
    this.modalRef = this.ngbModal.open(this.formModal, { centered: true, backdrop: 'static' });
  }

  closeModal(): void {
    this.modalRef?.close();
    this.modalRef = null;
    this.editingAccount.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    this.saveError.set('');
    const request = this.editingAccount()
      ? this.accountService.update(this.editingAccount()!.id, this.form.value)
      : this.accountService.create(this.form.value);
    request.subscribe({
      next: () => { this.isSaving.set(false); this.closeModal(); this.loadAccounts(); },
      error: (err) => { this.saveError.set(err.error?.message ?? 'Fehler beim Speichern.'); this.isSaving.set(false); }
    });
  }

  confirmDelete(account: Account): void {
    const ref = this.ngbModal.open(ConfirmDialogComponent, { centered: true });
    ref.componentInstance.title = 'Konto loeschen';
    ref.componentInstance.message = `Moechten Sie das Konto "${account.name}" wirklich loeschen?`;
    ref.result.then((r) => { if (r === 'confirmed') this.doDelete(account); }, () => {});
  }

  private doDelete(account: Account): void {
    this.accountService.delete(account.id).subscribe({
      next: () => this.loadAccounts(),
      error: () => this.errorMsg.set('Fehler beim Loeschen.')
    });
  }

  getLabel(type: AccountType): string { return ACCOUNT_TYPE_LABELS[type]; }
  getIcon(type: AccountType): string { return ACCOUNT_TYPE_ICONS[type]; }
}
