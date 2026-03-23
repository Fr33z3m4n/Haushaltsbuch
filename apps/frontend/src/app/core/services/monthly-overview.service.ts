import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MonthlyOverview } from '../models/monthly-overview.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MonthlyOverviewService {
  private readonly API_URL = `${environment.apiUrl}/monthly-overview`;

  constructor(private http: HttpClient) {}

  getOverview(year: number, month: number): Observable<MonthlyOverview> {
    return this.http.get<MonthlyOverview>(`${this.API_URL}?year=${year}&month=${month}`);
  }

  toggleStatus(transactionId: string, year: number, month: number): Observable<{ isCompleted: boolean }> {
    return this.http.post<{ isCompleted: boolean }>(`${this.API_URL}/toggle-status`, {
      transactionId, year, month
    });
  }
}
