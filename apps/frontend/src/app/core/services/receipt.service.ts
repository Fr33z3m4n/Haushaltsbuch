import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Transaction } from '../models/transaction.model';

export interface OcrExtractResult {
  amount: number | null;
  date: string | null;
  merchant: string | null;
  raw_text: string;
  confidence: number;
}

export interface SaveReceiptRequest {
  amount: number;
  date: string;
  merchant: string;
  accountId: string;
  categoryId?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private readonly API_URL = `${environment.apiUrl}/receipts`;

  constructor(private http: HttpClient) {}

  extract(file: File): Observable<OcrExtractResult> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<OcrExtractResult>(`${this.API_URL}/extract`, form);
  }

  save(data: SaveReceiptRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_URL}/save`, data);
  }

  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.API_URL);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
