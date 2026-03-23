import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CurrencyDePipe } from '../../shared/pipes/currency-de.pipe';
import { MonthlyOverviewService } from '../../core/services/monthly-overview.service';
import { YearlyOverviewService } from '../../core/services/yearly-overview.service';
import { MonthlyOverviewCategory } from '../../core/models/monthly-overview.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, StatCardComponent, PageHeaderComponent, CurrencyDePipe],
  template: `
    <app-page-header title="Dashboard" breadcrumb="Dashboard"></app-page-header>

    <!-- Stat Cards -->
    <div class="row">
      <div class="col-xl-3 col-md-6">
        <app-stat-card
          label="Monatliche Einnahmen"
          [value]="totalIncome() | currencyDe"
          icon="circle-arrow-up"
          variant="success">
        </app-stat-card>
      </div>
      <div class="col-xl-3 col-md-6">
        <app-stat-card
          label="Monatliche Ausgaben"
          [value]="totalExpense() | currencyDe"
          icon="circle-arrow-down"
          variant="danger">
        </app-stat-card>
      </div>
      <div class="col-xl-3 col-md-6">
        <app-stat-card
          label="Monatliches Saldo"
          [value]="balance() | currencyDe"
          icon="wallet"
          [variant]="balance() >= 0 ? 'success' : 'danger'">
        </app-stat-card>
      </div>
      <div class="col-xl-3 col-md-6">
        <app-stat-card
          label="Offene Posten"
          [value]="openExpense() | currencyDe"
          icon="clock-rotate-left"
          variant="warning">
        </app-stat-card>
      </div>
    </div>

    <!-- Charts -->
    <div class="row">
      <div class="col-xl-8">
        <div class="card mb-4">
          <div class="card-header border-left-primary d-flex align-items-center">
            <i class="fa-solid fa-chart-line me-2"></i>
            <span>Jahresübersicht {{ currentYear }}</span>
          </div>
          <div class="card-body">
            <canvas baseChart
              [data]="areaChartData"
              [options]="areaChartOptions"
              type="line"
              style="max-height: 300px">
            </canvas>
          </div>
        </div>
      </div>
      <div class="col-xl-4">
        <div class="card mb-4">
          <div class="card-header border-left-info d-flex align-items-center">
            <i class="fa-solid fa-chart-pie me-2"></i>
            <span>Einnahmen vs. Ausgaben</span>
          </div>
          <div class="card-body">
            <canvas baseChart
              [data]="doughnutChartData"
              [options]="doughnutChartOptions"
              type="doughnut"
              style="max-height: 300px">
            </canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Expenses Chart -->
    <div class="row">
      <div class="col-xl-5">
        <div class="card mb-4">
          <div class="card-header border-left-danger d-flex align-items-center">
            <i class="fa-solid fa-tags me-2"></i>
            <span>Ausgaben nach Kategorien</span>
          </div>
          <div class="card-body">
            @if (categoryChartData.labels && categoryChartData.labels.length > 0) {
              <canvas baseChart
                [data]="categoryChartData"
                [options]="categoryChartOptions"
                type="doughnut"
                style="max-height: 300px">
              </canvas>
            } @else {
              <p class="text-muted text-center py-4">Keine Ausgaben im aktuellen Monat.</p>
            }
          </div>
        </div>
      </div>
      <div class="col-xl-7">
        <div class="card mb-4">
          <div class="card-header border-left-danger d-flex align-items-center">
            <i class="fa-solid fa-list me-2"></i>
            <span>Ausgaben-Kategorien Übersicht</span>
          </div>
          <div class="card-body p-0">
            <table class="table table-sm mb-0">
              <thead class="table-header-themed">
                <tr>
                  <th>Kategorie</th>
                  <th class="text-end">Betrag</th>
                  <th class="text-end">Anteil</th>
                </tr>
              </thead>
              <tbody>
                @for (cat of expenseCategories(); track cat.categoryId) {
                  <tr>
                    <td>
                      <span class="badge me-2" [style.background-color]="cat.categoryColor">&nbsp;</span>
                      <i class="fa-solid fa-{{cat.categoryIcon || 'tag'}} me-1 small" [style.color]="cat.categoryColor"></i>
                      {{ cat.categoryName }}
                    </td>
                    <td class="text-end text-danger fw-semibold">{{ cat.totalAmount | currencyDe }}</td>
                    <td class="text-end text-muted small">
                      {{ totalExpense() > 0 ? ((cat.totalAmount / totalExpense()) * 100 | number:'1.0-1') + ' %' : '—' }}
                    </td>
                  </tr>
                }
                @empty {
                  <tr><td colspan="3" class="text-muted text-center py-3">Keine Ausgaben</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="row">
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header border-left-primary fw-bold">
            <i class="fa-solid fa-calendar-check me-2"></i>Monatsübersicht {{ currentMonthName }}
          </div>
          <div class="card-body text-center">
            <p class="text-muted small">
              Offene Einnahmen: <strong class="text-success">{{ openIncome() | currencyDe }}</strong>
            </p>
            <p class="text-muted small">
              Offene Ausgaben: <strong class="text-danger">{{ openExpense() | currencyDe }}</strong>
            </p>
            <a routerLink="/monatsübersicht" class="btn btn-primary btn-sm">
              <i class="fa-solid fa-arrow-right me-1"></i>Zur Monatsübersicht
            </a>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header border-left-success fw-bold">
            <i class="fa-solid fa-circle-plus me-2"></i>Schnellzugriff
          </div>
          <div class="card-body d-grid gap-2">
            <a routerLink="/buchungen" class="btn btn-outline-primary btn-sm">
              <i class="fa-solid fa-plus me-1"></i>Neue Buchung
            </a>
            <a routerLink="/konten" class="btn btn-outline-secondary btn-sm">
              <i class="fa-solid fa-building-columns me-1"></i>Konten verwalten
            </a>
            <a routerLink="/kategorien" class="btn btn-outline-secondary btn-sm">
              <i class="fa-solid fa-tags me-1"></i>Kategorien verwalten
            </a>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header border-left-warning fw-bold">
            <i class="fa-solid fa-circle-info me-2"></i>Aktueller Monat
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted small">Einnahmen:</span>
              <strong class="text-success small">{{ totalIncome() | currencyDe }}</strong>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted small">Ausgaben:</span>
              <strong class="text-danger small">{{ totalExpense() | currencyDe }}</strong>
            </div>
            <hr>
            <div class="d-flex justify-content-between">
              <span class="fw-bold small">Saldo:</span>
              <strong [class.text-success]="balance() >= 0" [class.text-danger]="balance() < 0" class="small">
                {{ balance() | currencyDe }}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  currentMonthName = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

  totalIncome = signal(0);
  totalExpense = signal(0);
  balance = signal(0);
  openIncome = signal(0);
  openExpense = signal(0);
  expenseCategories = signal<MonthlyOverviewCategory[]>([]);

  categoryChartData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [], backgroundColor: [] }] };

  categoryChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toFixed(2).replace('.', ',')} €`
        }
      }
    }
  };

  areaChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Einnahmen',
        data: [],
        borderColor: '#1cc88a',
        backgroundColor: 'rgba(28,200,138,0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Ausgaben',
        data: [],
        borderColor: '#e74a3b',
        backgroundColor: 'rgba(231,74,59,0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  areaChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (val) => `${val} €` } }
    }
  };

  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Einnahmen', 'Ausgaben'],
    datasets: [{ data: [0, 0], backgroundColor: ['#1cc88a', '#e74a3b'] }]
  };

  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  constructor(
    private monthlyService: MonthlyOverviewService,
    private yearlyService: YearlyOverviewService
  ) {}

  ngOnInit(): void {
    this.loadCurrentMonth();
    this.loadYearlyData();
  }

  private loadCurrentMonth(): void {
    this.monthlyService.getOverview(this.currentYear, this.currentMonth).subscribe({
      next: (overview) => {
        this.totalIncome.set(overview.totalIncome);
        this.totalExpense.set(overview.totalExpense);
        this.balance.set(overview.balance);
        this.openIncome.set(overview.openIncome);
        this.openExpense.set(overview.openExpense);
        this.expenseCategories.set(
          [...overview.expenseCategories].sort((a, b) => b.totalAmount - a.totalAmount)
        );

        this.doughnutChartData = {
          ...this.doughnutChartData,
          datasets: [{
            data: [overview.totalIncome, overview.totalExpense],
            backgroundColor: ['#1cc88a', '#e74a3b']
          }]
        };

        const cats = overview.expenseCategories.filter(c => c.totalAmount > 0);
        this.categoryChartData = {
          labels: cats.map(c => c.categoryName),
          datasets: [{
            data: cats.map(c => c.totalAmount),
            backgroundColor: cats.map(c => c.categoryColor || '#6c757d'),
            borderWidth: 2
          }]
        };
      },
      error: () => {}
    });
  }

  private loadYearlyData(): void {
    this.yearlyService.getOverview(this.currentYear).subscribe({
      next: (yearly) => {
        const incomeData = yearly.months.map(m => m.totalIncome);
        const expenseData = yearly.months.map(m => m.totalExpense);
        this.areaChartData = {
          ...this.areaChartData,
          datasets: [
            { ...this.areaChartData.datasets[0], data: incomeData },
            { ...this.areaChartData.datasets[1], data: expenseData }
          ]
        };
      },
      error: () => {}
    });
  }
}
