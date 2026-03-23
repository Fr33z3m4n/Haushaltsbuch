import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly API_URL = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  create(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.API_URL, data);
  }

  update(id: string, data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
