import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { SalesPersonService } from '../../../services/sales-person.service';
import { DashboardService, OrderSummary } from '../../../services/dashboard.service';
import { Customer } from '../../../models/customer.model';
import { Order } from '../../../models/order.model';
import { Product } from '../../../models/product.model';
import { SalesPerson } from '../../../models/sales-person.model';
import { CustomerReturn } from '../../../models/customer-return.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="form-page">
      <div class="form-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="form-title">Customer Details</h1>
        <div class="menu-container">
            <button class="icon-btn" (click)="toggleMenu()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="5" r="1.5"/>
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>
            @if (showMenu()) {
              <div class="dropdown-menu">
                <button class="menu-item" (click)="navigateToEdit(); toggleMenu()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  Edit
                </button>
                <button class="menu-item text-danger" (click)="confirmDelete(); toggleMenu()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Delete
                </button>
              </div>
            }
          </div>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading customer...</p>
        </div>
      } @else {
        <!-- View-mode compact card -->
        <div class="view-card">
            <div class="view-avatar">{{ getInitials(customer.name) }}</div>
            <div class="view-info">
              <div class="view-name">{{ customer.name }}</div>
              <div class="view-rows">
                @if (customer.location) {
                  <div class="view-row">
                    <span class="view-lbl">Location</span>
                    <span class="view-val">{{ customer.location }}</span>
                  </div>
                }
                @if (customer.contact) {
                  <div class="view-row">
                    <span class="view-lbl">Contact</span>
                    <span class="view-val">{{ customer.contact }}</span>
                  </div>
                }
                @if (customer.phone) {
                  <div class="view-row">
                    <span class="view-lbl">Phone</span>
                    <span class="view-val">{{ customer.phone }}</span>
                  </div>
                }
                @if (customer.salesPersonNames && customer.salesPersonNames.length > 0) {
                  <div class="view-row" style="align-items: flex-start;">
                    <span class="view-lbl">Sales Partners</span>
                    <span class="view-val" style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                      @for (name of customer.salesPersonNames; track name) {
                        <span style="font-size: 0.72rem; font-weight: 700; background: var(--accent-subtle); color: var(--accent); padding: 0.1rem 0.45rem; border-radius: 0.3rem;">
                          {{ name }}
                        </span>
                      }
                    </span>
                  </div>
                } @else if (customer.salesPersonName) {
                  <div class="view-row">
                    <span class="view-lbl">Sales Partner</span>
                    <span class="view-val" style="font-weight: 600; color: var(--accent);">{{ customer.salesPersonName }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

        <!-- Orders Summary -->
        @if (!summaryLoading() && orderSummary().totalOrders > 0) {
          <div class="summary-strip">
            <div class="summary-item">
              <span class="summary-lbl">Orders</span>
              <span class="summary-val">{{ orderSummary().totalOrders }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item">
              <span class="summary-lbl">Revenue</span>
              <span class="summary-val">{{ orderSummary().totalPrice | currency:'INR':'₹':'1.0-0' }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item">
              <span class="summary-lbl">Collected</span>
              <span class="summary-val" [class.s-green]="orderSummary().totalCollected > 0" [class.s-muted]="orderSummary().totalCollected === 0">{{ orderSummary().totalCollected | currency:'INR':'₹':'1.0-0' }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item">
              <span class="summary-lbl">Balance</span>
              <span class="summary-val" [class.s-red]="orderSummary().totalBalance > 0" [class.s-muted]="orderSummary().totalBalance === 0">{{ orderSummary().totalBalance | currency:'INR':'₹':'1.0-0' }}</span>
            </div>
          </div>
        }

        <!-- Tabs switching -->
        <div class="tabs-container" style="display: flex; border-bottom: 2px solid var(--surface-border); margin: 1.5rem 0;">
          <button class="tab-btn" [class.active]="activeTab() === 'orders'" (click)="setTab('orders')">
            Orders
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'returns'" (click)="setTab('returns')">
            Returns Log
          </button>
        </div>

        @if (activeTab() === 'orders') {
          <div class="orders-section">
            <div class="orders-header">
              <div class="title-with-count">
                <h2 class="orders-title">Orders</h2>
                <span class="orders-count">{{ totalOrders() }}</span>
              </div>
              <button class="new-order-btn" (click)="createNewOrder()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Order
              </button>
            </div>

            @if (ordersLoading() && orders().length === 0) {
              <div class="orders-loading">
                <div class="loading-spinner-sm"></div>
              </div>
            } @else if (orders().length === 0) {
              <div class="orders-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <p>No orders yet</p>
              </div>
            } @else {
              <div class="orders-list">
                @for (order of orders(); track order.id) {
                  <div class="order-card" (click)="navigateToOrder(order.id!)">
                    <div class="card-header">
                      <div class="order-id">#{{ order.id }}</div>
                      <div class="items-count">{{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}</div>
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
              @if (hasMoreOrders()) {
                <div class="load-more-container">
                  <button class="load-more-btn" (click)="loadMoreOrders()" [disabled]="ordersLoading()">
                    @if (ordersLoading()) {
                      <div class="loading-spinner-sm" style="width: 14px; height: 14px; border-width: 2px;"></div> Loading...
                    } @else {
                      Load More
                    }
                  </button>
                </div>
              }
            }
          </div>
        }

        @if (activeTab() === 'returns') {
          <div class="returns-section" style="padding-bottom: 2rem;">
            <!-- Record Return Form Card -->
            <div class="record-return-card" style="background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 1rem; padding: 1.25rem; margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Record Product Return
              </h3>
              
              <form (ngSubmit)="submitReturn()" #returnForm="ngForm" style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div>
                    <label style="display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem;">Product</label>
                    <select style="width: 100%; padding: 0.6rem 0.85rem; background: var(--surface-ground); border: 1.5px solid var(--surface-border); border-radius: 0.5rem; color: var(--text-primary); font-family: inherit; font-size: 0.85rem;"
                            [(ngModel)]="newReturn().productId" name="productId" (change)="onProductChange()" required>
                      <option [value]="null" disabled selected>Select Product</option>
                      @for (p of products(); track p.id) {
                        <option [value]="p.id">{{ p.name }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label style="display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem;">Agent / Sales Person (Who Collected)</label>
                    <select style="width: 100%; padding: 0.6rem 0.85rem; background: var(--surface-ground); border: 1.5px solid var(--surface-border); border-radius: 0.5rem; color: var(--text-primary); font-family: inherit; font-size: 0.85rem;"
                            [(ngModel)]="newReturn().salesPersonId" name="salesPersonId" required>
                      <option [value]="null" disabled selected>Select Agent</option>
                      @for (sp of salesPersons(); track sp.id) {
                        <option [value]="sp.id">{{ sp.name }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                  <div>
                    <label style="display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem;">Quantity</label>
                    <input type="number" style="width: 100%; padding: 0.6rem 0.85rem; background: var(--surface-ground); border: 1.5px solid var(--surface-border); border-radius: 0.5rem; color: var(--text-primary); font-family: inherit; font-size: 0.85rem;"
                           [(ngModel)]="newReturn().quantity" name="quantity" min="0.01" step="any" placeholder="0.0" required>
                  </div>
                  <div>
                    <label style="display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem;">Return Rate (Per Unit)</label>
                    <input type="number" style="width: 100%; padding: 0.6rem 0.85rem; background: var(--surface-ground); border: 1.5px solid var(--surface-border); border-radius: 0.5rem; color: var(--text-primary); font-family: inherit; font-size: 0.85rem;"
                           [(ngModel)]="newReturn().unitPrice" name="unitPrice" min="0" step="any" placeholder="₹0.0" required>
                  </div>
                  <div>
                    <label style="display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem;">Total Value (Auto-Calc)</label>
                    <div style="padding: 0.6rem 0.85rem; background: rgba(16, 185, 129, 0.1); border: 1.5px solid #10b981; border-radius: 0.5rem; color: #10b981; font-weight: 800; font-size: 0.95rem; text-align: center;">
                      {{ (newReturn().quantity ?? 0) * (newReturn().unitPrice ?? 0) | currency:'INR':'₹':'1.0-0' }}
                    </div>
                  </div>
                </div>

                <div>
                  <label style="display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem;">Notes / Reason for Return</label>
                  <input type="text" style="width: 100%; padding: 0.6rem 0.85rem; background: var(--surface-ground); border: 1.5px solid var(--surface-border); border-radius: 0.5rem; color: var(--text-primary); font-family: inherit; font-size: 0.85rem;"
                         [(ngModel)]="newReturn().notes" name="notes" placeholder="e.g. Expired batch, packaging damage, etc.">
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
                  <button type="submit" [disabled]="!returnForm.form.valid || recordingReturn()" style="background: var(--accent-gradient); color: white; border: none; padding: 0.65rem 1.75rem; border-radius: 0.6rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;">
                    @if (recordingReturn()) {
                      <div class="loading-spinner-sm" style="width: 14px; height: 14px; border-width: 2px; border-color: white; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div> Saving...
                    } @else {
                      Submit Return
                    }
                  </button>
                </div>
              </form>
            </div>

            <!-- Returns History Feed -->
            <div class="returns-history" style="margin-top: 1.5rem;">
              <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.75rem;">Returns History</h4>
              
              @if (returnsLoading()) {
                <div style="display: flex; justify-content: center; padding: 2rem 0;">
                  <div class="loading-spinner-sm" style="width: 30px; height: 30px; border: 2.5px solid var(--surface-border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                </div>
              } @else if (returns().length === 0) {
                <div style="text-align: center; padding: 3rem 1rem; background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 1rem; color: var(--text-secondary);">
                  No product returns recorded for this customer.
                </div>
              } @else {
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  @for (item of returns(); track item.id) {
                    <div class="return-log-card" style="display: flex; justify-content: space-between; align-items: center; background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 1rem; padding: 1rem;">
                      <div style="display: flex; align-items: center; gap: 0.85rem;">
                        <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 1rem;">
                          🔄
                        </div>
                        <div>
                          <div style="font-weight: 700; color: var(--text-primary);">
                            {{ item.productName }}
                          </div>
                          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.1rem;">
                            Returned <strong style="color: var(--text-primary);">{{ item.quantity }}</strong> units @ {{ item.unitPrice | currency:'INR':'₹':'1.0-0' }}/unit
                          </div>
                          @if (item.notes) {
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; margin-top: 0.15rem;">"{{ item.notes }}"</div>
                          }
                          <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.3rem;">
                            Collected by {{ item.salesPersonName }} on {{ item.createdAt | date:'mediumDate' }} at {{ item.createdAt | date:'shortTime' }}
                          </div>
                        </div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-weight: 800; color: #ef4444; font-size: 1rem;">
                          -{{ item.returnAmount | currency:'INR':'₹':'1.0-0' }}
                        </div>
                        <div style="font-size: 0.65rem; background: var(--surface-ground); border: 1px solid var(--surface-border); padding: 0.15rem 0.4rem; border-radius: 0.4rem; color: var(--text-secondary); font-weight: 700; display: inline-block; margin-top: 0.25rem;">
                          CREDITED
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      }

      @if (showDeleteDialog()) {
        <app-confirm-dialog
          title="Delete Customer"
          [message]="'Are you sure you want to delete this customer? This action cannot be undone.'"
          (confirmed)="deleteCustomer()"
          (cancelled)="showDeleteDialog.set(false)"
        />
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

    .menu-container {
      position: relative;
    }

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

    .menu-item:hover {
      background: var(--surface-hover);
    }

    .text-danger {
      color: #ef4444;
    }

    .text-danger:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    .form-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    /* View mode compact card */
    .view-card {
      margin: 0.5rem 1rem 1rem;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.85rem;
      padding: 0.85rem;
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .view-avatar {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
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

    .view-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .view-rows { display: flex; flex-direction: column; gap: 0.3rem; }

    .view-row {
      display: flex;
      gap: 0.5rem;
      font-size: 0.75rem;
      line-height: 1.3;
    }

    .view-lbl {
      color: var(--text-secondary);
      font-weight: 600;
      min-width: 54px;
      flex-shrink: 0;
    }

    .view-val {
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .form-body { padding: 0.5rem 1rem 1rem; }

    .form-group { margin-bottom: 1rem; }

    .form-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.4rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-input {
      width: 100%;
      padding: 0.85rem 1rem;
      background: var(--surface-card);
      border: 1.5px solid var(--surface-border);
      border-radius: 0.75rem;
      font-size: 1rem;
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

    .form-value {
      padding: 0.85rem 1rem;
      background: var(--surface-card);
      border: 1.5px solid var(--surface-border);
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .btn-row {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .cancel-btn {
      flex: 1;
      padding: 1rem;
      background: var(--surface-card);
      color: var(--text-primary);
      border: 1.5px solid var(--surface-border);
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }

    .cancel-btn:hover { background: var(--surface-hover); }
    .cancel-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .submit-btn {
      flex: 1;
      padding: 1rem;
      background: var(--accent-gradient);
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
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

    /* Compact orders summary strip */
    .summary-strip {
      margin: 0 1rem 1rem;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      padding: 0.6rem 0;
    }

    .summary-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
    }

    .summary-lbl {
      font-size: 0.6rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .summary-val {
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .summary-val.s-green { color: var(--success); }
    .summary-val.s-red { color: var(--danger); }
    .summary-val.s-muted { color: var(--text-secondary); }

    .summary-divider {
      width: 1px;
      height: 28px;
      background: var(--surface-border);
      flex-shrink: 0;
    }

    /* Orders section */
    .orders-section {
      padding: 0 1rem 5rem;
    }

    .orders-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .title-with-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .new-order-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--surface-card);
      color: var(--accent);
      border: 1px solid var(--accent);
      padding: 0.4rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .new-order-btn:hover {
      background: var(--accent-subtle);
      transform: translateY(-1px);
    }

    .orders-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .orders-count {
      background: var(--accent-subtle);
      color: var(--accent);
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 1rem;
    }

    .orders-loading {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .loading-spinner-sm {
      width: 28px;
      height: 28px;
      border: 2.5px solid var(--surface-border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .orders-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem;
      color: var(--text-secondary);
      font-size: 0.85rem;
    }

    .orders-empty p { margin: 0; }

    .orders-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.75rem;
    }

    .order-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.85rem;
      padding: 0.85rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .order-card:hover {
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

    .load-more-container {
      text-align: center;
      margin-top: 1.5rem;
    }

    .load-more-btn {
      background: var(--surface-card);
      border: 1.5px solid var(--surface-border);
      color: var(--text-primary);
      padding: 0.6rem 1.25rem;
      border-radius: 0.75rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .load-more-btn:hover:not(:disabled) {
      background: var(--surface-hover);
      border-color: var(--accent);
      color: var(--accent);
    }

    .load-more-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
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

    @keyframes spin { to { transform: rotate(360deg); } }

    .tabs-container {
      border-color: var(--surface-border);
    }
    
    .tab-btn {
      padding: 0.75rem 1.25rem;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      color: var(--text-secondary);
      font-size: 0.9rem;
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

    .return-log-card {
      transition: all 0.2s ease;
    }

    .return-log-card:hover {
      transform: translateY(-1px);
      border-color: var(--accent-subtle) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    }
  `]
})
export class CustomerDetails implements OnInit {
  private customerService = inject(CustomerService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private salesPersonService = inject(SalesPersonService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  customer: Customer = { name: '', location: '', contact: '', phone: '' };

  // Tab & Returns State
  activeTab = signal<'orders' | 'returns'>('orders');
  returns = signal<CustomerReturn[]>([]);
  returnsLoading = signal(false);
  products = signal<Product[]>([]);
  salesPersons = signal<SalesPerson[]>([]);
  newReturn = signal<{ productId: number | null, salesPersonId: number | null, quantity: number | null, unitPrice: number | null, notes: string }>({
    productId: null,
    salesPersonId: null,
    quantity: null,
    unitPrice: null,
    notes: ''
  });
  recordingReturn = signal(false);

  orders = signal<Order[]>([]);
  totalOrders = signal(0);
  currentPage = signal(0);
  hasMoreOrders = signal(false);
  pageSize = 10;

  loading = signal(true);
  ordersLoading = signal(false);
  summaryLoading = signal(true);
  showMenu = signal(false);
  showDeleteDialog = signal(false);
  orderSummary = signal<OrderSummary>({
    totalOrders: 0,
    totalPrice: 0,
    totalCollected: 0,
    totalBalance: 0
  });
  private customerId!: number;


  ngOnInit() {
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));
    this.customerService.getById(this.customerId).subscribe({
      next: (data) => {
        this.customer = data;
        this.loading.set(false);
        this.loadOrders();
        this.loadOrderSummary();
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/customers']);
      }
    });
  }

  loadOrders(page: number = 0) {
    this.ordersLoading.set(true);
    this.orderService.getByCustomerId(this.customerId, page, this.pageSize).subscribe({
      next: (response) => {
        if (page === 0) {
          this.orders.set(response.content);
        } else {
          this.orders.update(curr => [...curr, ...response.content]);
        }
        this.totalOrders.set(response.page.totalElements);
        const isLastPage = response.page.number >= response.page.totalPages - 1;
        this.hasMoreOrders.set(!isLastPage);
        this.currentPage.set(response.page.number);
        this.ordersLoading.set(false);
      },
      error: () => {
        this.ordersLoading.set(false);
      }
    });
  }

  loadMoreOrders() {
    if (!this.ordersLoading() && this.hasMoreOrders()) {
      this.loadOrders(this.currentPage() + 1);
    }
  }

  loadOrderSummary() {
    this.summaryLoading.set(true);
    this.dashboardService.getOrdersSummaryByCustomer(this.customerId).subscribe({
      next: (res) => {
        this.orderSummary.set(res);
        this.summaryLoading.set(false);
      },
      error: () => {
        this.summaryLoading.set(false);
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  navigateToEdit() {
    this.router.navigate(['/customers/edit', this.customerId]);
  }

  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  confirmDelete() {
    this.showDeleteDialog.set(true);
  }

  deleteCustomer() {
    this.customerService.delete(this.customerId).subscribe({
      next: () => {
        this.showDeleteDialog.set(false);
        this.router.navigate(['/customers']);
      },
      error: () => {
        this.showDeleteDialog.set(false);
      }
    });
  }

  navigateToOrder(id: number) {
    this.router.navigate(['/orders/details', id], { queryParams: { customerId: this.customerId } });
  }

  createNewOrder() {
    this.router.navigate(['/orders/create'], { queryParams: { customerId: this.customerId } });
  }

  goBack() {
    this.router.navigate(['/customers']);
  }

  setTab(tab: 'orders' | 'returns') {
    this.activeTab.set(tab);
    if (tab === 'returns') {
      this.loadReturns();
      this.loadProducts();
      this.loadSalesPersons();
    }
  }

  loadReturns() {
    this.returnsLoading.set(true);
    this.customerService.getCustomerReturns(this.customerId).subscribe({
      next: (data) => {
        this.returns.set(data || []);
        this.returnsLoading.set(false);
      },
      error: () => {
        this.returnsLoading.set(false);
      }
    });
  }

  loadProducts() {
    this.productService.getAll(0, 100).subscribe({
      next: (res) => {
        this.products.set(res.content || []);
      }
    });
  }

  loadSalesPersons() {
    this.salesPersonService.getAll(0, 100).subscribe({
      next: (res) => {
        this.salesPersons.set(res.content || []);
      }
    });
  }

  onProductChange() {
    const selectedProdId = this.newReturn().productId;
    if (selectedProdId) {
      const prod = this.products().find(p => p.id === Number(selectedProdId));
      if (prod) {
        this.newReturn.update(current => ({
          ...current,
          unitPrice: prod.maxSalePrice || prod.maxRetailPrice || 0
        }));
      }
    }
  }

  submitReturn() {
    const form = this.newReturn();
    if (!form.productId || !form.salesPersonId || !form.quantity || form.quantity <= 0) {
      return;
    }

    this.recordingReturn.set(true);
    const returnData: CustomerReturn = {
      customerId: this.customerId,
      salesPersonId: Number(form.salesPersonId),
      productId: Number(form.productId),
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice ?? 0),
      notes: form.notes
    };

    this.customerService.recordReturn(returnData).subscribe({
      next: () => {
        this.recordingReturn.set(false);
        // Reset form
        this.newReturn.set({
          productId: null,
          salesPersonId: null,
          quantity: null,
          unitPrice: null,
          notes: ''
        });
        // Reload list and summary metrics
        this.loadReturns();
        this.loadOrderSummary();
        this.loadOrders(0);
      },
      error: () => {
        this.recordingReturn.set(false);
      }
    });
  }
}
