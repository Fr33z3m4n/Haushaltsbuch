import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyOverviewService } from '../../core/services/monthly-overview.service';
import { MonthlyOverview, MonthlyOverviewItem, MonthlyOverviewCategory } from '../../core/models/monthly-overview.model';
import { TransactionFrequency, FREQUENCY_LABELS } from '../../core/models/transaction.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { CurrencyDePipe } from '../../shared/pipes/currency-de.pipe';

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const ACCORDION_STORAGE_KEY = (year: number, month: number) =>
  `haushaltsbuch.accordion.${year}.${month}`;

@Component({
  selector: 'app-monthly-overview',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, StatCardComponent, CurrencyDePipe],
  template: `
    <app-page-header title="Monatsübersicht" breadcrumb="Monatsübersicht"></app-page-header>

    <!-- Month Navigation -->
    <div class="card mb-4">
      <div class="card-body py-2">
        <div class="d-flex align-items-center justify-content-between">
          <button class="btn btn-outline-primary" (click)="prevMonth()">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <h4 class="mb-0 fw-bold">{{ currentMonthName }}</h4>
          <button class="btn btn-outline-primary" (click)="nextMonth()">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div class="text-center py-5" *ngIf="isLoading()">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-2">Lade Monatsübersicht...</p>
    </div>

    <ng-container *ngIf="!isLoading() && overview()">
      <!-- Summary Cards -->
      <div class="row mb-2">
        <div class="col-xl-2 col-md-4 col-6">
          <app-stat-card
            label="Gesamteinnahmen"
            [value]="overview()!.totalIncome | currencyDe"
            icon="arrow-up-circle"
            variant="success">
          </app-stat-card>
        </div>
        <div class="col-xl-2 col-md-4 col-6">
          <app-stat-card
            label="Gesamtausgaben"
            [value]="overview()!.totalExpense | currencyDe"
            icon="arrow-down-circle"
            variant="danger">
          </app-stat-card>
        </div>
        <div class="col-xl-2 col-md-4 col-6">
          <app-stat-card
            label="Saldo"
            [value]="overview()!.balance | currencyDe"
            icon="wallet2"
            [variant]="overview()!.balance >= 0 ? 'success' : 'danger'">
          </app-stat-card>
        </div>
        <div class="col-xl-2 col-md-4 col-6">
          <app-stat-card
            label="Offene Einnahmen"
            [value]="overview()!.openIncome | currencyDe"
            icon="clock"
            variant="info">
          </app-stat-card>
        </div>
        <div class="col-xl-2 col-md-4 col-6">
          <app-stat-card
            label="Offene Ausgaben"
            [value]="overview()!.openExpense | currencyDe"
            icon="clock-history"
            variant="warning">
          </app-stat-card>
        </div>
        <div class="col-xl-2 col-md-4 col-6">
          <app-stat-card
            label="Offenes Saldo"
            [value]="overview()!.openBalance | currencyDe"
            icon="exclamation-circle"
            [variant]="overview()!.openBalance >= 0 ? 'info' : 'danger'">
          </app-stat-card>
        </div>
      </div>

      <!-- Income Section -->
      <div class="card mb-4" *ngIf="overview()!.incomeCategories.length > 0">
        <div class="card-header border-left-success d-flex justify-content-between align-items-center">
          <span><i class="fa-solid fa-circle-arrow-up me-2 text-success"></i><strong>Einnahmen</strong></span>
          <span class="text-success fw-bold">{{ overview()!.totalIncome | currencyDe }}</span>
        </div>
        <div class="card-body p-0">
        <div class="accordion accordion-flush">
            <div class="accordion-item border-0" *ngFor="let cat of overview()!.incomeCategories">
              <h2 class="accordion-header">
                <button class="accordion-button px-3 py-2"
                        [class.collapsed]="isPanelCollapsed('income-' + cat.categoryId)"
                        (click)="togglePanel('income-' + cat.categoryId)"
                        type="button">
                  <div class="d-flex align-items-center justify-content-between w-100 me-2">
                    <div class="d-flex align-items-center gap-2">
                      <span class="rounded-circle d-inline-block flex-shrink-0"
                            [style.background-color]="cat.categoryColor"
                            style="width:12px;height:12px"></span>
                      <strong class="small">{{ cat.categoryName }}</strong>
                      <span class="badge bg-secondary" style="font-size:0.65rem">{{ cat.items.length }}</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                      <span *ngIf="cat.openAmount > 0"
                            class="badge rounded-pill bg-warning text-dark fw-normal" style="font-size:0.7rem">
                        <i class="fa-solid fa-clock me-1"></i>offen: {{ cat.openAmount | currencyDe }}
                      </span>
                      <span class="text-success fw-bold small">{{ cat.totalAmount | currencyDe }}</span>
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse collapse"
                   [class.show]="!isPanelCollapsed('income-' + cat.categoryId)">
                <div class="accordion-body p-0">
                    <table class="table table-sm mb-0 w-100">
                      <tbody>
                        <ng-container *ngFor="let group of groupByFrequency(cat.items)">
                          <tr class="frequency-section-header">
                            <td colspan="5" class="ps-3 py-1 border-top">
                              <small class="text-uppercase text-muted fw-semibold" style="font-size:0.65rem">
                                <i class="fa-solid fa-rotate me-1"></i>{{ group.label }}
                              </small>
                            </td>
                          </tr>
                          <tr *ngFor="let item of group.items"
                              [class.monthly-item]="true" [class.completed]="item.status?.isCompleted">
                            <td class="ps-3 align-middle" style="width:36px">
                              <div class="form-check mb-0">
                                <input class="form-check-input" type="checkbox"
                                       [checked]="item.status?.isCompleted ?? false"
                                       (change)="toggleStatus(item, cat)"
                                       [id]="'inc-' + item.transaction.id">
                              </div>
                            </td>
                            <td class="align-middle">
                              <label [for]="'inc-' + item.transaction.id" class="mb-0 small d-block text-truncate" style="cursor:pointer;max-width:0;min-width:100%">
                                {{ item.transaction.name }}
                              </label>
                              <span class="d-sm-none text-muted" style="font-size:0.65rem">
                                <span *ngIf="item.transaction.account" class="me-2">
                                  <span class="rounded-circle d-inline-block"
                                        [style.background-color]="item.transaction.account.color"
                                        style="width:6px;height:6px;vertical-align:middle"></span>
                                  {{ item.transaction.account.name }}
                                </span>
                                <i class="fa-solid fa-calendar"></i> {{ item.transaction.dayOfMonth }}.
                              </span>
                            </td>
                            <td class="text-muted small align-middle d-none d-sm-table-cell" style="width:120px">
                              <span *ngIf="item.transaction.account" class="d-flex align-items-center gap-1">
                                <span class="rounded-circle d-inline-block flex-shrink-0"
                                      [style.background-color]="item.transaction.account.color"
                                      style="width:8px;height:8px"></span>
                                <span class="text-truncate">{{ item.transaction.account.name }}</span>
                              </span>
                            </td>
                            <td class="text-muted small align-middle text-nowrap d-none d-sm-table-cell" style="width:110px">
                              <i class="fa-solid fa-calendar me-1"></i>{{ item.transaction.dayOfMonth }}. des Monats
                            </td>
                            <td class="text-end text-success fw-bold small align-middle pe-3" style="width:90px">
                              {{ item.monthlyAmount | currencyDe }}
                              <small *ngIf="item.transaction.frequency !== 'monthly'"
                                     class="text-muted fw-normal d-block" style="font-size:0.65rem">
                                {{ item.transaction.amount | currencyDe }} / {{ group.label }}
                              </small>
                            </td>
                          </tr>
                        </ng-container>
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expense Section -->
      <div class="card mb-4" *ngIf="overview()!.expenseCategories.length > 0">
        <div class="card-header border-left-danger d-flex justify-content-between align-items-center">
          <span><i class="fa-solid fa-circle-arrow-down me-2 text-danger"></i><strong>Ausgaben</strong></span>
          <span class="text-danger fw-bold">{{ overview()!.totalExpense | currencyDe }}</span>
        </div>
        <div class="card-body p-0">
        <div class="accordion accordion-flush">
            <div class="accordion-item border-0" *ngFor="let cat of overview()!.expenseCategories">
              <h2 class="accordion-header">
                <button class="accordion-button px-3 py-2"
                        [class.collapsed]="isPanelCollapsed('expense-' + cat.categoryId)"
                        (click)="togglePanel('expense-' + cat.categoryId)"
                        type="button">
                  <div class="d-flex align-items-center justify-content-between w-100 me-2">
                    <div class="d-flex align-items-center gap-2">
                      <span class="rounded-circle d-inline-block flex-shrink-0"
                            [style.background-color]="cat.categoryColor"
                            style="width:12px;height:12px"></span>
                      <strong class="small">{{ cat.categoryName }}</strong>
                      <span class="badge bg-secondary" style="font-size:0.65rem">{{ cat.items.length }}</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                      <span *ngIf="cat.openAmount > 0"
                            class="badge rounded-pill bg-warning text-dark fw-normal" style="font-size:0.7rem">
                        <i class="fa-solid fa-clock me-1"></i>offen: {{ cat.openAmount | currencyDe }}
                      </span>
                      <span class="text-danger fw-bold small">{{ cat.totalAmount | currencyDe }}</span>
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse collapse"
                   [class.show]="!isPanelCollapsed('expense-' + cat.categoryId)">
                <div class="accordion-body p-0">
                    <table class="table table-sm mb-0 w-100">
                      <tbody>
                        <ng-container *ngFor="let group of groupByFrequency(cat.items)">
                          <tr class="frequency-section-header">
                            <td colspan="5" class="ps-3 py-1 border-top">
                              <small class="text-uppercase text-muted fw-semibold" style="font-size:0.65rem">
                                <i class="fa-solid fa-rotate me-1"></i>{{ group.label }}
                              </small>
                            </td>
                          </tr>
                          <tr *ngFor="let item of group.items"
                              [class.monthly-item]="true" [class.completed]="item.status?.isCompleted">
                            <td class="ps-3 align-middle" style="width:36px">
                              <div class="form-check mb-0">
                                <input class="form-check-input" type="checkbox"
                                       [checked]="item.status?.isCompleted ?? false"
                                       (change)="toggleStatus(item, cat)"
                                       [id]="'exp-' + item.transaction.id">
                              </div>
                            </td>
                            <td class="align-middle">
                              <label [for]="'exp-' + item.transaction.id" class="mb-0 small d-block text-truncate" style="cursor:pointer;max-width:0;min-width:100%">
                                {{ item.transaction.name }}
                              </label>
                              <span class="d-sm-none text-muted" style="font-size:0.65rem">
                                <span *ngIf="item.transaction.account" class="me-2">
                                  <span class="rounded-circle d-inline-block"
                                        [style.background-color]="item.transaction.account.color"
                                        style="width:6px;height:6px;vertical-align:middle"></span>
                                  {{ item.transaction.account.name }}
                                </span>
                                <i class="fa-solid fa-calendar"></i> {{ item.transaction.dayOfMonth }}.
                              </span>
                            </td>
                            <td class="text-muted small align-middle d-none d-sm-table-cell" style="width:120px">
                              <span *ngIf="item.transaction.account" class="d-flex align-items-center gap-1">
                                <span class="rounded-circle d-inline-block flex-shrink-0"
                                      [style.background-color]="item.transaction.account.color"
                                      style="width:8px;height:8px"></span>
                                <span class="text-truncate">{{ item.transaction.account.name }}</span>
                              </span>
                            </td>
                            <td class="text-muted small align-middle text-nowrap d-none d-sm-table-cell" style="width:110px">
                              <i class="fa-solid fa-calendar me-1"></i>{{ item.transaction.dayOfMonth }}. des Monats
                            </td>
                            <td class="text-end text-danger fw-bold small align-middle pe-3" style="width:90px">
                              {{ item.monthlyAmount | currencyDe }}
                              <small *ngIf="item.transaction.frequency !== 'monthly'"
                                     class="text-muted fw-normal d-block" style="font-size:0.65rem">
                                {{ item.transaction.amount | currencyDe }} / {{ group.label }}
                              </small>
                            </td>
                          </tr>
                        </ng-container>
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="text-center py-5" *ngIf="overview()!.incomeCategories.length === 0 && overview()!.expenseCategories.length === 0">
        <i class="fa-solid fa-calendar-xmark fs-1 text-muted d-block mb-3"></i>
        <p class="text-muted">Keine Buchungen für {{ currentMonthName }}.</p>
      </div>
    </ng-container>
  `
})
export class MonthlyOverviewComponent implements OnInit {
  overview = signal<MonthlyOverview | null>(null);
  isLoading = signal(false);

