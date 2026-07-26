import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CountResponse {
  totalCount: number;
}

export interface OrderSummary {
  totalOrders: number;
  totalPrice: number;
  totalCollected: number;
  totalBalance: number;
}

export interface ProductSalesSummary {
  totalQuantitySold: number;
  totalPrice: number;
}

export interface ExpenseSummary {
  totalExpense: number;
}

export interface StockValuation {
  totalStockValue: number;
  totalSalesPersonStockValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getProductsCount(): Observable<CountResponse> {
    return this.http.get<CountResponse>(`${this.apiUrl}/products/count`);
  }

  getCustomersCount(): Observable<CountResponse> {
    return this.http.get<CountResponse>(`${this.apiUrl}/customers/count`);
  }

  getInventorySummary(): Observable<StockValuation> {
    return this.http.get<StockValuation>(`${this.apiUrl}/products/inventory-summary`);
  }

  getOrdersSummary(): Observable<OrderSummary> {
    return this.http.get<OrderSummary>(`${this.apiUrl}/orders/summary`);
  }

  getOrdersSummaryByCustomer(customerId: number): Observable<OrderSummary> {
    return this.http.get<OrderSummary>(`${this.apiUrl}/orders/summary/customer/${customerId}`);
  }

  getProductSalesSummary(productId: number): Observable<ProductSalesSummary> {
    return this.http.get<ProductSalesSummary>(`${this.apiUrl}/orders/summary/product/${productId}`);
  }

  getExpenseSummary(): Observable<ExpenseSummary> {
    return this.http.get<ExpenseSummary>(`${this.apiUrl}/expenses/summary`);
  }
}
