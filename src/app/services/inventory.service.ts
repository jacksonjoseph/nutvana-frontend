import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventorySummary, InventoryTransaction } from '../models/inventory.model';
import { PageableResponse } from '../models/pageable.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getTransactions(inventoryId: number, page: number = 0, size: number = 20): Observable<PageableResponse<InventoryTransaction>> {
    return this.http.get<PageableResponse<InventoryTransaction>>(`${this.baseUrl}/inventory-transactions/inventory/${inventoryId}`, {
      params: { page, size }
    });
  }

  createTransaction(transaction: InventoryTransaction): Observable<InventoryTransaction> {
    return this.http.post<InventoryTransaction>(`${this.baseUrl}/inventory-transactions`, transaction);
  }
}
