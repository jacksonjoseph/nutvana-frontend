import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';
import { PageableResponse } from '../models/pageable.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/customers`;

  getAll(page: number = 0, size: number = 10, salesPersonIds?: number[]): Observable<PageableResponse<Customer>> {
    const params: any = { page, size };
    if (salesPersonIds && salesPersonIds.length > 0) {
      params.salesPersonIds = salesPersonIds.join(',');
    }
    return this.http.get<PageableResponse<Customer>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`);
  }

  search(keyword: string, salesPersonIds?: number[]): Observable<Customer[]> {
    const params: any = { keyword };
    if (salesPersonIds && salesPersonIds.length > 0) {
      params.salesPersonIds = salesPersonIds.join(',');
    }
    return this.http.get<Customer[]>(`${this.baseUrl}/search`, { params });
  }

  create(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.baseUrl, customer);
  }

  update(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/${id}`, customer);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