  private year = signal(new Date().getFullYear());
  private month = signal(new Date().getMonth() + 1);

  /** Panel-ID → collapsed. true = collapsed, false/undefined = open */
  private collapsedState = new Map<string, boolean>();

  get currentMonthName(): string {
    return `${MONTH_NAMES[this.month() - 1]} ${this.year()}`;
  }

  constructor(private overviewService: MonthlyOverviewService) {}

  ngOnInit(): void {
    this.loadAccordionState();
    this.load();
  }

  // ── Accordion state persistence ───────────────────────────────────────────

  private loadAccordionState(): void {
    this.collapsedState.clear();
    const key = ACCORDION_STORAGE_KEY(this.year(), this.month());
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const obj: Record<string, boolean> = JSON.parse(raw);
        for (const [k, v] of Object.entries(obj)) {
          this.collapsedState.set(k, v);
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  private saveAccordionState(): void {
    const key = ACCORDION_STORAGE_KEY(this.year(), this.month());
    const obj: Record<string, boolean> = {};
    this.collapsedState.forEach((v, k) => (obj[k] = v));
    localStorage.setItem(key, JSON.stringify(obj));
  }

  isPanelCollapsed(panelId: string): boolean {
    return this.collapsedState.get(panelId) ?? false;
  }

  togglePanel(panelId: string): void {
    const current = this.collapsedState.get(panelId) ?? false;
    this.collapsedState.set(panelId, !current);
    this.saveAccordionState();
  }

  // ── Frequency grouping ────────────────────────────────────────────────────

  private readonly FREQUENCY_ORDER: TransactionFrequency[] = ['monthly', 'quarterly', 'semi_annual', 'annual'];

  groupByFrequency(items: MonthlyOverviewItem[]): { frequency: TransactionFrequency; label: string; items: MonthlyOverviewItem[] }[] {
    return this.FREQUENCY_ORDER
      .map(freq => ({
        frequency: freq,
        label: FREQUENCY_LABELS[freq],
        items: items.filter(i => i.transaction.frequency === freq)
      }))
      .filter(g => g.items.length > 0);
  }

  load(): void {
    this.isLoading.set(true);
    this.overviewService.getOverview(this.year(), this.month()).subscribe({
      next: (data) => { this.overview.set(data); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); }
    });
  }

  prevMonth(): void {
    if (this.month() === 1) {
      this.month.set(12);
      this.year.update(y => y - 1);
    } else {
      this.month.update(m => m - 1);
    }
    this.loadAccordionState();
    this.load();
  }

  nextMonth(): void {
    if (this.month() === 12) {
      this.month.set(1);
      this.year.update(y => y + 1);
    } else {
      this.month.update(m => m + 1);
    }
    this.loadAccordionState();
    this.load();
  }

  toggleStatus(item: MonthlyOverviewItem, cat: MonthlyOverviewCategory): void {
    const currentState = item.status?.isCompleted ?? false;

    // Optimistic update of item status
    if (item.status) {
      item.status.isCompleted = !currentState;
    } else {
      item.status = {
        transactionId: item.transaction.id,
        year: this.year(),
        month: this.month(),
        isCompleted: true
      };
    }

    // Recalculate category open amount
    cat.openAmount = cat.items
      .filter(i => !i.status?.isCompleted)
      .reduce((sum, i) => sum + i.monthlyAmount, 0);

    // Recalculate top-level totals and emit new signal reference
    this.recalculateTotals();

    this.overviewService.toggleStatus(item.transaction.id, this.year(), this.month()).subscribe({
      error: () => {
        // Revert on error
        if (item.status) item.status.isCompleted = currentState;
        cat.openAmount = cat.items
          .filter(i => !i.status?.isCompleted)
          .reduce((sum, i) => sum + i.monthlyAmount, 0);
        this.recalculateTotals();
      }
    });
  }

  private recalculateTotals(): void {
    const ov = this.overview();
    if (!ov) return;

    let openIncome = 0;
    let openExpense = 0;

    for (const cat of ov.incomeCategories) {
      openIncome += cat.items
        .filter(i => !i.status?.isCompleted)
        .reduce((sum, i) => sum + i.monthlyAmount, 0);
    }
    for (const cat of ov.expenseCategories) {
      openExpense += cat.items
        .filter(i => !i.status?.isCompleted)
        .reduce((sum, i) => sum + i.monthlyAmount, 0);
    }

    // New object reference → signal fires → stat cards update immediately
    this.overview.set({
      ...ov,
      openIncome:   Math.round(openIncome  * 100) / 100,
      openExpense:  Math.round(openExpense * 100) / 100,
      openBalance:  Math.round((openIncome - openExpense) * 100) / 100,
    });
  }
}
