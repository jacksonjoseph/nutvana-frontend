import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { CustomerService } from '../../../services/customer.service';
import { ProductService } from '../../../services/product.service';
import { SalesPersonService } from '../../../services/sales-person.service';
import { Order, OrderItem, BillParseResult } from '../../../models/order.model';
import { Customer } from '../../../models/customer.model';
import { Product } from '../../../models/product.model';
import { SalesPerson, SalesPersonInventory } from '../../../models/sales-person.model';

@Component({
  selector: 'app-order-create',
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
        <h1 class="form-title">New Order</h1>
        <div style="width:36px"></div>
      </div>

      <form class="form-body" (ngSubmit)="onSubmit()">
        <!-- Auto-fill from Bill Section -->
        <div class="section" style="margin-bottom: 1.5rem;">
          <h2 class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Auto-fill from Bill (Optional)
          </h2>
          
          <div class="upload-zone" 
               [class.drag-over]="isDragOver()"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)"
               (click)="fileInput.click()">
            <input 
              #fileInput 
              type="file" 
              accept="image/*,application/pdf" 
              style="display: none;" 
              (change)="onFileSelected($event)" 
            />
            
            @if (parsingBill()) {
              <div class="upload-content">
                <span class="btn-spinner" style="border-top-color: var(--accent); width: 24px; height: 24px; margin-bottom: 0.5rem;"></span>
                <p class="upload-text">Processing bill with Gemini...</p>
                <p class="upload-subtext">Extracting items, prices, and totals</p>
              </div>
            } @else {
              <div class="upload-content">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="margin-bottom: 0.5rem;">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <p class="upload-text">Drag & drop your bill, or <span style="color: var(--accent); font-weight: 600; text-decoration: underline;">browse</span></p>
                <p class="upload-subtext">Supports PNG, JPG, WEBP, and PDF</p>
              </div>
            }
          </div>
          @if (parseError()) {
            <div class="parse-error-message">
              <span>⚠️</span>
              <div>{{ parseError() }}</div>
            </div>
          }
        </div>

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
            @if (allSalesPersons().length > 0) {
              <div class="form-group" style="margin-top: 0.75rem; max-width: 350px;">
                <label class="form-label" for="directSalesPerson" style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem; display: block;">Fulfilled by Sales Representative</label>
                <select
                  id="directSalesPerson"
                  class="form-input"
                  [ngModel]="selectedSalesPersonId()"
                  (ngModelChange)="onSalesPersonChange($event)"
                  name="salesPersonId"
                  style="padding: 0.5rem; font-size: 0.85rem;"
                >
                  <option [value]="null">Select Salesperson (Optional)</option>
                  @for (sp of allSalesPersons(); track sp.id) {
                    <option [value]="sp.id">{{ sp.name }}</option>
                  }
                </select>
              </div>
            }
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
                  (ngModelChange)="onSalesPersonChange($event)"
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
          <div class="section-header">
            <h2 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Items ({{ orderItems().length }})
            </h2>
          </div>

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
                      <button type="button" class="search-result-item" [disabled]="isProductAlreadySelected(product.id, i)" (click)="selectProduct(product, i)">
                        <div class="result-badge">{{ product.code }}</div>
                        <div class="result-info">
                          <div class="result-name">
                            {{ product.name }}
                            @if (isProductAlreadySelected(product.id, i)) {
                              <span style="color: var(--danger); font-size: 0.72rem; margin-left: 0.5rem; font-weight: normal; background: var(--danger-subtle); padding: 0.15rem 0.4rem; border-radius: 0.25rem;">Already Selected</span>
                            }
                          </div>
                          <div class="result-detail">MRP: {{ product.maxRetailPrice | currency:'INR':'₹':'1.2-2' }} · Sale: {{ product.maxSalePrice | currency:'INR':'₹':'1.2-2' }}</div>
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
                    (wheel)="preventScroll($event)"
                  />
                  @if (isSalesPersonLinked() && item.productId) {
                    <span class="stock-info" [class.insufficient]="item.quantity > getSalesPersonStock(item.productId)" style="font-size: 0.75rem; margin-top: 0.25rem; display: block;">
                      @if (item.quantity > getSalesPersonStock(item.productId)) {
                        Insufficient stock (Only {{ getSalesPersonStock(item.productId) }} available)
                      } @else {
                        Available in stock: {{ getSalesPersonStock(item.productId) }}
                      }
                    </span>
                  }
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
                    (wheel)="preventScroll($event)"
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
                (wheel)="preventScroll($event)"
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
                (wheel)="preventScroll($event)"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="submit-btn"
          [disabled]="saving() || !isValid()"
        >
          @if (saving()) {
            <span class="btn-spinner"></span> Creating...
          } @else {
            Create Order
          }
        </button>
      </form>
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

    .form-body { padding: 0.5rem 1rem 2rem; }

    .section {
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Search */
    .search-container {
      position: relative;
    }

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

    .search-result-item:hover {
      background: var(--surface-hover);
    }

    .search-result-item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: none;
    }

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

    .result-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .result-detail {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 0.15rem;
    }

    /* Selected chip */
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

    .chip-name {
      display: block;
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.95rem;
    }

    .chip-detail {
      display: block;
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 0.1rem;
    }

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

    /* Item Card */
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

    /* Summary */
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

    /* Form */
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

    .stock-info {
      color: #10b981;
      font-weight: 500;
    }
    .stock-info.insufficient {
      color: #ef4444;
      font-weight: 600;
    }

    .upload-zone {
      border: 2px dashed var(--surface-border);
      border-radius: 1rem;
      background: var(--surface-card);
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 120px;
      box-sizing: border-box;
    }
    .upload-zone:hover, .upload-zone.drag-over {
      border-color: var(--accent);
      background: rgba(99, 102, 241, 0.04);
      box-shadow: 0 0 0 4px var(--accent-subtle);
    }
    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }
    .upload-text {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-primary);
      margin: 0.25rem 0 0;
    }
    .upload-subtext {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 0;
    }
    .parse-error-message {
      color: var(--danger);
      background: var(--danger-subtle);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      font-size: 0.8rem;
      margin-top: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-align: left;
      box-sizing: border-box;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class OrderCreateComponent implements OnInit {
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private salesPersonService = inject(SalesPersonService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Customer search
  selectedCustomer = signal<Customer | null>(null);
  customerSearchTerm = signal('');
  customerResults = signal<Customer[]>([]);

  // Product search
  productSearchTerms = signal<string[]>([]);
  productResults = signal<Product[]>([]);
  activeProductSearchIndex = signal(-1);

  // Sales Person stock map
  salesPersonStockMap = signal<Map<number, number>>(new Map());
  isSalesPersonLinked = signal(false);
  salesPersonName = signal('');
  selectedSalesPersonId = signal<number | null>(null);
  allSalesPersons = signal<SalesPerson[]>([]);

  // Order items
  orderItems = signal<OrderItem[]>([]);
  amountCollected = 0;
  discount = 0;
  calculatedTotal = signal(0);
  orderDateInput = '';

  saving = signal(false);

  // Direct sale mode
  isDirectSale = signal(false);

  // Bill parsing state
  parsingBill = signal(false);
  parseError = signal('');
  isDragOver = signal(false);

  ngOnInit() {
    // Initialize order date
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    this.orderDateInput = `${year}-${month}-${day}`;

    // Load all active salespersons for direct sales
    this.salesPersonService.getAll(0, 100).subscribe({
      next: (res) => this.allSalesPersons.set(res.content || []),
      error: (err) => console.error('Failed to load salespersons', err)
    });

    const customerId = this.route.snapshot.queryParamMap.get('customerId');
    if (customerId) {
      this.customerService.getById(Number(customerId)).subscribe({
        next: (customer) => this.selectCustomer(customer),
        error: () => console.error('Failed to pre-load customer from URL')
      });
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
      this.loadSalesPersonInventory(spList[0].id);
    } else {
      this.selectedSalesPersonId.set(null);
      this.isSalesPersonLinked.set(false);
      this.salesPersonStockMap.set(new Map());
    }
  }

  loadSalesPersonInventory(salesPersonId: number) {
    this.isSalesPersonLinked.set(true);
    this.salesPersonService.getInventory(salesPersonId).subscribe({
      next: (inventoryList) => {
        const stockMap = new Map<number, number>();
        inventoryList.forEach(item => {
          stockMap.set(item.productId, item.quantity);
        });
        this.salesPersonStockMap.set(stockMap);
      },
      error: () => {
        console.error('Failed to load salesperson inventory');
        this.salesPersonStockMap.set(new Map());
      }
    });
  }

  onSalesPersonChange(spId: any) {
    const id = spId && spId !== 'null' ? Number(spId) : null;
    this.selectedSalesPersonId.set(id);
    if (id && !this.isDirectSale()) {
      this.loadSalesPersonInventory(id);
    } else {
      this.isSalesPersonLinked.set(false);
      this.salesPersonStockMap.set(new Map());
    }
  }

  getSalesPersonsForCustomer(): { id: number; name: string }[] {
    const customer = this.selectedCustomer();
    if (!customer || !customer.salesPersonIds || !customer.salesPersonNames) return [];
    return customer.salesPersonIds.map((id, index) => ({
      id,
      name: (customer.salesPersonNames && customer.salesPersonNames[index]) || 'Salesperson'
    }));
  }

  toggleDirectSale(enabled: boolean) {
    this.isDirectSale.set(enabled);
    if (enabled) {
      this.selectedCustomer.set(null);
      this.isSalesPersonLinked.set(false);
      this.salesPersonName.set('');
      this.salesPersonStockMap.set(new Map());
      this.selectedSalesPersonId.set(null);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processBillFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processBillFile(input.files[0]);
    }
  }

  processBillFile(file: File) {
    this.parsingBill.set(true);
    this.parseError.set('');

    this.orderService.parseBill(file).subscribe({
      next: (result) => {
        this.parsingBill.set(false);
        this.populateParsedBill(result);
      },
      error: (err) => {
        this.parsingBill.set(false);
        console.error('Failed to parse bill:', err);
        let errorMsg = 'Failed to parse the bill. Please make sure the Gemini API key is configured correctly in application.properties.';
        if (err && err.error) {
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error.message) {
            errorMsg = err.error.message;
          }
        }
        this.parseError.set(errorMsg);
      }
    });
  }

  populateParsedBill(result: BillParseResult) {
    if (!result || !result.items || result.items.length === 0) {
      this.parseError.set('No items were extracted from the uploaded bill.');
      return;
    }

    const items: OrderItem[] = result.items.map(parsedItem => {
      const hasMatch = !!parsedItem.matchedProduct;
      return {
        productId: hasMatch ? parsedItem.matchedProduct!.id : 0,
        productName: hasMatch ? parsedItem.matchedProduct!.name : undefined,
        quantity: parsedItem.quantity || 1,
        unitPrice: hasMatch ? parsedItem.matchedProduct!.maxSalePrice : (parsedItem.unitPrice || 0)
      };
    });

    this.orderItems.set(items);
    this.discount = result.discount || 0;
    this.amountCollected = result.amountCollected || 0;
    this.calculateTotal();

    // Set product search term state to extractedName if not matched
    const searchTerms = result.items.map(parsedItem => parsedItem.matchedProduct ? '' : (parsedItem.extractedName || ''));
    this.productSearchTerms.set(searchTerms);
    this.activeProductSearchIndex.set(-1);
  }

  removeCustomer() {
    this.selectedCustomer.set(null);
    this.isSalesPersonLinked.set(false);
    this.salesPersonName.set('');
    this.salesPersonStockMap.set(new Map());
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Product search
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

  getSalesPersonStock(productId: number): number {
    return this.salesPersonStockMap().get(productId) ?? 0;
  }

  isProductAlreadySelected(productId: number | undefined, currentIndex: number): boolean {
    if (!productId) return false;
    return this.orderItems().some((item, idx) => item.productId === productId && idx !== currentIndex);
  }

  isValid(): boolean {
    const hasItems = this.orderItems().length > 0 &&
      this.orderItems().every(item => item.productId > 0 && item.quantity > 0 && item.unitPrice > 0);
    if (!hasItems) return false;

    // Check for duplicate products
    const productIds = this.orderItems().map(item => item.productId).filter(id => id > 0);
    const hasDuplicates = productIds.some((id, index) => productIds.indexOf(id) !== index);
    if (hasDuplicates) return false;

    if (this.isDirectSale()) {
      return true;
    }

    if (!this.selectedCustomer()) return false;

    if (this.isSalesPersonLinked()) {
      return this.orderItems().every(item => {
        const available = this.getSalesPersonStock(item.productId);
        return item.quantity <= available;
      });
    }

    return true;
  }

  goBack() {
    const customerId = this.route.snapshot.queryParamMap.get('customerId');
    if (customerId) {
      this.router.navigate(['/customers/details', customerId]);
    } else {
      this.router.navigate(['/orders']);
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
      isDirectSale: this.isDirectSale(),
      customerId: this.isDirectSale() ? undefined : this.selectedCustomer()?.id,
      salesPersonId: this.selectedSalesPersonId() || undefined,
      amountCollected: this.amountCollected,
      discount: this.discount || 0,
      orderDate: formattedDate,
      items: this.orderItems().map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    this.orderService.create(order).subscribe({
      next: () => {
        const customerId = this.route.snapshot.queryParamMap.get('customerId');
        if (customerId) {
          this.router.navigate(['/customers/details', customerId]);
        } else {
          this.router.navigate(['/orders']);
        }
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  preventScroll(event: Event) {
    if (event.target instanceof HTMLInputElement) {
      event.target.blur();
    }
  }
}
