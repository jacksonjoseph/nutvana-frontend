import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CustomerInsight {
  customerId: number;
  customerName: string;
  orderCount: number;
  totalAmount: number;
  totalAmountCollected: number;
  totalBalancePending: number;
  totalDiscountGiven: number;
}

export interface CustomerInsightPage {
  content: CustomerInsight[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface MonthlySale {
  orderMonth: string;
  totalAmount: number;
}

export interface ProductInsight {
  productId: number;
  productName: string;
  productCode: string;
  totalQuantitySold: number;
  totalRevenueGenerated: number;
  quantityAvailable: number;
  stockValue: number;
}

export interface ProductInsightPage {
  content: ProductInsight[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class InsightsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCustomerInsights(page: number = 0, size: number = 10): Observable<CustomerInsightPage> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<CustomerInsightPage>(`${this.apiUrl}/insights/customers`, { params });
  }

  getMonthlySales(): Observable<MonthlySale[]> {
    return this.http.get<MonthlySale[]>(`${this.apiUrl}/insights/monthly-sales`);
  }

  getTopProducts(page: number = 0, size: number = 10): Observable<ProductInsightPage> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ProductInsightPage>(`${this.apiUrl}/insights/top-products`, { params });
  }
}
