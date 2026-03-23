import { Component, OnInit, AfterViewInit, OnDestroy, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { CategoryService } from '../../core/services/category.service';
import { Transaction, TransactionType, FREQUENCY_LABELS, getMonthlyAmount } from '../../core/models/transaction.model';
import { Account } from '../../core/models/account.model';
import { Category } from '../../core/models/category.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CurrencyDePipe } from '../../shared/pipes/currency-de.pipe';
import { FrequencyLabelPipe } from '../../shared/pipes/frequency-label.pipe';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PageHeaderComponent, CurrencyDePipe, FrequencyLabelPipe],
  template: `
    <app-page-header title="Buchungen" breadcrumb="Buchungen">
      <button class="btn btn-primary" (click)="openModal()">
        <i class="fa-solid fa-plus me-1"></i>Neue Buchung
      </button>
    </app-page-header>

    <div class="card mb-4">
      <div class="card-body py-2">
        <div class="row g-2 align-items-center">
          <div class="col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
              <input type="text" class="form-control" placeholder="Suchen..." [(ngModel)]="searchTerm" (input)="applyFilter()">
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" [(ngModel)]="filterType" (change)="applyFilter()">
              <option value="">Alle Typen</option>
              <option value="income">Einnahmen</option>
              <option value="expense">Ausgaben</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" [(ngModel)]="filterFrequency" (change)="applyFilter()">
              <option value="">Alle Intervalle</option>
              <option value="monthly">Monatlich</option>
              <option value="quarterly">Vierteljaehrlich</option>
              <option value="semi_annual">Halbjaehrlich</option>
              <option value="annual">Jaehrlich</option>
            </select>
          </div>
          <div class="col-md-2 text-end">
            <button class="btn btn-sm btn-outline-secondary" (click)="clearFilter()">
              <i class="fa-solid fa-circle-xmark me-1"></i>Zuruecksetzen
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center py-5" *ngIf="isLoading()">
      <div class="spinner-border text-primary"></div>
    </div>

    <div class="alert alert-danger alert-dismissible" *ngIf="errorMsg()">
      {{ errorMsg() }}
      <button type="button" class="btn-close" (click)="errorMsg.set('')"></button>
    </div>

    <div class="card" *ngIf="!isLoading()">
      <div class="card-header d-flex justify-content-between align-items-center border-left-primary">
        <span><i class="fa-solid fa-right-left me-2"></i>Buchungen ({{ filteredTransactions().length }})</span>
      </div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-header-themed">
            <tr>
              <th class="sortable-th" (click)="setSort('name')">
                Name <i class="fa-solid" [ngClass]="sortIcon('name')"></i>
              </th>
              <th class="sortable-th" (click)="setSort('amount')">
                Betrag <i class="fa-solid" [ngClass]="sortIcon('amount')"></i>
              </th>
              <th class="sortable-th" (click)="setSort('monthly')">
                Monatlich <i class="fa-solid" [ngClass]="sortIcon('monthly')"></i>
              </th>
              <th class="sortable-th" (click)="setSort('frequency')">
                Intervall <i class="fa-solid" [ngClass]="sortIcon('frequency')"></i>
              </th>
              <th class="sortable-th" (click)="setSort('account')">
                Konto <i class="fa-solid" [ngClass]="sortIcon('account')"></i>
              </th>
              <th class="sortable-th" (click)="setSort('category')">
                Kategorie <i class="fa-solid" [ngClass]="sortIcon('category')"></i>
              </th>
              <th class="sortable-th" (click)="setSort('dayOfMonth')">
                Fällig am <i class="fa-solid" [ngClass]="sortIcon('dayOfMonth')"></i>
              </th>
              <th class="sortable-th" (click)="setSort('startDate')">
                Von <i class="fa-solid" [ngClass]="sortIcon('startDate')"></i>
              </th>
              <th class="sortable-th" (click)="setSort('endDate')">
                Bis <i class="fa-solid" [ngClass]="sortIcon('endDate')"></i>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of filteredTransactions()">
              <td>
                <span class="badge me-1" [class.bg-success]="t.type === 'income'" [class.bg-danger]="t.type === 'expense'">
                  <i class="fa-solid" [class.fa-arrow-up]="t.type === 'income'" [class.fa-arrow-down]="t.type === 'expense'"></i>
                </span>
                {{ t.name }}
              </td>
              <td class="fw-bold" [class.text-success]="t.type === 'income'" [class.text-danger]="t.type === 'expense'">
                {{ t.amount | currencyDe }}
              </td>
              <td class="text-muted small">
                <span *ngIf="t.frequency !== 'monthly'">{{ getMonthly(t.amount, t.frequency) | currencyDe }}</span>
                <span *ngIf="t.frequency === 'monthly'">-</span>
              </td>
              <td><span class="badge" [ngClass]="getFrequencyClass(t.frequency)">{{ t.frequency | frequencyLabel }}</span></td>
              <td>
                <span *ngIf="t.account" class="d-flex align-items-center gap-1">
                  <span class="rounded-circle" [style.background-color]="t.account.color" style="width:10px;height:10px;display:inline-block"></span>
                  {{ t.account.name }}
                </span>
                <span *ngIf="!t.account" class="text-muted small">-</span>
              </td>
              <td>
                <span *ngIf="t.category" class="badge rounded-pill"
                      [style.background-color]="t.category.color + '30'"
                      [style.color]="t.category.color"
                      [style.border]="'1px solid ' + t.category.color">
                  <i class="fa-solid fa-{{t.category.icon || 'tag'}} me-1"></i>{{ t.category.name }}
                </span>
                <span *ngIf="!t.category" class="text-muted small">-</span>
              </td>
              <td class="text-muted small">{{ t.dayOfMonth }}.</td>
              <td class="text-muted small">{{ t.startDate | date:'dd.MM.yyyy' }}</td>
              <td class="text-muted small">{{ t.endDate ? (t.endDate | date:'dd.MM.yyyy') : '-' }}</td>
              <td>
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-outline-primary" (click)="openModal(t)"><i class="fa-solid fa-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(t)"><i class="fa-solid fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredTransactions().length === 0">
              <td colspan="10" class="text-center py-4 text-muted">
                <i class="fa-solid fa-inbox fs-3 d-block mb-2"></i>Keine Buchungen gefunden.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form Modal -->
    <div class="modal fade" #formModalEl tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-right-left me-2"></i>
              {{ editingTransaction() ? 'Buchung bearbeiten' : 'Neue Buchung' }}
            </h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="modal-body">
              <div class="alert alert-danger" *ngIf="saveError()">{{ saveError() }}</div>
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label fw-bold small">Bezeichnung <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="name" placeholder="z.B. Miete"
                         [class.is-invalid]="form.get('name')?.invalid && form.get('name')?.touched">
                  <div class="invalid-feedback">Bezeichnung ist erforderlich.</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold small">Typ <span class="text-danger">*</span></label>
                  <select class="form-select" formControlName="type">
                    <option value="income">Einnahme</option>
                    <option value="expense">Ausgabe</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold small">Betrag (EUR) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text">EUR</span>
                    <input type="number" class="form-control" formControlName="amount" placeholder="0.00" step="0.01" min="0"
                           [class.is-invalid]="form.get('amount')?.invalid && form.get('amount')?.touched">
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold small">Intervall <span class="text-danger">*</span></label>
                  <select class="form-select" formControlName="frequency">
                    <option value="monthly">Monatlich</option>
                    <option value="quarterly">Vierteljaehrlich</option>
                    <option value="semi_annual">Halbjaehrlich</option>
                    <option value="annual">Jaehrlich</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-bold small">Faellig am (Tag) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input type="number" class="form-control" formControlName="dayOfMonth" placeholder="1" min="1" max="31"
                           [class.is-invalid]="form.get('dayOfMonth')?.invalid && form.get('dayOfMonth')?.touched">
                    <span class="input-group-text">. des Monats</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Konto <span class="text-danger">*</span></label>
                  <select class="form-select" formControlName="accountId"
                          [class.is-invalid]="form.get('accountId')?.invalid && form.get('accountId')?.touched">
                    <option value="">Konto auswaehlen...</option>
                    <option *ngFor="let acc of accounts()" [value]="acc.id">{{ acc.name }}</option>
                  </select>
                  <div class="invalid-feedback">Bitte waehlen Sie ein Konto aus.</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Kategorie <span class="text-danger">*</span></label>
                  <select class="form-select" formControlName="categoryId"
                          [class.is-invalid]="form.get('categoryId')?.invalid && form.get('categoryId')?.touched">
                    <option value="">Kategorie auswaehlen...</option>
                    <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
                  </select>
                  <div class="invalid-feedback">Bitte waehlen Sie eine Kategorie aus.</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Startdatum <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" formControlName="startDate"
                         [class.is-invalid]="form.get('startDate')?.invalid && form.get('startDate')?.touched">
                  <div class="invalid-feedback">Startdatum ist erforderlich.</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Enddatum <span class="text-muted">(optional)</span></label>
                  <input type="date" class="form-control" formControlName="endDate">
                  <div class="form-text">Leer lassen wenn unbegrenzt.</div>
                </div>
                <div class="col-12">
                  <label class="form-label fw-bold small">Notizen</label>
                  <textarea class="form-control" formControlName="notes" rows="2" placeholder="Optionale Anmerkungen..."></textarea>
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
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div class="modal fade" #confirmModalEl tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fa-solid fa-trash me-2 text-danger"></i>Buchung loeschen</h5>
            <button type="button" class="btn-close" (click)="cancelDelete()"></button>
          </div>
          <div class="modal-body">{{ confirmMessage }}</div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cancelDelete()">Abbrechen</button>
            <button class="btn btn-danger" (click)="executeDelete()">Loeschen</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TransactionsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('formModalEl') formModalEl!: ElementRef;
  @ViewChild('confirmModalEl') confirmModalEl!: ElementRef;

  transactions = signal<Transaction[]>([]);
  filteredTransactions = signal<Transaction[]>([]);
  accounts = signal<Account[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  editingTransaction = signal<Transaction | null>(null);
  isSaving = signal(false);
  saveError = signal('');
  confirmMessage = '';

  searchTerm = '';
  filterType = '';
  filterFrequency = '';
  sortCol = '';
  sortDir: 'asc' | 'desc' = 'asc';

  form: FormGroup;
  private bsModal!: Modal;
  private bsConfirmModal!: Modal;
  private pendingDeleteTransaction: Transaction | null = null;

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['expense', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      frequency: ['monthly', Validators.required],
      dayOfMonth: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
      accountId: ['', Validators.required],
      categoryId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      notes: ['']
    });
  }

  ngOnInit(): void { this.loadAll(); }

  ngAfterViewInit(): void {
    this.bsModal = new Modal(this.formModalEl.nativeElement, { backdrop: 'static', keyboard: false });
    this.bsConfirmModal = new Modal(this.confirmModalEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.bsModal?.dispose();
    this.bsConfirmModal?.dispose();
  }

  loadAll(): void {
    this.isLoading.set(true);
    this.accountService.getAll().subscribe(data => this.accounts.set(data));
    this.categoryService.getAll().subscribe(data => this.categories.set(data));
    this.transactionService.getAll().subscribe({
      next: (data) => { this.transactions.set(data); this.filteredTransactions.set(this.sortTransactions(data)); this.isLoading.set(false); },
      error: () => { this.errorMsg.set('Fehler beim Laden.'); this.isLoading.set(false); }
    });
  }

  applyFilter(): void {
    let result = this.transactions();
    if (this.searchTerm) result = result.filter(t => t.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    if (this.filterType) result = result.filter(t => t.type === this.filterType);
    if (this.filterFrequency) result = result.filter(t => t.frequency === this.filterFrequency);
    this.filteredTransactions.set(this.sortTransactions(result));
  }

  clearFilter(): void {
    this.searchTerm = '';
    this.filterType = '';
    this.filterFrequency = '';
    this.filteredTransactions.set(this.sortTransactions(this.transactions()));
  }

  private sortTransactions(list: Transaction[]): Transaction[] {
    if (this.sortCol) {
      return [...list].sort((a, b) => {
        const dir = this.sortDir === 'asc' ? 1 : -1;
        const val = (t: Transaction): string | number => {
          switch (this.sortCol) {
            case 'name':       return t.name;
            case 'amount':     return t.amount;
            case 'monthly':    return getMonthlyAmount(t.amount, t.frequency);
            case 'frequency':  return t.frequency;
            case 'account':    return t.account?.name ?? '';
            case 'category':   return t.category?.name ?? '';
            case 'dayOfMonth': return t.dayOfMonth;
            case 'startDate':  return t.startDate ?? '';
            case 'endDate':    return t.endDate ?? '';
            default: return '';
          }
        };
        const av = val(a), bv = val(b);
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), 'de') * dir;
      });
    }
    // Default: income first → category → name
    return [...list].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'income' ? -1 : 1;
      const catA = a.category?.name ?? '';
      const catB = b.category?.name ?? '';
      if (catA !== catB) return catA.localeCompare(catB, 'de');
      return a.name.localeCompare(b.name, 'de');
    });
  }

  setSort(col: string): void {
    if (this.sortCol === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = col;
      this.sortDir = 'asc';
    }
    this.filteredTransactions.set(this.sortTransactions(this.filteredTransactions()));
  }

  sortIcon(col: string): string {
    if (this.sortCol !== col) return 'fa-sort text-muted opacity-50';
    return this.sortDir === 'asc' ? 'fa-sort-up text-primary' : 'fa-sort-down text-primary';
  }

  openModal(transaction?: Transaction): void {
    this.editingTransaction.set(transaction ?? null);
    this.saveError.set('');
    if (transaction) {
      this.form.patchValue({
        name: transaction.name, type: transaction.type, amount: transaction.amount,
        frequency: transaction.frequency, dayOfMonth: transaction.dayOfMonth,
        accountId: transaction.accountId, categoryId: transaction.categoryId,
        startDate: transaction.startDate, endDate: transaction.endDate ?? '', notes: transaction.notes ?? ''
      });
    } else {
      this.form.reset({
        name: '', type: 'expense', amount: null, frequency: 'monthly',
        dayOfMonth: 1, accountId: '', categoryId: '',
        startDate: new Date().toISOString().split('T')[0], endDate: '', notes: ''
      });
    }
    this.bsModal.show();
  }

  closeModal(): void {
    this.bsModal.hide();
    this.editingTransaction.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    this.saveError.set('');
    const data = { ...this.form.value };
    // Send null explicitly so the backend clears the field; deleting would leave old value unchanged
    if (!data.endDate) data.endDate = null;
    const request = this.editingTransaction()
      ? this.transactionService.update(this.editingTransaction()!.id, data)
      : this.transactionService.create(data);
    request.subscribe({
      next: () => { this.isSaving.set(false); this.closeModal(); this.loadAll(); },
      error: (err) => { this.saveError.set(err.error?.message ?? 'Fehler beim Speichern.'); this.isSaving.set(false); }
    });
  }

  confirmDelete(transaction: Transaction): void {
    this.pendingDeleteTransaction = transaction;
    this.confirmMessage = `Moechten Sie die Buchung "${transaction.name}" wirklich loeschen?`;
    this.bsConfirmModal.show();
  }

  cancelDelete(): void {
    this.bsConfirmModal.hide();
    this.pendingDeleteTransaction = null;
  }

  executeDelete(): void {
    this.bsConfirmModal.hide();
    if (this.pendingDeleteTransaction) this.doDelete(this.pendingDeleteTransaction);
    this.pendingDeleteTransaction = null;
  }

  private doDelete(transaction: Transaction): void {
    this.transactionService.delete(transaction.id).subscribe({
      next: () => this.loadAll(),
      error: () => this.errorMsg.set('Fehler beim Loeschen.')
    });
  }

  getMonthly(amount: number, frequency: string): number { return getMonthlyAmount(amount, frequency as any); }

  getFrequencyClass(frequency: string): string {
    const map: Record<string, string> = {
      monthly: 'badge-monthly', quarterly: 'badge-quarterly',
      semi_annual: 'badge-semi-annual', annual: 'badge-annual'
    };
    return map[frequency] ?? 'bg-secondary';
  }
}
