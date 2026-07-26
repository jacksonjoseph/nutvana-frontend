import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseCategory } from '../models/expense-category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseCategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/expense-categories`;

  getAll(): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>(this.baseUrl);
  }

  getById(id: number): Observable<ExpenseCategory> {
    return this.http.get<ExpenseCategory>(`${this.baseUrl}/${id}`);
  }
}
