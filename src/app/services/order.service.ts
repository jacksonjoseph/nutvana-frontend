import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { PageableResponse } from '../models/pageable.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/orders`;

  getAll(page: number = 0, size: number = 10, paymentDue: boolean = false, isDirectSale?: boolean, salesPersonIds?: number[], startDate?: string, endDate?: string): Observable<PageableResponse<Order>> {
    const params: any = { page, size };
    if (paymentDue) {
      params.paymentDue = true;
    }
    if (isDirectSale !== undefined) {
      params.isDirectSale = isDirectSale;
    }
    if (salesPersonIds && salesPersonIds.length > 0) {
      params.salesPersonIds = salesPersonIds.join(',');
    }
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }
    return this.http.get<PageableResponse<Order>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  getByCustomerId(customerId: number, page: number = 0, size: number = 20): Observable<PageableResponse<Order>> {
    return this.http.get<PageableResponse<Order>>(`${this.baseUrl}/customer/${customerId}`, {
      params: { page, size }
    });
  }

  create(order: Order): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, order);
  }

  update(id: number, order: Order): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${id}`, order);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getFilteredSummary(paymentDue: boolean = false, isDirectSale?: boolean, salesPersonIds?: number[], startDate?: string, endDate?: string): Observable<{ totalCountSold: number, totalCollected: number, totalBalance: number }> {
    const params: any = {};
    if (paymentDue) {
      params.paymentDue = true;
    }
    if (isDirectSale !== undefined) {
      params.isDirectSale = isDirectSale;
    }
    if (salesPersonIds && salesPersonIds.length > 0) {
      params.salesPersonIds = salesPersonIds.join(',');
    }
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }
    return this.http.get<{ totalCountSold: number, totalCollected: number, totalBalance: number }>(`${this.baseUrl}/filtered-summary`, { params });
  }
}
