import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartConfiguration } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { YearlyOverviewService } from '../../core/services/yearly-overview.service';
import { YearlyOverview, YearlyMonth } from '../../core/models/yearly-overview.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { CurrencyDePipe } from '../../shared/pipes/currency-de.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-yearly-overview',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, PageHeaderComponent, StatCardComponent, CurrencyDePipe],
  template: `
    <app-page-header title="Jahresübersicht" breadcrumb="Jahresübersicht"></app-page-header>

    <!-- Year Navigation -->
    <div class="card mb-4">
      <div class="card-body py-2">
        <div class="d-flex align-items-center justify-content-between">
          <button class="btn btn-outline-primary" (click)="prevYear()">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <h4 class="mb-0 fw-bold">{{ currentYear() }}</h4>
          <button class="btn btn-outline-primary" (click)="nextYear()">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div class="text-center py-5" *ngIf="isLoading()">
      <div class="spinner-border text-primary"></div>
    </div>

    <ng-container *ngIf="!isLoading() && overview()">
      <!-- Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-4">
          <app-stat-card
            label="Jahreseinnahmen"
            [value]="overview()!.annualIncome | currencyDe"
            icon="circle-arrow-up"
            variant="success">
          </app-stat-card>
        </div>
        <div class="col-md-4">
          <app-stat-card
            label="Jahresausgaben"
            [value]="overview()!.annualExpense | currencyDe"
            icon="circle-arrow-down"
            variant="danger">
          </app-stat-card>
        </div>
        <div class="col-md-4">
          <app-stat-card
            label="Jahressaldo"
            [value]="overview()!.annualBalance | currencyDe"
            icon="wallet"
            [variant]="overview()!.annualBalance >= 0 ? 'success' : 'danger'">
          </app-stat-card>
        </div>
      </div>

      <!-- Bar Chart -->
      <div class="card mb-4">
        <div class="card-header border-left-primary">
          <i class="fa-solid fa-chart-bar me-2"></i>
          <strong>Einnahmen & Ausgaben {{ currentYear() }}</strong>
        </div>
        <div class="card-body">
          <canvas baseChart
            [data]="barChartData"
            [options]="barChartOptions"
            type="bar"
            style="max-height: 350px">
          </canvas>
        </div>
      </div>

      <!-- Monthly Table -->
      <div class="card">
        <div class="card-header border-left-info">
          <i class="fa-solid fa-table me-2"></i>
          <strong>Monatsübersicht {{ currentYear() }}</strong>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-header-themed">
              <tr>
                <th>Monat</th>
                <th class="text-end">Einnahmen</th>
                <th class="text-end">Ausgaben</th>
                <th class="text-end">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of overview()!.months">
                <td class="fw-bold">{{ m.monthName }}</td>
                <td class="text-end text-success">{{ m.totalIncome | currencyDe }}</td>
                <td class="text-end text-danger">{{ m.totalExpense | currencyDe }}</td>
                <td class="text-end fw-bold"
                    [class.text-success]="m.balance >= 0"
                    [class.text-danger]="m.balance < 0">
                  {{ m.balance | currencyDe }}
                </td>
              </tr>
            </tbody>
            <tfoot class="table-footer-themed">
              <tr>
                <td class="fw-bold">Gesamt</td>
                <td class="text-end text-success fw-bold">{{ overview()!.annualIncome | currencyDe }}</td>
                <td class="text-end text-danger fw-bold">{{ overview()!.annualExpense | currencyDe }}</td>
                <td class="text-end fw-bold"
                    [class.text-success]="overview()!.annualBalance >= 0"
                    [class.text-danger]="overview()!.annualBalance < 0">
                  {{ overview()!.annualBalance | currencyDe }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </ng-container>
  `
})
export class YearlyOverviewComponent implements OnInit {
  overview = signal<YearlyOverview | null>(null);
  isLoading = signal(false);
  currentYear = signal(new Date().getFullYear());

  barChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    datasets: [
      { label: 'Einnahmen', data: [], backgroundColor: 'rgba(28,200,138,0.8)', borderColor: '#1cc88a', borderWidth: 1 },
      { label: 'Ausgaben', data: [], backgroundColor: 'rgba(231,74,59,0.8)', borderColor: '#e74a3b', borderWidth: 1 }
    ]
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (val) => `${val} €` } }
    }
  };

  constructor(private yearlyService: YearlyOverviewService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.yearlyService.getOverview(this.currentYear()).subscribe({
      next: (data) => {
        this.overview.set(data);
        this.updateChart(data.months);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  private updateChart(months: YearlyMonth[]): void {
    this.barChartData = {
      ...this.barChartData,
      datasets: [
        { ...this.barChartData.datasets[0], data: months.map(m => m.totalIncome) },
        { ...this.barChartData.datasets[1], data: months.map(m => m.totalExpense) }
      ]
    };
  }

  prevYear(): void {
    this.currentYear.update(y => y - 1);
    this.load();
  }

  nextYear(): void {
    this.currentYear.update(y => y + 1);
    this.load();
  }
}
