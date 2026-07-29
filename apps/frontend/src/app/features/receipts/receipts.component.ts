import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ReceiptService, OcrExtractResult } from '../../core/services/receipt.service';
import { AccountService } from '../../core/services/account.service';
import { CategoryService } from '../../core/services/category.service';
import { Account } from '../../core/models/account.model';
import { Category } from '../../core/models/category.model';
import { Transaction } from '../../core/models/transaction.model';

type UploadState = 'idle' | 'uploading' | 'preview' | 'saving' | 'success' | 'error';

@Component({
  selector: 'app-receipts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container-fluid px-4">

      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800 fw-bold">
          <i class="fa-solid fa-receipt me-2 text-warning"></i>Quittungen
        </h1>
      </div>

      <div class="row">
        <!-- ── Upload Card ─────────────────────────────────────────────── -->
        <div class="col-lg-5 mb-4">
          <div class="card shadow-sm">
            <div class="card-header py-3">
              <h6 class="m-0 fw-bold text-primary">
                <i class="fa-solid fa-cloud-arrow-up me-2"></i>Neue Quittung hochladen
              </h6>
            </div>
            <div class="card-body d-flex flex-column">

              <!-- Drop Zone -->
              <div class="drop-zone flex-grow-1 d-flex flex-column align-items-center justify-content-center gap-3 p-4 rounded"
                   [class.drag-over]="isDragging()"
                   [class.disabled]="state() === 'uploading' || state() === 'saving'"
                   (dragover)="onDragOver($event)"
                   (dragleave)="onDragLeave()"
                   (drop)="onDrop($event)"
                   (click)="fileInput.click()">
                <ng-container *ngIf="state() !== 'uploading'; else spinner">
                  <i class="fa-solid fa-file-image fa-3x text-muted"></i>
                  <div class="text-center">
                    <p class="mb-1 fw-semibold">Datei hier ablegen oder klicken</p>
                    <small class="text-muted">JPG, PNG, WEBP, PDF · max. 20 MB</small>
                  </div>
                  <span *ngIf="selectedFileName()" class="badge bg-secondary text-truncate" style="max-width:200px">
                    {{ selectedFileName() }}
                  </span>
                </ng-container>
                <ng-template #spinner>
                  <div class="spinner-border text-warning" role="status"></div>
                  <span class="text-muted">OCR wird ausgeführt…</span>
                </ng-template>
              </div>

              <input #fileInput type="file" class="d-none"
                     accept="image/jpeg,image/png,image/webp,image/tiff,application/pdf"
                     (change)="onFileSelected($event)">
              <input #cameraInput type="file" class="d-none"
                     accept="image/jpeg,image/png,image/webp"
                     capture="environment"
                     (change)="onFileSelected($event)">

              <div class="d-flex gap-2 mt-3">
                <button class="btn btn-outline-secondary flex-shrink-0" title="Kamera öffnen"
                        [disabled]="state() === 'uploading' || state() === 'saving'"
                        (click)="cameraInput.click()">
                  <i class="fa-solid fa-camera"></i>
                </button>
                <button class="btn btn-warning flex-grow-1"
                        [disabled]="!selectedFile() || state() === 'uploading' || state() === 'saving'"
                        (click)="upload()">
                  <i class="fa-solid fa-magnifying-glass me-2"></i>Text erkennen
                </button>
              </div>

              <div *ngIf="state() === 'error'" class="alert alert-danger mt-3 mb-0 py-2">
                <i class="fa-solid fa-triangle-exclamation me-2"></i>{{ errorMessage() }}
              </div>

              <div *ngIf="rawText()" class="mt-3">
                <button class="btn btn-sm btn-outline-secondary w-100" type="button"
                        (click)="showRaw.set(!showRaw())">
                  <i class="fa-solid fa-code me-1"></i>
                  {{ showRaw() ? 'Roherkennung ausblenden' : 'Roherkennung anzeigen' }}
                </button>
                <pre *ngIf="showRaw()" class="mt-2 p-2 bg-light rounded small" style="max-height:180px;overflow:auto;font-size:0.7rem">{{ rawText() }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- ── OCR Preview / Correction Form ──────────────────────────── -->
        <div class="col-lg-7 mb-4"
             *ngIf="state() === 'preview' || state() === 'saving' || state() === 'success'">
          <div class="card shadow-sm">
            <div class="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 class="m-0 fw-bold text-primary">
                <i class="fa-solid fa-pen-to-square me-2"></i>Erkannte Daten prüfen
              </h6>
              <span class="badge" [class]="confidenceBadgeClass()">
                Konfidenz: {{ (ocrResult()?.confidence ?? 0) * 100 | number:'1.0-0' }}%
              </span>
            </div>
            <div class="card-body">
              <div *ngIf="state() === 'success'" class="alert alert-success d-flex align-items-center gap-2 mb-3">
                <i class="fa-solid fa-circle-check fa-lg"></i>
                <div><strong>Gespeichert!</strong> Die Quittung erscheint in der Monats- und Jahresübersicht.</div>
              </div>

              <form [formGroup]="form" (ngSubmit)="save()" *ngIf="state() !== 'success'">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label fw-semibold">
                      <i class="fa-solid fa-store me-1 text-muted"></i>Händler / Beschreibung
                    </label>
                    <input type="text" class="form-control" formControlName="merchant"
                           placeholder="z.B. Rewe, Aldi, Kino…"
                           [class.is-invalid]="form.get('merchant')?.invalid && form.get('merchant')?.touched">
                    <div class="invalid-feedback">Bitte einen Händlernamen eingeben.</div>
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label fw-semibold">
                      <i class="fa-solid fa-euro-sign me-1 text-muted"></i>Betrag (€)
                    </label>
                    <input type="number" class="form-control" formControlName="amount"
                           step="0.01" min="0.01" placeholder="0,00"
                           [class.is-invalid]="form.get('amount')?.invalid && form.get('amount')?.touched">
                    <div class="invalid-feedback">Bitte einen gültigen Betrag eingeben.</div>
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label fw-semibold">
                      <i class="fa-solid fa-calendar me-1 text-muted"></i>Datum
                    </label>
                    <input type="date" class="form-control" formControlName="date"
                           [class.is-invalid]="form.get('date')?.invalid && form.get('date')?.touched">
                    <div class="invalid-feedback">Bitte ein Datum wählen.</div>
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label fw-semibold">
                      <i class="fa-solid fa-building-columns me-1 text-muted"></i>Konto
                    </label>
                    <select class="form-select" formControlName="accountId"
                            [class.is-invalid]="form.get('accountId')?.invalid && form.get('accountId')?.touched">
                      <option value="">Konto wählen…</option>
                      <option *ngFor="let acc of accounts()" [value]="acc.id">{{ acc.name }}</option>
                    </select>
                    <div class="invalid-feedback">Bitte ein Konto auswählen.</div>
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label fw-semibold">
                      <i class="fa-solid fa-tags me-1 text-muted"></i>Kategorie
                      <small class="text-muted fw-normal">(Standard: Quittungen)</small>
                    </label>
                    <select class="form-select" formControlName="categoryId">
                      <option value="">Automatisch (Quittungen)</option>
                      <option *ngFor="let cat of expenseCategories()" [value]="cat.id">{{ cat.name }}</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold">
                      <i class="fa-solid fa-note-sticky me-1 text-muted"></i>Notiz
                    </label>
                    <textarea class="form-control" formControlName="notes" rows="2"
                              placeholder="Weitere Infos…"></textarea>
                  </div>
                  <div class="col-12 d-flex gap-2">
                    <button type="submit" class="btn btn-success flex-grow-1"
                            [disabled]="form.invalid || state() === 'saving'">
                      <span *ngIf="state() !== 'saving'">
                        <i class="fa-solid fa-floppy-disk me-2"></i>Quittung speichern
                      </span>
                      <span *ngIf="state() === 'saving'">
                        <span class="spinner-border spinner-border-sm me-2"></span>Wird gespeichert…
                      </span>
                    </button>
                    <button type="button" class="btn btn-outline-secondary" (click)="reset()">
                      <i class="fa-solid fa-rotate-left"></i>
                    </button>
                  </div>
                </div>
              </form>

              <button *ngIf="state() === 'success'" class="btn btn-outline-warning w-100 mt-2" (click)="reset()">
                <i class="fa-solid fa-plus me-2"></i>Weitere Quittung hochladen
              </button>
            </div>
          </div>
        </div>

        <!-- Placeholder when no OCR result yet -->
        <div class="col-lg-7 mb-4"
             *ngIf="state() === 'idle' || state() === 'uploading' || state() === 'error'">
          <div class="card shadow-sm h-100 border-dashed">
            <div class="card-body d-flex flex-column align-items-center justify-content-center gap-3 text-muted p-5">
              <i class="fa-solid fa-file-circle-question fa-4x"></i>
              <p class="mb-0 text-center">Lade eine Quittung hoch, um die erkannten Daten zu prüfen.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Saved Receipts Table ─────────────────────────────────────────── -->
      <div class="card shadow-sm mb-4">
        <div class="card-header py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h6 class="m-0 fw-bold text-primary">
            <i class="fa-solid fa-list me-2"></i>Gespeicherte Quittungen
            <span class="badge bg-secondary ms-2">{{ filteredReceipts().length }}</span>
          </h6>
          <div class="d-flex gap-2 flex-wrap">
            <!-- Search -->
            <div class="input-group input-group-sm" style="width:220px">
              <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
              <input type="text" class="form-control" placeholder="Suchen…"
                     [(ngModel)]="searchTerm" (ngModelChange)="applyFilter()">
            </div>
            <!-- Month filter -->
            <input type="month" class="form-control form-control-sm" style="width:150px"
                   [(ngModel)]="filterMonth" (ngModelChange)="applyFilter()">
            <!-- Clear -->
            <button class="btn btn-sm btn-outline-secondary" *ngIf="searchTerm || filterMonth"
                    (click)="clearFilter()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <div class="card-body p-0">
          <!-- Loading -->
          <div *ngIf="loadingReceipts()" class="text-center py-4">
            <div class="spinner-border text-warning" role="status"></div>
          </div>

          <!-- Empty -->
          <div *ngIf="!loadingReceipts() && filteredReceipts().length === 0"
               class="text-center py-5 text-muted">
            <i class="fa-solid fa-receipt fa-3x mb-3"></i>
            <p class="mb-0">Keine Quittungen gefunden.</p>
          </div>

          <!-- Table -->
          <div class="table-responsive" *ngIf="!loadingReceipts() && filteredReceipts().length > 0">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-3" (click)="sortBy('date')" style="cursor:pointer;white-space:nowrap">
                    Datum <i class="fa-solid fa-sort ms-1 text-muted"></i>
                  </th>
                  <th (click)="sortBy('name')" style="cursor:pointer">
                    Händler <i class="fa-solid fa-sort ms-1 text-muted"></i>
                  </th>
                  <th>Konto</th>
                  <th>Notiz</th>
                  <th class="text-end" (click)="sortBy('amount')" style="cursor:pointer">
                    Betrag <i class="fa-solid fa-sort ms-1 text-muted"></i>
                  </th>
                  <th class="pe-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of filteredReceipts()">
                  <td class="ps-3 text-nowrap">{{ formatDate(r.startDate) }}</td>
                  <td class="fw-semibold">{{ r.name }}</td>
                  <td>
                    <span *ngIf="r.account" class="badge rounded-pill"
                          [style.background]="r.account.color">
                      {{ r.account.name }}
                    </span>
                  </td>
                  <td class="text-muted small">{{ r.notes || '—' }}</td>
                  <td class="text-end fw-bold text-danger">
                    {{ r.amount | number:'1.2-2' }} €
                  </td>
                  <td class="pe-3 text-end">
                    <button class="btn btn-sm btn-outline-danger"
                            (click)="deleteReceipt(r)"
                            title="Quittung löschen">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot class="table-light" *ngIf="filteredReceipts().length > 1">
                <tr>
                  <td colspan="4" class="ps-3 fw-bold">Gesamt</td>
                  <td class="text-end fw-bold text-danger">{{ totalAmount() | number:'1.2-2' }} €</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .drop-zone {
      border: 2px dashed #dee2e6;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
      min-height: 180px;
      background: #f8f9fa;
    }
    .drop-zone:hover:not(.disabled), .drop-zone.drag-over {
      border-color: #ffc107;
      background: #fffbf0;
    }
    .drop-zone.disabled { cursor: not-allowed; opacity: 0.7; }
    .border-dashed { border: 2px dashed #dee2e6 !important; }
    th[style*="cursor"] { user-select: none; }
  `]
})
export class ReceiptsComponent implements OnInit {
  // Upload state
  state = signal<UploadState>('idle');
  isDragging = signal(false);
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string | null>(null);
  ocrResult = signal<OcrExtractResult | null>(null);
  rawText = signal<string | null>(null);
  showRaw = signal(false);
  errorMessage = signal<string>('');

  // Reference data
  accounts = signal<Account[]>([]);
  categories = signal<Category[]>([]);
  expenseCategories = computed(() => this.categories().filter(c => c.type === 'expense'));

  // Receipts table
  allReceipts = signal<Transaction[]>([]);
  filteredReceipts = signal<Transaction[]>([]);
  loadingReceipts = signal(true);
  searchTerm = '';
  filterMonth = '';
  sortField: 'date' | 'name' | 'amount' = 'date';
  sortDir: 1 | -1 = -1;

  totalAmount = computed(() =>
    this.filteredReceipts().reduce((s, r) => s + Number(r.amount), 0)
  );

  confidenceBadgeClass = computed(() => {
    const c = this.ocrResult()?.confidence ?? 0;
    if (c >= 0.8) return 'badge bg-success';
    if (c >= 0.5) return 'badge bg-warning text-dark';
    return 'badge bg-danger';
  });

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private receiptService: ReceiptService,
    private accountService: AccountService,
    private categoryService: CategoryService,
  ) {
    this.form = this.fb.group({
      merchant: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [this.todayStr(), Validators.required],
      accountId: ['', Validators.required],
      categoryId: [''],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.accountService.getAll().subscribe(a => this.accounts.set(a));
    this.categoryService.getAll().subscribe(c => this.categories.set(c));
    this.loadReceipts();
  }

  private loadReceipts(): void {
    this.loadingReceipts.set(true);
    this.receiptService.getAll().subscribe({
      next: (data) => {
        this.allReceipts.set(data);
        this.applyFilter();
        this.loadingReceipts.set(false);
      },
      error: () => this.loadingReceipts.set(false),
    });
  }

  applyFilter(): void {
    let result = [...this.allReceipts()];

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.trim().toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q) ||
        r.account?.name?.toLowerCase().includes(q)
      );
    }

    if (this.filterMonth) {
      result = result.filter(r => r.startDate?.startsWith(this.filterMonth));
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (this.sortField === 'date') cmp = (a.startDate ?? '').localeCompare(b.startDate ?? '');
      else if (this.sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (this.sortField === 'amount') cmp = Number(a.amount) - Number(b.amount);
      return cmp * this.sortDir;
    });

    this.filteredReceipts.set(result);
  }

  sortBy(field: 'date' | 'name' | 'amount'): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 1 ? -1 : 1;
    } else {
      this.sortField = field;
      this.sortDir = field === 'date' ? -1 : 1;
    }
    this.applyFilter();
  }

  clearFilter(): void {
    this.searchTerm = '';
    this.filterMonth = '';
    this.applyFilter();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  deleteReceipt(receipt: Transaction): void {
    if (!confirm(`Quittung "${receipt.name}" löschen?`)) return;
    this.receiptService.delete(receipt.id).subscribe({
      next: () => {
        this.allReceipts.update(list => list.filter(r => r.id !== receipt.id));
        this.applyFilter();
      },
    });
  }

  private todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  onDragOver(e: DragEvent): void { e.preventDefault(); if (this.state() !== 'uploading') this.isDragging.set(true); }
  onDragLeave(): void { this.isDragging.set(false); }
  onDrop(e: DragEvent): void {
    e.preventDefault(); this.isDragging.set(false);
    const file = e.dataTransfer?.files[0]; if (file) this.setFile(file);
  }
  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0]; if (file) this.setFile(file); input.value = '';
  }
  private setFile(file: File): void {
    this.selectedFile.set(file); this.selectedFileName.set(file.name);
    this.state.set('idle'); this.ocrResult.set(null); this.rawText.set(null);
  }

  upload(): void {
    const file = this.selectedFile(); if (!file) return;
    this.state.set('uploading'); this.errorMessage.set('');
    this.receiptService.extract(file).subscribe({
      next: (result) => {
        this.ocrResult.set(result); this.rawText.set(result.raw_text);
        this.form.patchValue({ merchant: result.merchant ?? '', amount: result.amount ?? null, date: result.date ?? this.todayStr() });
        this.state.set('preview');
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.error || err?.error?.detail || 'OCR-Dienst nicht erreichbar.');
        this.state.set('error');
      },
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.state.set('saving');
    const { merchant, amount, date, accountId, categoryId, notes } = this.form.value;
    this.receiptService.save({ merchant, amount: Number(amount), date, accountId, categoryId: categoryId || undefined, notes: notes || undefined }).subscribe({
      next: () => { this.state.set('success'); this.loadReceipts(); },
      error: (err) => { this.errorMessage.set(err?.error?.error || 'Fehler beim Speichern.'); this.state.set('preview'); },
    });
  }

  reset(): void {
    this.state.set('idle'); this.selectedFile.set(null); this.selectedFileName.set(null);
    this.ocrResult.set(null); this.rawText.set(null); this.showRaw.set(false); this.errorMessage.set('');
    this.form.reset({ date: this.todayStr(), categoryId: '', notes: '' });
  }
}
