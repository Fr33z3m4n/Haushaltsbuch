import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, CreateTransactionRequest } from '../models/transaction.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly API_URL = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.API_URL);
  }

  getById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.API_URL}/${id}`);
  }

  create(data: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.API_URL, data);
  }

  update(id: string, data: Partial<CreateTransactionRequest>): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
