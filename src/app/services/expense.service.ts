import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';
import { PageableResponse } from '../models/pageable.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/expenses`;

  getAll(page: number = 0, size: number = 25, sort: string = 'createdAt,desc', categoryIds?: number[], startDate?: string, endDate?: string): Observable<PageableResponse<Expense>> {
    const params: any = { page, size, sort };
    if (categoryIds && categoryIds.length > 0) {
      params.categoryIds = categoryIds.join(',');
    }
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }
    return this.http.get<PageableResponse<Expense>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.baseUrl}/${id}`);
  }

  create(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.baseUrl, expense);
  }

  update(id: number, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.baseUrl}/${id}`, expense);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
