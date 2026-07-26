import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesPersonService } from '../../../services/sales-person.service';
import { CustomerService } from '../../../services/customer.service';
import { ProductService } from '../../../services/product.service';
import { SalesPerson, SalesPersonInventory } from '../../../models/sales-person.model';
import { Customer } from '../../../models/customer.model';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-sales-person-details',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="details-page">
      <!-- Header -->
      <div class="details-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="details-title">Representative Profile</h1>
        <button class="edit-btn" (click)="navigateToEdit()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      } @else {
        <!-- Sales Person Card -->
        <div class="sp-card">
          <div class="sp-avatar">{{ getInitials(salesPerson.name) }}</div>
          <div class="sp-info">
            <div class="sp-name-row">
              <h2 class="sp-name">{{ salesPerson.name }}</h2>
              <span class="status-badge" [class.active]="salesPerson.isActive" [class.inactive]="!salesPerson.isActive">
                {{ salesPerson.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="sp-meta-grid">
              <div class="sp-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>{{ salesPerson.phone || 'No phone' }}</span>
              </div>
              <div class="sp-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{{ salesPerson.email || 'No email' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="tabs">
          <button class="tab-btn" [class.active]="activeTab() === 'inventory'" (click)="activeTab.set('inventory')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            Stock Inventory ({{ inventory().length }})
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'customers'" (click)="activeTab.set('customers')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Linked Customers ({{ linkedCustomers().length }})
          </button>
        </div>

        <!-- Tab Content: Inventory -->
        @if (activeTab() === 'inventory') {
          <div class="tab-content">
            <div class="action-row">
              <h3 class="section-heading">Current Stock</h3>
              <div class="button-group">
                <button class="btn-secondary" (click)="openReturnModal()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="15 14 20 9 15 4"/>
                    <path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
                  </svg>
                  Return Stock
                </button>
                <button class="btn-primary-sm" (click)="openAllocateModal()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Allocate Stock
                </button>
              </div>
            </div>

            @if (inventory().length === 0) {
              <div class="empty-state-card">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <p>No stock inventory allocated to this representative</p>
                <button class="btn-primary-sm" (click)="openAllocateModal()" style="margin-top:0.5rem;">Allocate Initial Stock</button>
              </div>
            } @else {
              <!-- KPI Summary Cards -->
              <div class="kpi-row">
                <div class="kpi-card">
                  <div>
                    <div class="kpi-label">Total Allocated Stock</div>
                    <div class="kpi-value">{{ getTotalStock() }} <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">units</span></div>
                  </div>
                  <div class="kpi-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </div>
                </div>

                <div class="kpi-card">
                  <div>
                    <div class="kpi-label">Unique Products</div>
                    <div class="kpi-value">{{ inventory().length }} <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">types</span></div>
                  </div>
                  <div class="kpi-icon-wrapper" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="22" y1="12" x2="18" y2="12"/>
                      <line x1="6" y1="12" x2="2" y2="12"/>
                      <line x1="12" y1="6" x2="12" y2="2"/>
                      <line x1="12" y1="22" x2="12" y2="18"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Table Container -->
              <div class="table-container">
                <table class="inventory-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th class="text-right">Qty</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of inventory(); track item.productId) {
                      <tr>
                        <td class="font-bold">{{ item.productName }}</td>
                        <td class="text-right font-bold qty-val">{{ item.quantity }}</td>
                        <td class="text-muted">{{ item.lastUpdated ? (item.lastUpdated | date:'mediumDate') : 'N/A' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }

        <!-- Tab Content: Customers -->
        @if (activeTab() === 'customers') {
          <div class="tab-content">
            <div class="action-row">
              <h3 class="section-heading">Assigned Accounts</h3>
              <button class="btn-primary-sm" (click)="openLinkModal()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="17" y1="11" x2="23" y2="11"/>
                </svg>
                Link Customers
              </button>
            </div>

            @if (linkedCustomers().length === 0) {
              <div class="empty-state-card">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
                <p>No customers assigned to this representative</p>
                <button class="btn-primary-sm" (click)="openLinkModal()" style="margin-top:0.5rem;">Link Customers Now</button>
              </div>
            } @else {
              <div class="customer-grid">
                @for (c of linkedCustomers(); track c.id) {
                  <div class="customer-chip" (click)="navigateToCustomer(c.id!)">
                    <div class="c-avatar">{{ getInitials(c.name) }}</div>
                    <div class="c-info">
                      <div class="c-name">{{ c.name }}</div>
                      <div class="c-meta">{{ c.location }} · {{ c.phone }}</div>
                    </div>
                    <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- MODAL 1: Link Customers -->
    @if (showLinkModal()) {
      <div class="modal-overlay" (click)="showLinkModal.set(false)">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Link Customers</h3>
            <button class="modal-close" (click)="showLinkModal.set(false)">&times;</button>
          </div>
          <div class="modal-search">
            <input
              type="text"
              placeholder="Filter customers..."
              [(ngModel)]="customerFilterTerm"
              class="modal-input"
            />
          </div>
          <div class="modal-body list-body">
            @for (c of filteredAllCustomers(); track c.id) {
              <label class="checklist-item">
                <input
                  type="checkbox"
                  [checked]="isSelectedCustomer(c.id!)"
                  (change)="toggleCustomerSelect(c.id!)"
                />
                <div class="checklist-info">
                  <span class="checklist-name">{{ c.name }}</span>
                  <span class="checklist-meta">
                    {{ c.location }} · 
                    @if (c.salesPersonName) {
                      <span class="text-warning">Assigned: {{ c.salesPersonName }}</span>
                    } @else {
                      <span class="text-success">Unassigned</span>
                    }
                  </span>
                </div>
              </label>
            }
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="showLinkModal.set(false)" [disabled]="submittingLink()">Cancel</button>
            <button class="btn-primary-sm" (click)="saveLinkedCustomers()" [disabled]="submittingLink()">
              @if (submittingLink()) { <span class="btn-spinner"></span> Saving... } @else { Save Links }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL 2: Allocate Stock -->
    @if (showAllocateModal()) {
      <div class="modal-overlay" (click)="showAllocateModal.set(false)">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Allocate Stock</h3>
            <button class="modal-close" (click)="showAllocateModal.set(false)">&times;</button>
          </div>
          <form (ngSubmit)="submitAllocation()" #allocForm="ngForm" class="modal-form">
            <!-- Product Search -->
             <div class="form-group" style="position: relative;">
              <label class="form-label">Search Product</label>
              @if (selectedProduct()) {
                <div class="selected-product-banner" style="display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start;">
                  <div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
                    <span>{{ selectedProduct()!.name }} (Code: {{ selectedProduct()!.code }})</span>
                    <button type="button" class="banner-remove" (click)="selectedProduct.set(null)" style="font-size: 1.2rem; cursor: pointer; background: none; border: none; color: var(--accent); line-height: 1; padding: 0;">&times;</button>
                  </div>
                  <div style="font-size: 0.75rem; opacity: 0.85; font-weight: 500;">
                    Sale Price: {{ selectedProduct()!.maxSalePrice | currency:'INR':'₹':'1.0-0' }} · Available Warehouse Stock: {{ selectedProduct()!.inventory?.quantity || 0 }}
                  </div>
                </div>
              } @else {
                <input
                  type="text"
                  placeholder="Type product name or code..."
                  [(ngModel)]="productSearchTerm"
                  (ngModelChange)="searchProducts($event)"
                  (focus)="onInputFocus()"
                  (click)="onInputFocus()"
                  name="prodSearch"
                  class="modal-input"
                  autocomplete="off"
                  required
                />
                @if (productResults().length > 0) {
                  <div class="prod-dropdown">
                    @for (p of productResults(); track p.id) {
                      <button type="button" class="prod-dropdown-item" (click)="selectProduct(p)">
                        <div class="prod-dropdown-name">{{ p.name }}</div>
                        <div class="prod-dropdown-code">Code: {{ p.code }} · Sale: {{ p.maxSalePrice | currency:'INR':'₹':'1.0-0' }} · Available: {{ p.inventory?.quantity || 0 }}</div>
                      </button>
                    }
                  </div>
                }
              }
            </div>

            <!-- Quantity -->
            <div class="form-group">
              <label class="form-label" for="allocQty">Quantity</label>
              <input
                id="allocQty"
                type="number"
                min="1"
                [(ngModel)]="allocationQty"
                name="allocQty"
                class="modal-input"
                required
              />
            </div>

            <div class="modal-footer" style="padding: 1rem 0 0; margin-top: 1rem; border-top: 1.5px solid var(--surface-border);">
              <button type="button" class="btn-cancel" (click)="showAllocateModal.set(false)" [disabled]="submittingAlloc()">Cancel</button>
              <button type="submit" class="btn-primary-sm" [disabled]="submittingAlloc() || !selectedProduct() || allocationQty <= 0">
                @if (submittingAlloc()) { <span class="btn-spinner"></span> Allocating... } @else { Allocate Stock }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- MODAL 3: Return Stock -->
    @if (showReturnModal()) {
      <div class="modal-overlay" (click)="showReturnModal.set(false)">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Return Stock</h3>
            <button class="modal-close" (click)="showReturnModal.set(false)">&times;</button>
          </div>
          <form (ngSubmit)="submitReturn()" #returnForm="ngForm" class="modal-form">
            <!-- Product Select -->
            <div class="form-group">
              <label class="form-label" for="retProduct">Select Product</label>
              <select
                id="retProduct"
                [(ngModel)]="selectedReturnProductId"
                name="retProduct"
                class="modal-input"
                (change)="onReturnProductChange()"
                required
              >
                <option [value]="0">-- Select Product --</option>
                @for (item of inventory(); track item.productId) {
                  <option [value]="item.productId">{{ item.productName }} (Qty: {{ item.quantity }})</option>
                }
              </select>
            </div>

            <!-- Quantity -->
            <div class="form-group">
              <label class="form-label" for="retQty">Quantity to Return</label>
              <input
                id="retQty"
                type="number"
                min="1"
                [max]="maxReturnQty"
                [(ngModel)]="returnQty"
                name="retQty"
                class="modal-input"
                required
              />
              @if (returnQty > maxReturnQty) {
                <span class="error-msg">Cannot return more than available quantity (Max: {{ maxReturnQty }})</span>
              }
            </div>

            <div class="modal-footer" style="padding: 1rem 0 0; margin-top: 1rem; border-top: 1.5px solid var(--surface-border);">
              <button type="button" class="btn-cancel" (click)="showReturnModal.set(false)" [disabled]="submittingReturn()">Cancel</button>
              <button type="submit" class="btn-primary-sm" [disabled]="submittingReturn() || selectedReturnProductId === 0 || returnQty <= 0 || returnQty > maxReturnQty">
                @if (submittingReturn()) { <span class="btn-spinner"></span> Returning... } @else { Return Stock }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .details-page { min-height: 100vh; background: var(--surface-ground); padding-bottom: 5rem; }

    .details-header {
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

    .edit-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.75rem;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .edit-btn:hover {
      background: var(--surface-hover);
      border-color: var(--accent);
      color: var(--accent);
    }

    .details-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    /* sp profile card */
    .sp-card {
      margin: 0.5rem 1rem 1.5rem;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 1rem;
      padding: 1.25rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    .sp-avatar {
      width: 54px;
      height: 54px;
      flex-shrink: 0;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      font-weight: 800;
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
    }

    .sp-info { flex: 1; min-width: 0; }

    .sp-name-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.4rem;
    }

    .sp-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }

    .status-badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.1rem 0.45rem;
      border-radius: 0.25rem;
      letter-spacing: 0.3px;
    }

    .status-badge.active {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }

    .status-badge.inactive {
      background: rgba(100, 116, 139, 0.15);
      color: #64748b;
    }

    .sp-meta-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem;
    }

    .sp-meta-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .sp-meta-item svg { flex-shrink: 0; }

    /* Tabs */
    .tabs {
      display: flex;
      border-bottom: 1.5px solid var(--surface-border);
      margin: 0 1rem 1rem;
      gap: 1.5rem;
    }

    .tab-btn {
      background: none;
      border: none;
      padding: 0.75rem 0.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      position: relative;
      transition: all 0.2s;
    }

    .tab-btn:hover { color: var(--text-primary); }

    .tab-btn.active {
      color: var(--accent);
    }

    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -1.5px;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--accent-gradient);
      border-radius: 2px;
    }

    .tab-content { padding: 0 1rem; }

    .action-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .section-heading {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .button-group {
      display: flex;
      gap: 0.5rem;
    }

    .btn-primary-sm {
      background: var(--accent-gradient);
      color: white;
      border: none;
      padding: 0.45rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s;
    }

    .btn-primary-sm:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
    }

    .btn-secondary {
      background: var(--surface-card);
      color: var(--text-primary);
      border: 1px solid var(--surface-border);
      padding: 0.45rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: var(--surface-hover);
    }

    /* Empty state */
    .empty-state-card {
      background: var(--surface-card);
      border: 2px dashed var(--surface-border);
      border-radius: 1rem;
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.85rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .empty-state-card svg { opacity: 0.4; }

    /* Tables */
    .table-container {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.85rem;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
    }

    .inventory-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      text-align: left;
    }

    .inventory-table th, .inventory-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1.5px solid var(--surface-border);
    }

    .inventory-table tr:last-child td { border-bottom: none; }

    .inventory-table th {
      background: var(--surface-hover);
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.5px;
    }

    .font-bold { font-weight: 600; color: var(--text-primary); }
    .text-right { text-align: right; }
    .text-muted { color: var(--text-secondary); }
    .qty-val { color: var(--accent); font-size: 0.9rem; }

    /* Customers Grid */
    .customer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.6rem;
    }

    .customer-chip {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.75rem;
      padding: 0.65rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .customer-chip:hover {
      border-color: var(--accent);
      transform: translateX(2px);
    }

    .c-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .c-info { flex: 1; min-width: 0; }

    .c-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .c-meta {
      font-size: 0.7rem;
      color: var(--text-secondary);
      margin-top: 0.1rem;
    }

    .chevron { color: var(--text-secondary); opacity: 0.6; }

    /* MODAL STYLES */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 1rem;
      animation: fadeIn 0.2s ease;
    }

    .modal-container {
      background: var(--surface-card);
      border-radius: 1.25rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.3s ease;
      display: flex;
      flex-direction: column;
      max-height: 80vh;
      box-sizing: border-box;
      border: 1px solid var(--surface-border);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem;
      border-bottom: 1.5px solid var(--surface-border);
    }

    .modal-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.25rem;
      line-height: 1;
    }

    .modal-close:hover { color: var(--text-primary); }

    .modal-search { padding: 0.75rem 1.25rem; border-bottom: 1.5px solid var(--surface-border); }

    .modal-input {
      width: 100%;
      padding: 0.7rem 0.85rem;
      background: var(--surface-ground);
      border: 1.5px solid var(--surface-border);
      border-radius: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-primary);
      font-family: inherit;
      box-sizing: border-box;
      transition: all 0.2s;
    }

    .modal-input:focus {
      outline: none;
      border-color: var(--accent);
    }

    .modal-body {
      padding: 1.25rem;
      overflow-y: auto;
      flex: 1;
    }

    .list-body {
      padding: 0.5rem 0;
    }

    .checklist-item {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 0.65rem 1.25rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .checklist-item:hover { background: var(--surface-hover); }

    .checklist-item input[type="checkbox"] {
      margin-top: 0.2rem;
      width: 16px;
      height: 16px;
      accent-color: var(--accent);
    }

    .checklist-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .checklist-name { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
    .checklist-meta { font-size: 0.75rem; color: var(--text-secondary); }
    .text-warning { color: #f59e0b; }
    .text-success { color: #10b981; }

    .modal-footer {
      display: flex;
      gap: 0.75rem;
      padding: 1.25rem;
      border-top: 1.5px solid var(--surface-border);
      justify-content: flex-end;
    }

    .btn-cancel {
      background: var(--surface-hover);
      color: var(--text-primary);
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }

    .btn-cancel:hover { background: var(--surface-border); }

    /* Forms in modals */
    .modal-form { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .error-msg { font-size: 0.75rem; color: #ef4444; font-weight: 500; }

    .selected-product-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--accent-subtle);
      border: 1px solid var(--accent);
      border-radius: 0.5rem;
      padding: 0.6rem 0.85rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent);
    }

    .banner-remove {
      background: none;
      border: none;
      color: var(--accent);
      font-size: 1.25rem;
      cursor: pointer;
      line-height: 1;
      padding: 0 0.25rem;
    }

    /* Autocomplete dropdown */
    .prod-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.5rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      z-index: 10;
      max-height: 150px;
      overflow-y: auto;
    }

    .prod-dropdown-item {
      width: 100%;
      padding: 0.6rem 0.85rem;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
      color: var(--text-primary);
      transition: background 0.2s;
    }

    .prod-dropdown-item:hover { background: var(--surface-hover); }
    .prod-dropdown-item + .prod-dropdown-item { border-top: 1px solid var(--surface-border); }
    .prod-dropdown-name { font-size: 0.85rem; font-weight: 600; }
    .prod-dropdown-code { font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.1rem; }

    .btn-spinner {
      width: 14px;
      height: 14px;
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

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .kpi-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.85rem;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s;
    }

    .kpi-card:hover {
      border-color: var(--accent);
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .kpi-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .kpi-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-top: 0.25rem;
    }

    .kpi-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--accent-subtle);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class SalesPersonDetailsComponent implements OnInit {
  private salesPersonService = inject(SalesPersonService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  salesPerson!: SalesPerson;
  inventory = signal<SalesPersonInventory[]>([]);
  linkedCustomers = signal<Customer[]>([]);
  allCustomers = signal<Customer[]>([]);

  loading = signal(true);
  activeTab = signal('inventory');

  // Modals signals
  showLinkModal = signal(false);
  showAllocateModal = signal(false);
  showReturnModal = signal(false);

  // Link Customer modal state
  customerFilterTerm = '';
  selectedCustomerIds = new Set<number>();
  submittingLink = signal(false);

  // Allocate Stock modal state
  productSearchTerm = '';
  productResults = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);
  allocationQty = 1;
  submittingAlloc = signal(false);

  // Return Stock modal state
  selectedReturnProductId = 0;
  returnQty = 1;
  maxReturnQty = 0;
  submittingReturn = signal(false);

  private salesPersonId!: number;

  ngOnInit() {
    this.salesPersonId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDetails();
  }

  getTotalStock(): number {
    return this.inventory().reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  loadDetails() {
    this.loading.set(true);
    this.salesPersonService.getById(this.salesPersonId).subscribe({
      next: (data) => {
        this.salesPerson = data;
        this.loadInventory();
        this.loadCustomers();
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/sales-persons']);
      }
    });
  }

  loadInventory() {
    this.salesPersonService.getInventory(this.salesPersonId).subscribe({
      next: (data) => {
        this.inventory.set(data);
      }
    });
  }

  loadCustomers() {
    // Fetch all customers, then filter client-side since there's no salesperson search customer api
    this.customerService.getAll(0, 1000).subscribe({
      next: (response) => {
        this.allCustomers.set(response.content);
        const linked = response.content.filter(c => c.salesPersonId === this.salesPersonId);
        this.linkedCustomers.set(linked);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  goBack() {
    this.router.navigate(['/sales-persons']);
  }

  navigateToEdit() {
    this.router.navigate(['/sales-persons/edit', this.salesPersonId]);
  }

  navigateToCustomer(id: number) {
    this.router.navigate(['/customers/details', id]);
  }

  // --- MODAL 1: LINK CUSTOMERS ---
  openLinkModal() {
    this.customerFilterTerm = '';
    // Initialize checked states
    this.selectedCustomerIds.clear();
    this.linkedCustomers().forEach(c => {
      if (c.id) this.selectedCustomerIds.add(c.id);
    });
    this.showLinkModal.set(true);
  }

  filteredAllCustomers(): Customer[] {
    if (!this.customerFilterTerm.trim()) return this.allCustomers();
    const term = this.customerFilterTerm.toLowerCase();
    return this.allCustomers().filter(c => 
      c.name.toLowerCase().includes(term) || 
      (c.location && c.location.toLowerCase().includes(term))
    );
  }

  isSelectedCustomer(id: number): boolean {
    return this.selectedCustomerIds.has(id);
  }

  toggleCustomerSelect(id: number) {
    if (this.selectedCustomerIds.has(id)) {
      this.selectedCustomerIds.delete(id);
    } else {
      this.selectedCustomerIds.add(id);
    }
  }

  saveLinkedCustomers() {
    this.submittingLink.set(true);
    const ids = Array.from(this.selectedCustomerIds);
    this.salesPersonService.linkCustomers(this.salesPersonId, ids).subscribe({
      next: () => {
        this.submittingLink.set(false);
        this.showLinkModal.set(false);
        this.loadCustomers(); // Reload
      },
      error: () => {
        this.submittingLink.set(false);
      }
    });
  }

  // --- MODAL 2: ALLOCATE STOCK ---
  openAllocateModal() {
    this.productSearchTerm = '';
    this.productResults.set([]);
    this.selectedProduct.set(null);
    this.allocationQty = 1;
    this.showAllocateModal.set(true);
  }

  searchProducts(term: string) {
    this.productService.search(term || '').subscribe({
      next: (results) => this.productResults.set(results),
      error: () => this.productResults.set([])
    });
  }

  onInputFocus() {
    this.searchProducts(this.productSearchTerm);
  }

  selectProduct(product: Product) {
    this.selectedProduct.set(product);
    this.productResults.set([]);
    this.productSearchTerm = '';
  }

  submitAllocation() {
    const prod = this.selectedProduct();
    if (!prod || this.allocationQty <= 0) return;

    this.submittingAlloc.set(true);
    this.salesPersonService.allocateStock(this.salesPersonId, prod.id!, this.allocationQty).subscribe({
      next: () => {
        this.submittingAlloc.set(false);
        this.showAllocateModal.set(false);
        this.loadInventory(); // Reload
      },
      error: () => {
        this.submittingAlloc.set(false);
      }
    });
  }

  // --- MODAL 3: RETURN STOCK ---
  openReturnModal() {
    this.selectedReturnProductId = 0;
    this.returnQty = 1;
    this.maxReturnQty = 0;
    this.showReturnModal.set(true);
  }

  onReturnProductChange() {
    const pId = Number(this.selectedReturnProductId);
    const item = this.inventory().find(i => i.productId === pId);
    if (item) {
      this.maxReturnQty = item.quantity;
      this.returnQty = Math.min(1, item.quantity);
    } else {
      this.maxReturnQty = 0;
      this.returnQty = 0;
    }
  }

  submitReturn() {
    if (this.selectedReturnProductId === 0 || this.returnQty <= 0 || this.returnQty > this.maxReturnQty) return;

    this.submittingReturn.set(true);
    this.salesPersonService.returnStock(this.salesPersonId, this.selectedReturnProductId, this.returnQty).subscribe({
      next: () => {
        this.submittingReturn.set(false);
        this.showReturnModal.set(false);
        this.loadInventory(); // Reload
      },
      error: () => {
        this.submittingReturn.set(false);
      }
    });
  }
}
