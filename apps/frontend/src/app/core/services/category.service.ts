import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CreateCategoryRequest } from '../models/category.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API_URL = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.API_URL);
  }

  getByType(type: 'income' | 'expense'): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API_URL}?type=${type}`);
  }

  getById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.API_URL}/${id}`);
  }

  create(data: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.API_URL, data);
  }

  update(id: string, data: Partial<CreateCategoryRequest>): Observable<Category> {
    return this.http.put<Category>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
