import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { YearlyOverview } from '../models/yearly-overview.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class YearlyOverviewService {
  private readonly API_URL = `${environment.apiUrl}/yearly-overview`;

  constructor(private http: HttpClient) {}

  getOverview(year: number): Observable<YearlyOverview> {
    return this.http.get<YearlyOverview>(`${this.API_URL}?year=${year}`);
  }
}
