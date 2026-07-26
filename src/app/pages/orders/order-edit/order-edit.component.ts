import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { CustomerService } from '../../../services/customer.service';
import { ProductService } from '../../../services/product.service';
import { Order, OrderItem } from '../../../models/order.model';
import { Customer } from '../../../models/customer.model';
import { Product } from '../../../models/product.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PrintInvoiceComponent } from '../../../shared/components/print-invoice/print-invoice.component';

@Component({
  selector: 'app-order-edit',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  template: `
    <div class="form-page">
      <div class="form-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="form-title">Edit Order #{{ orderId }}</h1>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading order...</p>
        </div>
      } @else {
        <!-- Edit Mode -->
        <form class="form-body" (ngSubmit)="onSubmit()">
          <!-- Order Date Section -->
          <div class="section">
            <h2 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Order Details
            </h2>
            <div class="form-group" style="max-width: 250px;">
              <label class="form-label" for="orderDate">Order Date</label>
              <input
                id="orderDate"
                class="form-input"
                type="date"
                [(ngModel)]="orderDateInput"
                name="orderDate"
              />
            </div>
          </div>

          <!-- Direct / Home Sale Toggle -->
          <div class="direct-sale-box" style="background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 1rem; padding: 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem;">
                <span>⚡ Direct / Home Sale</span>
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
                No customer required & skips inventory stock deduction
              </div>
            </div>
            <label class="switch" style="position: relative; display: inline-block; width: 46px; height: 26px;">
              <input type="checkbox" [ngModel]="isDirectSale()" (ngModelChange)="toggleDirectSale($event)" name="isDirectSale" style="opacity: 0; width: 0; height: 0;" />
              <span class="slider" [style.background]="isDirectSale() ? 'var(--accent)' : 'var(--surface-border)'" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; transition: .3s; border-radius: 34px;">
                <span [style.transform]="isDirectSale() ? 'translateX(20px)' : 'translateX(0px)'" style="position: absolute; content: ''; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .3s; border-radius: 50%;"></span>
              </span>
            </label>
          </div>

          <!-- Customer Search Section -->
          <div class="section">
            <h2 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Customer
            </h2>

            @if (isDirectSale()) {
              <div style="border-left: 3px solid var(--accent); padding-left: 0.75rem; padding-top: 0.25rem;">
                <div style="font-size: 0.9rem; font-weight: 600; color: var(--accent);">
                  Direct / Home Sale Mode Active
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
                  Revenue will be recorded. Customer and stock custody requirements are bypassed.
                </div>
              </div>
            } @else if (selectedCustomer()) {
              <div class="selected-chip">
                <div class="chip-avatar">{{ getInitials(selectedCustomer()!.name) }}</div>
                <div class="chip-info">
                  <span class="chip-name">{{ selectedCustomer()!.name }}</span>
                  <span class="chip-detail">{{ selectedCustomer()!.location }} · {{ selectedCustomer()!.phone }}</span>
                </div>
                <button type="button" class="chip-remove" (click)="removeCustomer()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              @if (getSalesPersonsForCustomer().length > 0) {
                <div class="form-group" style="margin-top: 0.75rem; max-width: 350px;">
                  <label class="form-label" for="orderSalesPerson" style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem; display: block;">Fulfilled by Sales Representative</label>
                  <select
                    id="orderSalesPerson"
                    class="form-input"
                    [ngModel]="selectedSalesPersonId()"
                    (ngModelChange)="selectedSalesPersonId.set(+$event)"
                    name="salesPersonId"
                    style="padding: 0.5rem; font-size: 0.85rem;"
                  >
                    @for (sp of getSalesPersonsForCustomer(); track sp.id) {
                      <option [value]="sp.id">{{ sp.name }}</option>
                    }
                  </select>
                </div>
              }
            } @else {
              <div class="search-container">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  class="search-input"
                  type="text"
                  placeholder="Search customers by name..."
                  [ngModel]="customerSearchTerm()"
                  (ngModelChange)="onCustomerSearch($event)"
                  name="customerSearch"
                />
              </div>
              @if (customerResults().length > 0) {
                <div class="search-results">
                  @for (customer of customerResults(); track customer.id) {
                    <button type="button" class="search-result-item" (click)="selectCustomer(customer)">
                      <div class="result-avatar">{{ getInitials(customer.name) }}</div>
                      <div class="result-info">
                        <div class="result-name">{{ customer.name }}</div>
                        <div class="result-detail">{{ customer.location }} · {{ customer.phone }}</div>
                      </div>
                    </button>
                  }
                </div>
              }
            }
          </div>

          <!-- Order Items Section -->
          <div class="section">
            <h2 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Items ({{ orderItems().length }})
            </h2>

            @for (item of orderItems(); track $index; let i = $index) {
              <div class="item-card">
                <div class="item-header">
                  <span class="item-number">Item {{ i + 1 }}</span>
                  <button type="button" class="item-remove" (click)="removeItem(i)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                @if (item.productId && item.productName) {
                  <div class="selected-product">
                    <span class="product-name">{{ item.productName }}</span>
                  </div>
                } @else {
                  <div class="search-container">
                    <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      class="search-input"
                      type="text"
                      placeholder="Search products..."
                      [ngModel]="productSearchTerms()[i] || ''"
                      (ngModelChange)="onProductSearch($event, i)"
                      [name]="'productSearch_' + i"
                    />
                  </div>
                  @if (activeProductSearchIndex() === i && productResults().length > 0) {
                    <div class="search-results">
                      @for (product of productResults(); track product.id) {
                        <button type="button" class="search-result-item" (click)="selectProduct(product, i)">
                          <div class="result-badge">{{ product.code }}</div>
                          <div class="result-info">
                            <div class="result-name">{{ product.name }}</div>
                            <div class="result-detail">Sale: {{ product.maxSalePrice | currency:'INR':'₹':'1.2-2' }}</div>
                          </div>
                        </button>
                      }
                    </div>
                  }
                }

                <div class="item-fields">
                  <div class="form-group">
                    <label class="form-label">Quantity</label>
                    <input
                      class="form-input"
                      type="number"
                      min="0.0001"
                      step="any"
                      [(ngModel)]="item.quantity"
                      [name]="'qty_' + i"
                      (ngModelChange)="calculateTotal()"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Unit Price</label>
                    <input
                      class="form-input"
                      type="number"
                      step="0.01"
                      [(ngModel)]="item.unitPrice"
                      [name]="'price_' + i"
                      (ngModelChange)="calculateTotal()"
                    />
                  </div>
                </div>

                <div class="item-subtotal">
                  Subtotal: {{ (item.quantity * item.unitPrice) | currency:'INR':'₹':'1.2-2' }}
                </div>
              </div>
            }

            <button type="button" class="add-item-btn" (click)="addItem()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Item
            </button>
          </div>

          <!-- Amount Section -->
          <div class="section">
            <h2 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3h12"/>
                <path d="M6 8h12"/>
                <path d="m6 13 8.5 8"/>
                <path d="M6 13h3"/>
                <path d="M9 13c6.667 0 6.667-10 0-10"/>
              </svg>
              Payment
            </h2>

            <div class="summary-card">
              <div class="summary-row">
                <span>Total Amount</span>
                <span class="summary-value">{{ calculatedTotal() | currency:'INR':'₹':'1.2-2' }}</span>
              </div>
              <div class="summary-row highlight">
                <label class="form-label" style="margin:0" for="discount">Discount</label>
                <input
                  id="discount"
                  class="amount-input discount-input"
                  type="number"
                  step="0.01"
                  min="0"
                  [(ngModel)]="discount"
                  name="discount"
                />
              </div>
              <div class="summary-row highlight">
                <label class="form-label" style="margin:0" for="amountCollected">Amount Collected</label>
                <input
                  id="amountCollected"
                  class="amount-input"
                  type="number"
                  step="0.01"
                  [(ngModel)]="amountCollected"
                  name="amountCollected"
                  required
                />
              </div>
            </div>
          </div>

          <div class="btn-row">
            <button type="button" class="cancel-btn" (click)="cancelEdit()" [disabled]="saving()">
              Cancel
            </button>
            <button
              type="submit"
              class="submit-btn"
              [disabled]="saving() || !isValid()"
            >
              @if (saving()) {
                <span class="btn-spinner"></span> Updating...
              } @else {
                Update Order
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .form-page { min-height: 100vh; background: var(--surface-ground); }

    .form-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      position: sticky;
      top: 0;
      background: var(--surface-ground);
      z-index: 10;
    }

    .back-btn {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.75rem;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-primary);
      transition: all 0.2s;
    }

    .back-btn:hover { background: var(--surface-hover); }

    .form-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .icon-btn {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.75rem;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-primary);
      transition: all 0.2s;
    }

    .icon-btn:hover { background: var(--surface-hover); }

    .menu-container { position: relative; }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.75rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      width: 140px;
      display: flex;
      flex-direction: column;
      padding: 0.25rem;
      z-index: 20;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border: none;
      background: none;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-primary);
      cursor: pointer;
      border-radius: 0.5rem;
      text-align: left;
      transition: all 0.2s;
    }

    .menu-item:hover { background: var(--surface-hover); }

    .text-danger { color: #ef4444; }
    .text-danger:hover { background: rgba(239, 68, 68, 0.1); }

    /* View Mode */
    .view-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .view-body { padding: 1rem; }
    .view-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.85rem;
      padding: 0.85rem;
      margin-bottom: 0;
    }
    .view-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .view-info { flex: 1; min-width: 0; }
    .view-name { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
    .view-detail { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem; }
    
    .view-section { margin-bottom: 1.5rem; }
    .view-section-title { font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); margin: 0 0 0.75rem 0.25rem; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .view-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .view-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
    }
    .view-item-main { display: flex; align-items: center; gap: 0.75rem; }
    .view-item-name { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
    .view-item-qty { font-size: 0.8rem; font-weight: 700; color: var(--accent); background: var(--accent-subtle); padding: 0.15rem 0.4rem; border-radius: 1rem; }
    .view-item-price { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }

    .view-payment-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.85rem;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .amount-col { display: flex; flex-direction: column; gap: 0.15rem; }
    .amount-col:first-child { align-items: flex-start; }
    .amount-col:nth-child(2) { align-items: center; }
    .amount-col:last-child { align-items: flex-end; }
    .amount-lbl { font-size: 0.65rem; color: var(--text-secondary); font-weight: 500; }
    .amount-val { font-size: 0.85rem; font-weight: 700; }
    .total { color: #3b82f6; }
    .collected { color: #22c55e; }
    .balance-due { color: #ef4444; }
    .balance-clear { color: var(--text-secondary); }

    .btn-row { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
    .cancel-btn { flex: 1; padding: 1rem; background: var(--surface-card); color: var(--text-primary); border: 1.5px solid var(--surface-border); border-radius: 0.75rem; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .cancel-btn:hover { background: var(--surface-hover); }

    .form-body { padding: 0.5rem 1rem 2rem; }

    .section { margin-bottom: 1.5rem; }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-container { position: relative; }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
    }

    .search-input {
      width: 100%;
      padding: 0.85rem 1rem 0.85rem 2.75rem;
      background: var(--surface-card);
      border: 1.5px solid var(--surface-border);
      border-radius: 0.75rem;
      font-size: 0.95rem;
      color: var(--text-primary);
      font-family: inherit;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-subtle);
    }

    .search-input::placeholder { color: var(--text-placeholder); }

    .search-results {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.75rem;
      margin-top: 0.5rem;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .search-result-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      cursor: pointer;
      transition: background 0.2s;
      text-align: left;
      font-family: inherit;
      color: var(--text-primary);
    }

    .search-result-item:hover { background: var(--surface-hover); }

    .search-result-item + .search-result-item {
      border-top: 1px solid var(--surface-border);
    }

    .result-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .result-badge {
      background: var(--accent-subtle);
      color: var(--accent);
      padding: 0.25rem 0.6rem;
      border-radius: 0.4rem;
      font-size: 0.7rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .result-info { flex: 1; min-width: 0; }
    .result-name { font-size: 0.9rem; font-weight: 600; }
    .result-detail { font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.15rem; }

    .selected-chip {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--surface-card);
      border: 1.5px solid var(--accent);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
    }

    .chip-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .chip-info { flex: 1; min-width: 0; }
    .chip-name { display: block; font-weight: 600; color: var(--text-primary); font-size: 0.95rem; }
    .chip-detail { display: block; font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.1rem; }

    .chip-remove {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.4rem;
      display: flex;
      transition: all 0.2s;
    }

    .chip-remove:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .item-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 1rem;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }

    .item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .item-number {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .item-remove {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.4rem;
      display: flex;
      transition: all 0.2s;
    }

    .item-remove:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .selected-product {
      background: var(--accent-subtle);
      border-radius: 0.5rem;
      padding: 0.6rem 0.85rem;
      margin-bottom: 0.75rem;
    }

    .product-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--accent);
    }

    .item-fields {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.75rem;
    }

    .item-subtotal {
      text-align: right;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent);
      margin-top: 0.5rem;
    }

    .add-item-btn {
      width: 100%;
      padding: 0.85rem;
      background: none;
      border: 2px dashed var(--surface-border);
      border-radius: 0.75rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
      font-family: inherit;
    }

    .add-item-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: var(--accent-subtle);
    }

    .summary-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 1rem;
      padding: 1rem;
    }

    .summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .summary-row + .summary-row {
      border-top: 1px solid var(--surface-border);
      padding-top: 0.75rem;
      margin-top: 0.25rem;
    }

    .summary-value {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 1.1rem;
    }

    .amount-input {
      width: 140px;
      padding: 0.6rem 0.75rem;
      background: var(--surface-ground);
      border: 1.5px solid var(--surface-border);
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 700;
      color: var(--accent);
      text-align: right;
      font-family: inherit;
      transition: all 0.2s;
    }

    .amount-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-subtle);
    }

    .discount-input {
      color: #3b82f6;
      border-color: rgba(59, 130, 246, 0.3);
    }

    .discount-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .form-group { margin-bottom: 0; flex: 1; }

    .form-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-input {
      width: 100%;
      padding: 0.7rem 0.75rem;
      background: var(--surface-ground);
      border: 1.5px solid var(--surface-border);
      border-radius: 0.5rem;
      font-size: 0.95rem;
      color: var(--text-primary);
      font-family: inherit;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-subtle);
    }

    .submit-btn {
      width: 100%;
      padding: 1rem;
      background: var(--accent-gradient);
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      margin-top: 0.5rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .submit-btn:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }

    .btn-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
      color: var(--text-secondary);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--surface-border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class OrderEditComponent implements OnInit {
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  orderId!: number;
  loading = signal(true);
  saving = signal(false);
  currentOrderDate: Date | string | null = null;
  orderDateInput = '';

  // Customer search
  selectedCustomer = signal<Customer | null>(null);
  customerSearchTerm = signal('');
  customerResults = signal<Customer[]>([]);
  isDirectSale = signal<boolean>(false);
  selectedSalesPersonId = signal<number | null>(null);

  // Product search
  productSearchTerms = signal<string[]>([]);
  productResults = signal<Product[]>([]);
  activeProductSearchIndex = signal(-1);

  // Order
  orderItems = signal<OrderItem[]>([]);
  amountCollected = 0;
  discount = 0;
  calculatedTotal = signal(0);

  ngOnInit() {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getById(this.orderId).subscribe({
      next: (order) => {
        this.amountCollected = order.amountCollected;
        this.discount = order.discount || 0;
        this.isDirectSale.set(!!order.isDirectSale);
        const d = order.orderDate ? new Date(order.orderDate) : new Date();
        this.currentOrderDate = d;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        this.orderDateInput = `${year}-${month}-${day}`;
        
        this.orderItems.set(order.items || []);
        this.calculateTotal();

        this.selectedSalesPersonId.set(order.salesPersonId || null);

        // Load customer info
        if (order.customerId) {
          this.customerService.getById(order.customerId).subscribe({
            next: (customer) => {
              this.selectedCustomer.set(customer);
              this.loading.set(false);
            },
            error: () => {
              this.loading.set(false);
            }
          });
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/orders']);
      }
    });
  }

  toggleDirectSale(value: boolean) {
    this.isDirectSale.set(value);
    if (value) {
      this.selectedCustomer.set(null);
    }
  }

  onCustomerSearch(term: string) {
    this.customerSearchTerm.set(term);
    if (term.length < 2) {
      this.customerResults.set([]);
      return;
    }
    this.customerService.search(term).subscribe({
      next: (results) => this.customerResults.set(results),
      error: () => this.customerResults.set([])
    });
  }

  selectCustomer(customer: Customer) {
    this.selectedCustomer.set(customer);
    this.customerResults.set([]);
    this.customerSearchTerm.set('');

    const spList = this.getSalesPersonsForCustomer();
    if (spList.length > 0) {
      this.selectedSalesPersonId.set(spList[0].id);
    } else {
      this.selectedSalesPersonId.set(null);
    }
  }

  removeCustomer() {
    this.selectedCustomer.set(null);
    this.selectedSalesPersonId.set(null);
  }

  getSalesPersonsForCustomer(): { id: number; name: string }[] {
    const customer = this.selectedCustomer();
    if (!customer || !customer.salesPersonIds || !customer.salesPersonNames) return [];
    return customer.salesPersonIds.map((id, index) => ({
      id,
      name: (customer.salesPersonNames && customer.salesPersonNames[index]) || 'Salesperson'
    }));
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  onProductSearch(term: string, index: number) {
    const terms = [...this.productSearchTerms()];
    terms[index] = term;
    this.productSearchTerms.set(terms);
    this.activeProductSearchIndex.set(index);

    if (term.length < 1) {
      this.productResults.set([]);
      return;
    }

    this.productService.search(term).subscribe({
      next: (results) => this.productResults.set(results),
      error: () => this.productResults.set([])
    });
  }

  selectProduct(product: Product, index: number) {
    const items = [...this.orderItems()];
    items[index] = {
      ...items[index],
      productId: product.id!,
      productName: product.name,
      unitPrice: product.maxSalePrice
    };
    this.orderItems.set(items);
    this.productResults.set([]);
    this.activeProductSearchIndex.set(-1);
    this.calculateTotal();
  }

  addItem() {
    this.orderItems.update(items => [...items, {
      productId: 0,
      quantity: 1,
      unitPrice: 0
    }]);
  }

  removeItem(index: number) {
    this.orderItems.update(items => items.filter((_, i) => i !== index));
    this.calculateTotal();
  }

  calculateTotal() {
    const total = this.orderItems().reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    this.calculatedTotal.set(total);
  }

  isValid(): boolean {
    const hasCustomerOrDirect = this.isDirectSale() || !!this.selectedCustomer();
    return hasCustomerOrDirect && this.orderItems().length > 0 &&
      this.orderItems().every(item => item.productId > 0 && item.quantity > 0 && item.unitPrice > 0);
  }

  goBack() {
    const customerId = this.route.snapshot.queryParamMap.get('customerId');
    if (customerId) {
      this.router.navigate(['/customers/details', customerId]);
    } else {
      this.router.navigate(['/orders/details', this.orderId]);
    }
  }

  onSubmit() {
    if (!this.isValid()) return;

    this.saving.set(true);
    let formattedDate;
    if (this.orderDateInput) {
      const d = new Date(this.orderDateInput);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      formattedDate = `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    }
    const order: Order = {
      customerId: this.isDirectSale() ? undefined : this.selectedCustomer()?.id,
      isDirectSale: this.isDirectSale(),
      salesPersonId: this.isDirectSale() ? undefined : (this.selectedSalesPersonId() || undefined),
      amountCollected: this.amountCollected,
      discount: this.discount || 0,
      orderDate: formattedDate,
      items: this.orderItems().map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    this.orderService.update(this.orderId, order).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/orders/details', this.orderId]);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  cancelEdit() {
    this.router.navigate(['/orders/details', this.orderId]);
  }
}
