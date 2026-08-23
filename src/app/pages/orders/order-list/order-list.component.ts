import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { SalesPersonService } from '../../../services/sales-person.service';
import { Order } from '../../../models/order.model';
import { SalesPerson } from '../../../models/sales-person.model';
import { OrderPayment } from '../../../models/order-payment.model';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Orders</h1>
          <p class="page-subtitle">{{ totalElements() }} orders</p>
        </div>
        <button class="fab" (click)="navigateToCreate()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <div class="tabs-container" style="display: flex; border-bottom: 2px solid var(--surface-border); margin-bottom: 1.25rem;">
        <button class="tab-btn" [class.active]="activeTab() === 'orders'" (click)="setTab('orders')">
          Orders
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'payments'" (click)="setTab('payments')">
          Recent Payments
        </button>
      </div>

      <div class="filter-bar" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; align-items: center; justify-content: space-between;">
        <div style="display: flex; gap: 0.5rem; align-items: center; position: relative; flex-wrap: wrap;">
          @if (activeTab() === 'orders') {
            <button class="filter-chip" [class.active]="paymentDueFilter()" (click)="togglePaymentDueFilter()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
              Payment Due
              @if (paymentDueFilter()) {
                <span class="clear-filter" (click)="clearPaymentDueFilter($event)">&times;</span>
              }
            </button>

            <button class="filter-chip" [class.active]="directSaleFilter()" (click)="toggleDirectSaleFilter()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Direct Sales
              @if (directSaleFilter()) {
                <span class="clear-filter" (click)="clearDirectSaleFilter($event)">&times;</span>
              }
            </button>
          }

          <!-- Sales Person Multi-select Filter Dropdown -->
          <div class="filter-dropdown-container" style="position: relative; display: inline-block;">
            <button type="button" class="btn-filter" (click)="toggleFilterDropdown()" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.85rem; background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 2rem; color: var(--text-primary); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              <span>Agent</span>
              @if (selectedSalesPersonIds().length > 0) {
                <span class="badge" style="background: var(--accent); color: white; font-size: 0.65rem; font-weight: 700; padding: 0.05rem 0.3rem; border-radius: 0.35rem;">
                  {{ selectedSalesPersonIds().length }}
                </span>
              }
            </button>

            @if (showFilterDropdown()) {
              <div class="backdrop" (click)="showFilterDropdown.set(false)" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99; background: transparent;"></div>
              <div class="filter-dropdown-menu" style="position: absolute; left: 0; top: calc(100% + 0.5rem); z-index: 100; width: 200px; background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 0.75rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2); padding: 0.6rem; display: flex; flex-direction: column; gap: 0.4rem;">
                <div style="font-weight: 700; font-size: 0.75rem; color: var(--text-secondary); border-bottom: 1px solid var(--surface-border); padding-bottom: 0.3rem; display: flex; justify-content: space-between; align-items: center;">
                  <span>FILTER BY AGENT</span>
                  @if (selectedSalesPersonIds().length > 0) {
                    <button type="button" (click)="clearSalesPersonFilter()" style="background: none; border: none; color: var(--accent); font-size: 0.7rem; font-weight: 700; cursor: pointer; padding: 0;">Clear</button>
                  }
                </div>
                <div class="dropdown-list" style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.35rem;">
                  @for (sp of salesPersons(); track sp.id) {
                    <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--text-primary); cursor: pointer; padding: 0.2rem 0; user-select: none;">
                      <input type="checkbox" [checked]="isSalesPersonSelected(sp.id!)" (change)="toggleSalesPersonSelection(sp.id!)" style="accent-color: var(--accent); width: 14px; height: 14px;" />
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ sp.name }}</span>
                    </label>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Date Range Filter Pill Container -->
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.25rem;">
          <div class="date-range-pill" style="display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.85rem; background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 2rem; color: var(--text-primary); font-size: 0.8rem; font-weight: 500;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-secondary); flex-shrink: 0;">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input
              #startDateInput
              type="date"
              [ngModel]="startDate()"
              (ngModelChange)="onStartDateChange($event)"
              (click)="startDateInput.showPicker()"
              style="border: none; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 0.75rem; outline: none; cursor: pointer; padding: 0;"
              placeholder="Start Date"
            />
            <span style="color: var(--text-placeholder); font-size: 0.75rem; user-select: none;">to</span>
            <input
              #endDateInput
              type="date"
              [ngModel]="endDate()"
              (ngModelChange)="onEndDateChange($event)"
              (click)="endDateInput.showPicker()"
              style="border: none; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 0.75rem; outline: none; cursor: pointer; padding: 0;"
              placeholder="End Date"
            />
          </div>
          
          @if (startDate() || endDate() || selectedSalesPersonIds().length > 0 || (activeTab() === 'orders' && (paymentDueFilter() || directSaleFilter()))) {
            <button type="button" (click)="resetAllFilters()" style="background: none; border: none; color: var(--accent); font-weight: 700; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; margin-left: 0.25rem;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M2.5 2v6h6M21.5 22v-6h-6M22 11.5A10 10 0 003.2 7.2L2.5 8M2 12.5a10 10 0 0018.8 4.3l.7-.8"/>
              </svg>
              <span>Reset</span>
            </button>
          }
        </div>
      </div>

      @if (activeTab() === 'orders') {
        <!-- KPI Stats Summary Row -->
        <div class="kpi-row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <!-- Total Count Sold Card -->
        <div class="kpi-card" style="background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 0.85rem; padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; cursor: default;">
          <div>
            <div class="kpi-label" style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Total Count Sold</div>
            <div class="kpi-value" style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-top: 0.25rem;">
              {{ summaryData().totalCountSold }} <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">units</span>
            </div>
          </div>
          <div class="kpi-icon-wrapper" style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent-subtle); color: var(--accent); display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
        </div>

        <!-- Total Amount Collected Card -->
        <div class="kpi-card" style="background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 0.85rem; padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; cursor: default;">
          <div>
            <div class="kpi-label" style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Total Collected</div>
            <div class="kpi-value" style="font-size: 1.5rem; font-weight: 800; color: var(--success); margin-top: 0.25rem;">
              {{ summaryData().totalCollected | currency:'INR':'₹':'1.0-0' }}
            </div>
          </div>
          <div class="kpi-icon-wrapper" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(34, 197, 94, 0.1); color: #22c55e; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
        </div>

        <!-- Payment Due Card (Works as Filter Toggle) -->
        <div class="kpi-card" 
             (click)="togglePaymentDueFilter()" 
             [style.border-color]="paymentDueFilter() ? 'var(--danger)' : 'var(--surface-border)'"
             style="background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 0.85rem; padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; cursor: pointer; user-select: none;">
          <div>
            <div class="kpi-label" style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.25rem;">
              <span>Payment Due</span>
              @if (paymentDueFilter()) {
                <span style="background: var(--danger); color: white; font-size: 0.6rem; font-weight: 700; padding: 0.05rem 0.25rem; border-radius: 0.25rem;">ACTIVE FILTER</span>
              }
            </div>
            <div class="kpi-value" style="font-size: 1.5rem; font-weight: 800; color: var(--danger); margin-top: 0.25rem;">
              {{ summaryData().totalBalance | currency:'INR':'₹':'1.0-0' }}
            </div>
          </div>
          <div class="kpi-icon-wrapper" 
               [style.background]="paymentDueFilter() ? 'var(--danger)' : 'rgba(239, 68, 68, 0.1)'"
               [style.color]="paymentDueFilter() ? 'white' : 'var(--danger)'"
               style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
        </div>
      </div>

      @if (loading() && orders().length === 0) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <h3>No Orders Found</h3>
          <p>Adjust your filters or create a new order</p>
          <button class="btn-primary" (click)="navigateToCreate()">New Order</button>
        </div>
      } @else {
        <div class="grid">
          @for (order of orders(); track order.id) {
            <div class="card" (click)="navigateToView(order.id!)">
              <div class="card-header">
                <div class="order-id">
                  #{{ order.id }}
                  @if (order.isDirectSale) {
                    <span class="direct-badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 0.4rem; margin-left: 0.35rem; text-transform: uppercase;">Direct</span>
                  }
                </div>
                <div class="card-customer-name">{{ order.customerName || (order.isDirectSale ? 'Direct / Home Sale' : 'Customer #' + order.customerId) }}</div>
                <div class="items-count">{{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }} ({{ getTotalItemsQty(order) }} units)</div>
              </div>
              @if (order.orderDate) {
                <div class="card-date">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{{ order.orderDate | date:'mediumDate' }}</span>
                </div>
              }
              @if (order.salesPersonName) {
                <div class="card-sales-person" style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.35rem;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>SP: {{ order.salesPersonName }}</span>
                </div>
              }
              <div class="card-footer">
                <div class="amount-col">
                  <span class="amount-lbl">TOTAL</span>
                  <span class="amount-val total">{{ order.totalAmount || 0 | currency:'INR':'₹':'1.0-0' }}</span>
                </div>
                <div class="amount-col">
                  <span class="amount-lbl">COLLECTED</span>
                  <span class="amount-val" [class.collected]="order.amountCollected > 0" [class.balance-clear]="!order.amountCollected || order.amountCollected <= 0">{{ order.amountCollected || 0 | currency:'INR':'₹':'1.0-0' }}</span>
                </div>
                <div class="amount-col">
                  <span class="amount-lbl">BALANCE</span>
                  <span class="amount-val" [class.balance-due]="(order.amountBalance ?? 0) > 0" [class.balance-clear]="(order.amountBalance ?? 0) <= 0">
                    {{ (order.amountBalance ?? 0) | currency:'INR':'₹':'1.0-0' }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>

        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="btn-page" [disabled]="currentPage() === 0 || loading()" (click)="loadOrders(currentPage() - 1)">Previous</button>
            <span class="page-info">Page {{ currentPage() + 1 }} of {{ totalPages() }}</span>
            <button class="btn-page" [disabled]="currentPage() >= totalPages() - 1 || loading()" (click)="loadOrders(currentPage() + 1)">Next</button>
          </div>
        }
        }
      }

      @if (activeTab() === 'payments') {
        <!-- KPI Stats Summary Row for Payments -->
        <div class="kpi-row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <!-- Total Amount Collected Card -->
          <div class="kpi-card" style="background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 0.85rem; padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; cursor: default;">
            <div>
              <div class="kpi-label" style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Total Collected</div>
              <div class="kpi-value" style="font-size: 1.5rem; font-weight: 800; color: var(--success); margin-top: 0.25rem;">
                {{ paymentsSummaryData().totalCollected | currency:'INR':'₹':'1.0-0' }}
              </div>
            </div>
            <div class="kpi-icon-wrapper" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(34, 197, 94, 0.1); color: #22c55e; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
        </div>

        @if (paymentsLoading()) {
          <div class="loading-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1rem;">
            <div class="loading-spinner"></div>
            <p>Loading recent payments...</p>
          </div>
        } @else if (recentPayments().length === 0) {
          <div style="text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
            No recent payment transactions found.
          </div>
        } @else {
          <div class="payments-grid" style="display: flex; flex-direction: column; gap: 0.75rem;">
            @for (payment of recentPayments(); track $index) {
              <div class="payment-card-row" (click)="navigateToView(payment.orderGroupId!)" style="display: flex; justify-content: space-between; align-items: center; background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 1rem; padding: 1rem; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div class="payment-icon-wrapper" style="width: 44px; height: 44px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700;">
                    ₹
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                      <span style="font-weight: 700; color: var(--text-primary);">{{ payment.customerName }}</span>
                      <span style="font-size: 0.75rem; background: var(--surface-ground); border: 1px solid var(--surface-border); padding: 0.15rem 0.45rem; border-radius: 0.5rem; color: var(--text-muted); font-weight: 600;">
                        Order #{{ payment.orderGroupId }}
                      </span>
                    </div>
                    @if (payment.notes) {
                      <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.15rem;">{{ payment.notes }}</div>
                    }
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                      {{ payment.createdAt | date:'mediumDate' }} at {{ payment.createdAt | date:'shortTime' }}
                    </div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 800; color: #10b981; font-size: 1.1rem;">
                    +{{ payment.amount | currency:'INR':'₹':'1.0-0' }}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; margin-top: 0.15rem;">
                    {{ payment.paymentMode }}
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.85rem;
      border-radius: 2rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--surface-border);
      background: var(--surface-card);
      color: var(--text-secondary);
      font-family: inherit;
    }

    .filter-chip:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .filter-chip.active {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }

    .clear-filter {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      font-size: 14px;
      line-height: 1;
      margin-left: 2px;
      cursor: pointer;
    }

    .clear-filter:hover {
      background: rgba(255,255,255,0.5);
    }

    .btn-filter:hover {
      border-color: var(--accent) !important;
      color: var(--accent) !important;
    }

    .page-container {
      padding: 1rem;
      padding-bottom: 5rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }

    .page-subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0.25rem 0 0;
    }

    .fab {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: var(--accent-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      transition: all 0.3s ease;
    }

    .fab:hover {
      transform: scale(1.1);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.75rem;
    }

    .card {
      background: var(--surface-card);
      border-radius: 0.85rem;
      padding: 0.85rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid var(--surface-border);
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: var(--accent);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.5rem;
    }

    .order-id {
      background: var(--accent-subtle);
      color: var(--accent);
      padding: 0.15rem 0.45rem;
      border-radius: 2rem;
      font-size: 0.65rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .card-customer-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-primary);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-date {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.7rem;
      color: var(--text-secondary);
      margin-bottom: 0.6rem;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.6rem;
      border-top: 1px solid var(--surface-border);
    }

    .amount-col {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .amount-col:first-child { align-items: flex-start; }
    .amount-col:nth-child(2) { align-items: center; }
    .amount-col:last-child { align-items: flex-end; }

    .amount-lbl {
      font-size: 0.65rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .amount-val {
      font-size: 0.8rem;
      font-weight: 700;
    }

    .total {
      color: #3b82f6;
    }

    .collected {
      color: #22c55e;
    }

    .balance-due {
      color: #ef4444;
    }

    .balance-clear {
      color: var(--text-secondary);
    }

    .items-count {
      font-size: 0.7rem;
      color: var(--text-secondary);
      font-weight: 500;
      flex-shrink: 0;
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

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
      text-align: center;
      color: var(--text-secondary);
    }

    .empty-state svg {
      margin-bottom: 1.5rem;
      opacity: 0.4;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      color: var(--text-primary);
      margin: 0 0 0.5rem;
    }

    .empty-state p {
      margin: 0 0 1.5rem;
    }

    .btn-primary {
      background: var(--accent-gradient);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 0.75rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-page {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-page:hover:not(:disabled) {
      border-color: var(--accent);
      color: var(--accent);
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .tabs-container {
      border-color: var(--surface-border);
    }
    
    .tab-btn {
      padding: 0.85rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      color: var(--text-primary);
    }

    .tab-btn.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    .payment-card-row:hover {
      transform: translateY(-1px);
      border-color: var(--accent-subtle) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    }
  `]
})
export class OrderListComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private salesPersonService = inject(SalesPersonService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private ordersSubscription?: Subscription;
  private summarySubscription?: Subscription;

  orders = signal<Order[]>([]);
  salesPersons = signal<SalesPerson[]>([]);
  selectedSalesPersonIds = signal<number[]>([]);
  showFilterDropdown = signal(false);

  // Tab State
  activeTab = signal<'orders' | 'payments'>('orders');
  recentPayments = signal<OrderPayment[]>([]);
  paymentsLoading = signal(false);

  startDate = signal<string>('');
  endDate = signal<string>('');
  loading = signal(true);
  paymentDueFilter = signal(false);
  directSaleFilter = signal(false);
  summaryData = signal<{ totalCountSold: number, totalCollected: number, totalBalance: number }>({ totalCountSold: 0, totalCollected: 0, totalBalance: 0 });
  paymentsSummaryData = signal<{ totalCollected: number }>({ totalCollected: 0 });

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(25);

  paymentsCurrentPage = signal(0);
  paymentsTotalPages = signal(0);
  paymentsTotalElements = signal(0);
  paymentsPageSize = signal(25);

  ngOnInit() {
    const paymentDue = this.route.snapshot.queryParamMap.get('paymentDue');
    if (this.orderService.filterState) {
      const state = this.orderService.filterState;
      this.startDate.set(state.startDate);
      this.endDate.set(state.endDate);
      this.paymentDueFilter.set(state.paymentDueFilter);
      this.directSaleFilter.set(state.directSaleFilter);
      this.selectedSalesPersonIds.set(state.selectedSalesPersonIds);
      this.currentPage.set(state.currentPage);
    } else if (paymentDue === 'true') {
      this.paymentDueFilter.set(true);
    }
    this.loadSalesPersons();
    this.loadOrders(this.currentPage());
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
    if (this.summarySubscription) {
      this.summarySubscription.unsubscribe();
    }
  }

  loadSalesPersons() {
    this.salesPersonService.getAll(0, 100).subscribe({
      next: (data) => {
        this.salesPersons.set(data.content || []);
      }
    });
  }

  loadSummary() {
    if (this.summarySubscription) {
      this.summarySubscription.unsubscribe();
    }

    let startIso: string | undefined = undefined;
    if (this.startDate()) {
      startIso = `${this.startDate()}T00:00:00`;
    }

    let endIso: string | undefined = undefined;
    if (this.endDate()) {
      endIso = `${this.endDate()}T23:59:59`;
    }

    const isDirectSaleVal = this.directSaleFilter() ? true : undefined;

    this.summarySubscription = this.orderService.getFilteredSummary(
      this.paymentDueFilter(),
      isDirectSaleVal,
      this.selectedSalesPersonIds(),
      startIso,
      endIso
    ).subscribe({
      next: (data) => {
        this.summaryData.set({
          totalCountSold: data.totalCountSold || 0,
          totalCollected: data.totalCollected || 0,
          totalBalance: data.totalBalance || 0
        });
      },
      error: () => {
        this.summaryData.set({ totalCountSold: 0, totalCollected: 0, totalBalance: 0 });
      }
    });
  }

  loadOrders(page: number = 0) {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }

    this.loading.set(true);
    this.loadSummary();

    let startIso: string | undefined = undefined;
    if (this.startDate()) {
      startIso = `${this.startDate()}T00:00:00`;
    }

    let endIso: string | undefined = undefined;
    if (this.endDate()) {
      endIso = `${this.endDate()}T23:59:59`;
    }

    const isDirectSaleVal = this.directSaleFilter() ? true : undefined;

    // Persist current filters/page state in the service
    this.orderService.filterState = {
      startDate: this.startDate(),
      endDate: this.endDate(),
      paymentDueFilter: this.paymentDueFilter(),
      directSaleFilter: this.directSaleFilter(),
      selectedSalesPersonIds: this.selectedSalesPersonIds(),
      currentPage: page
    };

    this.ordersSubscription = this.orderService.getAll(
      page,
      this.pageSize(),
      this.paymentDueFilter(),
      isDirectSaleVal,
      this.selectedSalesPersonIds(),
      startIso,
      endIso
    ).subscribe({
      next: (data) => {
        this.orders.set(data.content);
        this.currentPage.set(data.page.number);
        this.totalPages.set(data.page.totalPages);
        this.totalElements.set(data.page.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  toggleFilterDropdown() {
    this.showFilterDropdown.update(show => !show);
  }

  loadActiveData(page: number = 0) {
    if (this.activeTab() === 'orders') {
      this.loadOrders(page);
    } else {
      this.loadRecentPayments(page);
    }
  }

  toggleSalesPersonSelection(id: number) {
    const current = [...this.selectedSalesPersonIds()];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    this.selectedSalesPersonIds.set(current);
    this.loadActiveData(0);
  }

  isSalesPersonSelected(id: number): boolean {
    return this.selectedSalesPersonIds().includes(id);
  }

  clearSalesPersonFilter() {
    this.selectedSalesPersonIds.set([]);
    this.loadActiveData(0);
  }

  onStartDateChange(val: string) {
    this.startDate.set(val);
    this.loadActiveData(0);
  }

  onEndDateChange(val: string) {
    this.endDate.set(val);
    this.loadActiveData(0);
  }

  resetAllFilters() {
    this.selectedSalesPersonIds.set([]);
    this.startDate.set('');
    this.endDate.set('');
    this.paymentDueFilter.set(false);
    this.directSaleFilter.set(false);
    this.currentPage.set(0);
    this.paymentsCurrentPage.set(0);
    this.orderService.filterState = undefined;
    this.loadActiveData(0);
  }

  togglePaymentDueFilter() {
    this.paymentDueFilter.set(!this.paymentDueFilter());
    this.loadActiveData(0);
  }

  clearPaymentDueFilter(event: Event) {
    event.stopPropagation();
    this.paymentDueFilter.set(false);
    this.loadActiveData(0);
  }

  toggleDirectSaleFilter() {
    this.directSaleFilter.set(!this.directSaleFilter());
    this.loadActiveData(0);
  }

  clearDirectSaleFilter(event: Event) {
    event.stopPropagation();
    this.directSaleFilter.set(false);
    this.loadActiveData(0);
  }

  navigateToCreate() {
    this.router.navigate(['/orders/create']);
  }

  navigateToView(id: number) {
    this.router.navigate(['/orders/details', id]);
  }

  getTotalItemsQty(order: Order): number {
    return (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  setTab(tab: 'orders' | 'payments') {
    this.activeTab.set(tab);
    if (tab === 'payments') {
      this.loadRecentPayments(this.paymentsCurrentPage());
    } else {
      this.loadOrders(this.currentPage());
    }
  }

  loadPaymentsSummary() {
    let startIso: string | undefined = undefined;
    if (this.startDate()) {
      startIso = `${this.startDate()}T00:00:00`;
    }

    let endIso: string | undefined = undefined;
    if (this.endDate()) {
      endIso = `${this.endDate()}T23:59:59`;
    }

    this.orderService.getRecentPaymentsSummary(
      this.selectedSalesPersonIds(),
      startIso,
      endIso
    ).subscribe({
      next: (data) => {
        this.paymentsSummaryData.set({
          totalCollected: data.totalCollected || 0
        });
      },
      error: () => {
        this.paymentsSummaryData.set({ totalCollected: 0 });
      }
    });
  }

  loadRecentPayments(page: number = 0) {
    this.paymentsLoading.set(true);
    this.loadPaymentsSummary();
    let startIso: string | undefined = undefined;
    if (this.startDate()) {
      startIso = `${this.startDate()}T00:00:00`;
    }

    let endIso: string | undefined = undefined;
    if (this.endDate()) {
      endIso = `${this.endDate()}T23:59:59`;
    }

    this.orderService.getRecentPayments(
      page,
      this.paymentsPageSize(),
      this.selectedSalesPersonIds(),
      startIso,
      endIso
    ).subscribe({
      next: (res) => {
        this.recentPayments.set(res.content || []);
        this.paymentsCurrentPage.set(res.page.number);
        this.paymentsTotalPages.set(res.page.totalPages);
        this.paymentsTotalElements.set(res.page.totalElements);
        this.paymentsLoading.set(false);
      },
      error: () => {
        this.paymentsLoading.set(false);
      }
    });
  }
}
