import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesPerson, SalesPersonInventory } from '../models/sales-person.model';
import { PageableResponse } from '../models/pageable.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesPersonService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/sales-persons`;

  getAll(page: number = 0, size: number = 10): Observable<PageableResponse<SalesPerson>> {
    return this.http.get<PageableResponse<SalesPerson>>(this.baseUrl, {
      params: { page, size }
    });
  }

  getById(id: number): Observable<SalesPerson> {
    return this.http.get<SalesPerson>(`${this.baseUrl}/${id}`);
  }

  search(keyword: string): Observable<SalesPerson[]> {
    return this.http.get<SalesPerson[]>(`${this.baseUrl}/search`, {
      params: { keyword }
    });
  }

  create(salesPerson: SalesPerson): Observable<SalesPerson> {
    return this.http.post<SalesPerson>(this.baseUrl, salesPerson);
  }

  update(id: number, salesPerson: SalesPerson): Observable<SalesPerson> {
    return this.http.put<SalesPerson>(`${this.baseUrl}/${id}`, salesPerson);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  linkCustomers(salesPersonId: number, customerIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${salesPersonId}/customers`, customerIds);
  }

  getInventory(salesPersonId: number): Observable<SalesPersonInventory[]> {
    return this.http.get<SalesPersonInventory[]>(`${this.baseUrl}/${salesPersonId}/inventory`);
  }

  allocateStock(salesPersonId: number, productId: number, quantity: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/allocate-stock`, {
      salesPersonId,
      productId,
      quantity
    });
  }

  returnStock(salesPersonId: number, productId: number, quantity: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/return-stock`, {
      salesPersonId,
      productId,
      quantity
    });
  }
}
