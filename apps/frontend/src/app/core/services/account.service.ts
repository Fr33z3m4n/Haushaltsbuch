import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, CreateAccountRequest } from '../models/account.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly API_URL = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Account[]> {
    return this.http.get<Account[]>(this.API_URL);
  }

  getById(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.API_URL}/${id}`);
  }

  create(data: CreateAccountRequest): Observable<Account> {
    return this.http.post<Account>(this.API_URL, data);
  }

  update(id: string, data: Partial<CreateAccountRequest>): Observable<Account> {
    return this.http.put<Account>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
