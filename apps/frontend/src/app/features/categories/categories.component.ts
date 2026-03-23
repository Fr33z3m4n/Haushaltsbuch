import { Component, OnInit, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from '../../core/services/category.service';
import { Category, CategoryType } from '../../core/models/category.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Kategorien" breadcrumb="Kategorien">
      <button class="btn btn-primary" (click)="openModal()">
        <i class="fa-solid fa-plus me-1"></i>Neue Kategorie
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
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header border-left-success d-flex justify-content-between align-items-center">
            <span><i class="fa-solid fa-circle-arrow-up me-2 text-success"></i>Einnahmen-Kategorien</span>
            <span class="badge bg-success">{{ incomeCategories().length }}</span>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush" *ngIf="incomeCategories().length > 0">
              <div class="list-group-item d-flex align-items-center justify-content-between py-3"
                   *ngFor="let cat of incomeCategories()">
                <div class="d-flex align-items-center">
                  <div class="rounded-circle me-3 d-flex align-items-center justify-content-center"
                       [style.background-color]="cat.color + '20'"
                       [style.border]="'2px solid ' + cat.color"
                       style="width:40px;height:40px">
                    <i class="fa-solid fa-{{cat.icon || 'tag'}}" [style.color]="cat.color"></i>
                  </div>
                  <div>
                    <div class="fw-bold small">{{ cat.name }}</div>
                    <div class="text-muted" style="font-size:0.7rem">{{ cat.icon || 'tag' }}</div>
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary" (click)="openModal(cat)">
                    <i class="fa-solid fa-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(cat)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="text-center py-4 text-muted" *ngIf="incomeCategories().length === 0">
              <i class="fa-solid fa-folder-plus fs-3 d-block mb-2"></i>Keine Einnahmen-Kategorien
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header border-left-danger d-flex justify-content-between align-items-center">
            <span><i class="fa-solid fa-circle-arrow-down me-2 text-danger"></i>Ausgaben-Kategorien</span>
            <span class="badge bg-danger">{{ expenseCategories().length }}</span>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush" *ngIf="expenseCategories().length > 0">
              <div class="list-group-item d-flex align-items-center justify-content-between py-3"
                   *ngFor="let cat of expenseCategories()">
                <div class="d-flex align-items-center">
                  <div class="rounded-circle me-3 d-flex align-items-center justify-content-center"
                       [style.background-color]="cat.color + '20'"
                       [style.border]="'2px solid ' + cat.color"
                       style="width:40px;height:40px">
                    <i class="fa-solid fa-{{cat.icon || 'tag'}}" [style.color]="cat.color"></i>
                  </div>
                  <div>
                    <div class="fw-bold small">{{ cat.name }}</div>
                    <div class="text-muted" style="font-size:0.7rem">{{ cat.icon || 'tag' }}</div>
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary" (click)="openModal(cat)">
                    <i class="fa-solid fa-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(cat)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="text-center py-4 text-muted" *ngIf="expenseCategories().length === 0">
              <i class="fa-solid fa-folder-plus fs-3 d-block mb-2"></i>Keine Ausgaben-Kategorien
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #formModal>
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="fa-solid fa-tags me-2"></i>
          {{ editingCategory() ? 'Kategorie bearbeiten' : 'Neue Kategorie' }}
        </h5>
        <button type="button" class="btn-close" (click)="closeModal()"></button>
      </div>
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="modal-body">
          <div class="alert alert-danger" *ngIf="saveError()">{{ saveError() }}</div>
          <div class="mb-3">
            <label class="form-label fw-bold small">Name <span class="text-danger">*</span></label>
            <input type="text" class="form-control" formControlName="name" placeholder="z.B. Gehalt"
                   [class.is-invalid]="form.get('name')?.invalid && form.get('name')?.touched">
            <div class="invalid-feedback">Name ist erforderlich.</div>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold small">Typ <span class="text-danger">*</span></label>
            <select class="form-select" formControlName="type">
              <option value="income">Einnahme</option>
              <option value="expense">Ausgabe</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold small">Font Awesome Icon Name</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fa-solid fa-{{form.get('icon')?.value || 'tag'}}"></i>
              </span>
              <input type="text" class="form-control" formControlName="icon" placeholder="z.B. house, cart, briefcase">
            </div>
            <div class="form-text">
              Geben Sie einen <a href="https://fontawesome.com/icons?s=solid&f=classic" target="_blank">Font Awesome</a>-Icon-Namen ein (nur den Namen, z.B. <code>house</code>, <code>cart-shopping</code>).
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold small">Farbe</label>
            <div class="d-flex align-items-center gap-3">
              <input type="color" class="form-control form-control-color" formControlName="color" style="width:50px;height:38px">
              <span class="text-muted small">Vorschau:</span>
              <div class="rounded-circle d-flex align-items-center justify-content-center"
                   [style.background-color]="form.get('color')?.value + '20'"
                   [style.border]="'2px solid ' + form.get('color')?.value"
                   style="width:40px;height:40px">
                <i class="fa-solid fa-{{form.get('icon')?.value || 'tag'}}" [style.color]="form.get('color')?.value"></i>
              </div>
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
export class CategoriesComponent implements OnInit {
  @ViewChild('formModal') formModal!: TemplateRef<unknown>;

  categories = signal<Category[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  editingCategory = signal<Category | null>(null);
  isSaving = signal(false);
  saveError = signal('');

  form: FormGroup;
  private modalRef: NgbModalRef | null = null;

  incomeCategories = computed(() => this.categories().filter(c => c.type === 'income'));
  expenseCategories = computed(() => this.categories().filter(c => c.type === 'expense'));

  constructor(private categoryService: CategoryService, private fb: FormBuilder, private ngbModal: NgbModal) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['expense', Validators.required],
      color: ['#4e73df'],
      icon: ['tag']
    });
  }

  ngOnInit(): void { this.loadCategories(); }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getAll().subscribe({
      next: (data) => { this.categories.set(data); this.isLoading.set(false); },
      error: () => { this.errorMsg.set('Fehler beim Laden der Kategorien.'); this.isLoading.set(false); }
    });
  }

  openModal(category?: Category): void {
    this.editingCategory.set(category ?? null);
    this.saveError.set('');
    if (category) {
      this.form.patchValue({ name: category.name, type: category.type, color: category.color, icon: category.icon ?? 'tag' });
    } else {
      this.form.reset({ name: '', type: 'expense', color: '#4e73df', icon: 'tag' });
    }
    this.modalRef = this.ngbModal.open(this.formModal, { centered: true, backdrop: 'static' });
  }

  closeModal(): void {
    this.modalRef?.close();
    this.modalRef = null;
    this.editingCategory.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    this.saveError.set('');
    const request = this.editingCategory()
      ? this.categoryService.update(this.editingCategory()!.id, this.form.value)
      : this.categoryService.create(this.form.value);
    request.subscribe({
      next: () => { this.isSaving.set(false); this.closeModal(); this.loadCategories(); },
      error: (err) => { this.saveError.set(err.error?.message ?? 'Fehler beim Speichern.'); this.isSaving.set(false); }
    });
  }

  confirmDelete(category: Category): void {
    const ref = this.ngbModal.open(ConfirmDialogComponent, { centered: true });
    ref.componentInstance.title = 'Kategorie loeschen';
    ref.componentInstance.message = `Moechten Sie die Kategorie "${category.name}" wirklich loeschen?`;
    ref.result.then((r) => { if (r === 'confirmed') this.doDelete(category); }, () => {});
  }

  private doDelete(category: Category): void {
    this.categoryService.delete(category.id).subscribe({
      next: () => this.loadCategories(),
      error: () => this.errorMsg.set('Fehler beim Loeschen.')
    });
  }
}
