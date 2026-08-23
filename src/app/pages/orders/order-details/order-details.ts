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

import { OrderPayment } from '../../../models/order-payment.model';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ConfirmDialogComponent, PrintInvoiceComponent, FormsModule],
  template: `
    <div class="form-page">
      <div class="form-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="form-title">Order #{{ orderId }}</h1>
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
                <button class="menu-item" (click)="openPrintDialog(); toggleMenu()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"/>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  Print
                </button>
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
          <p>Loading order...</p>
        </div>
      } @else {
        <!-- View Mode -->
        <div class="view-body">
            <div class="view-info-grid">
              @if (isDirectSale()) {
                <div class="view-card" style="background: rgba(168, 85, 247, 0.1); border: 1.5px solid rgba(168, 85, 247, 0.25);">
                  <div class="view-avatar" style="background: #a855f7; color: white;">DS</div>
                  <div class="view-info">
                    <div class="view-name" style="color: #a855f7; font-weight: 700;">Direct Sale / Home Sale</div>
                    <div class="view-detail">No customer link or stock custody tracking required.</div>
                  </div>
                </div>
              } @else if (selectedCustomer()) {
                <div class="view-card view-card--clickable" (click)="navigateToCustomer()">
                  <div class="view-avatar">{{ getInitials(selectedCustomer()!.name) }}</div>
                  <div class="view-info">
                    <div class="view-name">{{ selectedCustomer()!.name }}</div>
                    <div class="view-detail">{{ selectedCustomer()!.location }} · {{ selectedCustomer()!.phone }}</div>
                  </div>
                  <svg class="view-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              }
              <div class="view-card">
                <div class="view-avatar" style="background: var(--surface-border); color: var(--text-primary)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div class="view-info">
                  <div class="view-name">Order Date</div>
                  <div class="view-detail">{{ currentOrderDate | date:'mediumDate' }}</div>
                </div>
              </div>
              @if (salesPersonName()) {
                <div class="view-card">
                  <div class="view-avatar" style="background: var(--surface-border); color: var(--text-primary)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div class="view-info">
                    <div class="view-name">Sales Representative</div>
                    <div class="view-detail">{{ salesPersonName() }}</div>
                  </div>
                </div>
              }
            </div>

            <div class="view-section">
              <h2 class="view-section-title">Items ({{ orderItems().length }})</h2>
              <div class="view-items">
                @for (item of orderItems(); track $index) {
                  <div class="view-item">
                    <div class="view-item-main">
                      <span class="view-item-name">{{ item.productName || 'Unknown Product' }}</span>
                      <span class="view-item-qty">x{{ item.quantity }}</span>
                    </div>
                    <div class="view-item-price">{{ (item.quantity * item.unitPrice) | currency:'INR':'₹':'1.0-0' }}</div>
                  </div>
                }
              </div>
            </div>

            <div class="view-section">
              <h2 class="view-section-title">Payment Summary</h2>
              <div class="view-payment-card">
                <div class="amount-col">
                  <span class="amount-lbl">TOTAL</span>
                  <span class="amount-val total">{{ calculatedTotal() | currency:'INR':'₹':'1.0-0' }}</span>
                </div>
                <div class="amount-col">
                  <span class="amount-lbl">DISCOUNT</span>
                  <span class="amount-val discount">{{ discount | currency:'INR':'₹':'1.0-0' }}</span>
                </div>
                <div class="amount-col">
                  <span class="amount-lbl">COLLECTED</span>
                  <span class="amount-val" [class.collected]="amountCollected > 0" [class.balance-clear]="!amountCollected || amountCollected <= 0">{{ amountCollected || 0 | currency:'INR':'₹':'1.0-0' }}</span>
                </div>
                <div class="amount-col">
                  <span class="amount-lbl">BALANCE</span>
                  <span class="amount-val" [class.balance-due]="amountBalance > 0" [class.balance-clear]="amountBalance <= 0">
                    {{ amountBalance | currency:'INR':'₹':'1.0-0' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="view-section">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                <h2 class="view-section-title" style="margin-bottom: 0;">Payment History ({{ orderPayments().length }})</h2>
                @if (amountBalance > 0) {
                  <button class="add-payment-btn" (click)="togglePaymentForm()">
                    {{ showPaymentForm() ? 'Cancel' : '+ Record Payment' }}
                  </button>
                }
              </div>

              @if (showPaymentForm()) {
                <div class="payment-form-card">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                    <div>
                      <label class="form-label">Payment Amount (Max ₹{{ amountBalance }})</label>
                      <input type="number" class="form-input" [(ngModel)]="paymentAmount" name="paymentAmount" min="1" [max]="amountBalance">
                    </div>
                    <div>
                      <label class="form-label">Payment Mode</label>
                      <select class="form-input" [(ngModel)]="paymentMode" name="paymentMode">
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI / Transfer</option>
                        <option value="CARD">Card</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="CHEQUE">Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label class="form-label">Payment Date</label>
                      <input type="date" class="form-input" [(ngModel)]="paymentDate" name="paymentDate">
                    </div>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                    <div>
                      <label class="form-label">Reference Number (Optional)</label>
                      <input type="text" class="form-input" placeholder="e.g. Transaction ID" [(ngModel)]="paymentReference" name="paymentReference">
                    </div>
                    <div>
                      <label class="form-label">Notes (Optional)</label>
                      <input type="text" class="form-input" placeholder="Payment details..." [(ngModel)]="paymentNotes" name="paymentNotes">
                    </div>
                  </div>
                  <button class="submit-btn" [disabled]="submittingPayment() || paymentAmount <= 0 || paymentAmount > amountBalance" (click)="submitPayment()">
                    @if (submittingPayment()) {
                      <div class="btn-spinner"></div>
                    } @else {
                      Record Payment
                    }
                  </button>
                </div>
              }

              @if (orderPayments().length === 0) {
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary); background: var(--surface-card); border-radius: 1rem; border: 1px solid var(--surface-border);">
                  No payment transactions recorded yet.
                </div>
              } @else {
                <div class="payment-history-list">
                  @for (payment of orderPayments(); track payment.id) {
                    <div class="payment-history-item">
                      <div class="payment-item-dot" [class.initial]="payment.notes?.toLowerCase()?.includes('initial')"></div>
                      
                      @if (editingPaymentId() === payment.id) {
                        <!-- Inline Edit Form -->
                        <div class="payment-item-content" style="border: 1.5px solid var(--accent); border-radius: 0.8rem; padding: 0.85rem; background: var(--surface-ground); margin-bottom: 0.5rem; width: 100%;">
                          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem;">
                            <div>
                              <label class="form-label" style="font-size: 0.75rem; margin-bottom: 0.25rem;">Amount (Max ₹{{ getMaxAllowedForPayment(payment.id!) }})</label>
                              <input type="number" class="form-input" [(ngModel)]="editPaymentAmount" name="editPaymentAmount" style="padding: 0.45rem 0.65rem; font-size: 0.8rem;">
                            </div>
                            <div>
                              <label class="form-label" style="font-size: 0.75rem; margin-bottom: 0.25rem;">Mode</label>
                              <select class="form-input" [(ngModel)]="editPaymentMode" name="editPaymentMode" style="padding: 0.45rem 0.65rem; font-size: 0.8rem; height: auto;">
                                <option value="CASH">Cash</option>
                                <option value="UPI">UPI / Transfer</option>
                                <option value="CARD">Card</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="CHEQUE">Cheque</option>
                              </select>
                            </div>
                            <div>
                              <label class="form-label" style="font-size: 0.75rem; margin-bottom: 0.25rem;">Date</label>
                              <input type="date" class="form-input" [(ngModel)]="editPaymentDate" name="editPaymentDate" style="padding: 0.45rem 0.65rem; font-size: 0.8rem; height: auto;">
                            </div>
                          </div>
                          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem;">
                            <div>
                              <label class="form-label" style="font-size: 0.75rem; margin-bottom: 0.25rem;">Reference</label>
                              <input type="text" class="form-input" [(ngModel)]="editPaymentReference" name="editPaymentReference" style="padding: 0.45rem 0.65rem; font-size: 0.8rem;">
                            </div>
                            <div>
                              <label class="form-label" style="font-size: 0.75rem; margin-bottom: 0.25rem;">Notes</label>
                              <input type="text" class="form-input" [(ngModel)]="editPaymentNotes" name="editPaymentNotes" style="padding: 0.45rem 0.65rem; font-size: 0.8rem;">
                            </div>
                          </div>
                          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; align-items: center; margin-top: 0.5rem;">
                            <button class="btn-cancel" (click)="cancelEditPayment()" style="padding: 0.35rem 0.85rem; font-size: 0.75rem; border-radius: 0.4rem; cursor: pointer;">Cancel</button>
                            <button class="btn-primary-sm" (click)="saveEditPayment(payment.id!)" [disabled]="submittingPayment() || editPaymentAmount <= 0 || editPaymentAmount > getMaxAllowedForPayment(payment.id!)" style="padding: 0.35rem 0.85rem; font-size: 0.75rem; border-radius: 0.4rem; cursor: pointer;">
                              Save
                            </button>
                          </div>
                        </div>
                      } @else {
                        <!-- Regular View -->
                        <div class="payment-item-content">
                          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                              <span class="payment-item-mode">{{ payment.paymentMode }}</span>
                              @if (payment.referenceNumber) {
                                <span class="payment-item-ref"> (Ref: {{ payment.referenceNumber }})</span>
                              }
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                              <span class="payment-item-amount">{{ payment.amount | currency:'INR':'₹':'1.0-0' }}</span>
                              @if (payment.paymentMode !== 'RETURN_CREDIT') {
                                <div class="payment-actions" style="display: flex; gap: 0.45rem; align-items: center;">
                                  <button (click)="startEditPayment(payment)" title="Edit Payment" style="background: none; border: none; padding: 0.2rem; cursor: pointer; font-size: 0.9rem; filter: grayscale(1); transition: all 0.2s;">
                                    ✏️
                                  </button>
                                  <button (click)="confirmDeletePayment(payment.id!)" title="Delete Payment" style="background: none; border: none; padding: 0.2rem; cursor: pointer; font-size: 0.9rem; filter: grayscale(1); transition: all 0.2s;">
                                    🗑️
                                  </button>
                                </div>
                              }
                            </div>
                          </div>
                          @if (payment.notes) {
                            <div class="payment-item-notes">{{ payment.notes }}</div>
                          }
                          <div class="payment-item-date">{{ payment.createdAt | date:'mediumDate' }} at {{ payment.createdAt | date:'shortTime' }}</div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>

        @if (showDeleteDialog()) {
          <app-confirm-dialog
            title="Delete Order"
            [message]="'Are you sure you want to delete this order? This action cannot be undone.'"
            (confirmed)="deleteOrder()"
            (cancelled)="showDeleteDialog.set(false)"
          />
        }

        @if (showPrintDialog() && selectedCustomer()) {
          <app-print-invoice
            [orderId]="orderId"
            [date]="currentOrderDate"
            [customerName]="selectedCustomer()!.name"
            [customerLocation]="selectedCustomer()!.location"
            [customerPhone]="selectedCustomer()!.phone"
            [items]="orderItems()"
            [totalAmount]="calculatedTotal()"
            [discount]="discount"
            [amountCollected]="amountCollected"
            (close)="showPrintDialog.set(false)"
          />
        }
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

    .view-card--clickable {
      cursor: pointer;
      transition: all 0.2s;
    }
    .view-card--clickable:hover {
      border-color: var(--accent);
      background: var(--accent-subtle);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.12);
    }
    .view-card--clickable:hover .view-name { color: var(--accent); }
    .view-card-arrow {
      color: var(--text-secondary);
      flex-shrink: 0;
      transition: transform 0.2s, color 0.2s;
    }
    .view-card--clickable:hover .view-card-arrow {
      color: var(--accent);
      transform: translateX(3px);
    }
    
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
    .amount-col:nth-child(3) { align-items: center; }
    .amount-col:last-child { align-items: flex-end; }
    .amount-lbl { font-size: 0.65rem; color: var(--text-secondary); font-weight: 500; }
    .amount-val { font-size: 0.85rem; font-weight: 700; }
    .total { color: #3b82f6; }
    .discount { color: #3b82f6; }
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

    .add-payment-btn {
      padding: 0.5rem 1rem;
      background: var(--accent-subtle);
      border: 1.5px solid var(--accent);
      color: var(--accent);
      border-radius: 0.5rem;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }

    .add-payment-btn:hover {
      background: var(--accent);
      color: white;
    }

    .payment-form-card {
      background: var(--surface-card);
      border: 1.5px solid var(--accent-subtle);
      border-radius: 1rem;
      padding: 1.25rem;
      margin-bottom: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .payment-history-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: relative;
      padding-left: 1rem;
    }

    .payment-history-list::before {
      content: '';
      position: absolute;
      left: 3.5px;
      top: 10px;
      bottom: 10px;
      width: 2px;
      background: var(--surface-border);
    }

    .payment-history-item {
      display: flex;
      gap: 1rem;
      position: relative;
    }

    .payment-item-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--accent);
      border: 2px solid var(--surface-ground);
      position: absolute;
      left: -17px;
      top: 6px;
      z-index: 1;
    }

    .payment-item-dot.initial {
      background: #10b981;
    }

    .payment-item-content {
      flex: 1;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.75rem;
      padding: 0.85rem;
    }

    .payment-item-mode {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 0.9rem;
    }

    .payment-item-ref {
      color: var(--text-secondary);
      font-size: 0.8rem;
    }

    .payment-item-amount {
      font-weight: 700;
      color: var(--accent);
      font-size: 0.95rem;
    }

    .payment-item-notes {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .payment-item-date {
      color: var(--text-muted);
      font-size: 0.75rem;
      margin-top: 0.35rem;
    }
  `]
})
export class OrderDetails implements OnInit {
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  orderId!: number;
  loading = signal(true);
  showMenu = signal(false);
  showDeleteDialog = signal(false);
  showPrintDialog = signal(false);
  currentOrderDate: Date | string | null = null;

  selectedCustomer = signal<Customer | null>(null);
  salesPersonName = signal('');
  isDirectSale = signal<boolean>(false);

  // Order
  orderItems = signal<OrderItem[]>([]);
  amountCollected = 0;
  amountBalance = 0;
  discount = 0;
  calculatedTotal = signal(0);

  // Payments
  orderPayments = signal<OrderPayment[]>([]);
  showPaymentForm = signal(false);
  submittingPayment = signal(false);
  
  // Payment Form Fields
  paymentAmount = 0;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' = 'CASH';
  paymentReference = '';
  paymentNotes = '';
  paymentDate = '';

  // Edit Payment State
  editingPaymentId = signal<number | null>(null);
  editPaymentAmount = 0;
  editPaymentMode: OrderPayment['paymentMode'] = 'CASH';
  editPaymentReference = '';
  editPaymentNotes = '';
  editPaymentDate = '';

  ngOnInit() {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrderData();
  }

  loadOrderData() {
    this.orderService.getById(this.orderId).subscribe({
      next: (order) => {
        this.amountCollected = order.amountCollected;
        this.discount = order.discount || 0;
        this.amountBalance = order.amountBalance ?? 0;
        this.salesPersonName.set(order.salesPersonName || '');
        this.isDirectSale.set(!!order.isDirectSale);

        const d = order.orderDate ? new Date(order.orderDate) : new Date();
        this.currentOrderDate = d;

        this.orderItems.set(order.items || []);
        this.orderPayments.set(order.payments || []);
        this.calculateTotal();

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

  calculateTotal() {
    const total = this.orderItems().reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    this.calculatedTotal.set(total);
  }

  goBack() {
    const customerId = this.route.snapshot.queryParamMap.get('customerId');
    if (customerId) {
      this.router.navigate(['/customers/details', customerId]);
    } else {
      this.router.navigate(['/orders']);
    }
  }

  // View methods
  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  openPrintDialog() {
    this.showPrintDialog.set(true);
  }

  navigateToEdit() {
    this.router.navigate(['/orders/edit', this.orderId]);
  }

  navigateToCustomer() {
    const customer = this.selectedCustomer();
    if (customer?.id) {
      this.router.navigate(['/customers/details', customer.id]);
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  confirmDelete() {
    this.showDeleteDialog.set(true);
  }

  deleteOrder() {
    this.orderService.delete(this.orderId).subscribe({
      next: () => {
        this.showDeleteDialog.set(false);
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.showDeleteDialog.set(false);
      }
    });
  }

  togglePaymentForm() {
    this.showPaymentForm.update(v => !v);
    if (this.showPaymentForm()) {
      this.paymentAmount = this.amountBalance;
      this.paymentMode = 'CASH';
      this.paymentReference = '';
      this.paymentNotes = '';
      const d = new Date();
      this.paymentDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  }

  submitPayment() {
    if (this.paymentAmount <= 0 || this.paymentAmount > this.amountBalance) {
      return;
    }

    this.submittingPayment.set(true);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newPayment: OrderPayment = {
      amount: this.paymentAmount,
      paymentMode: this.paymentMode,
      referenceNumber: this.paymentReference || undefined,
      notes: this.paymentNotes || undefined,
      createdAt: this.paymentDate ? `${this.paymentDate}T${timeStr}` : undefined
    };

    this.orderService.addPayment(this.orderId, newPayment).subscribe({
      next: (updatedOrder) => {
        this.submittingPayment.set(false);
        this.showPaymentForm.set(false);
        // Refresh details with the newly updated order from response
        this.amountCollected = updatedOrder.amountCollected;
        this.amountBalance = updatedOrder.amountBalance ?? 0;
        this.orderPayments.set(updatedOrder.payments || []);
      },
      error: () => {
        this.submittingPayment.set(false);
      }
    });
  }

  getMaxAllowedForPayment(paymentId: number): number {
    const totalOrderAmount = this.calculatedTotal() - this.discount;
    const otherPaymentsSum = this.orderPayments()
      .filter(p => p.id !== paymentId)
      .reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, totalOrderAmount - otherPaymentsSum);
  }

  startEditPayment(payment: OrderPayment) {
    if (payment.id) {
      this.editingPaymentId.set(payment.id);
      this.editPaymentAmount = payment.amount;
      this.editPaymentMode = payment.paymentMode;
      this.editPaymentReference = payment.referenceNumber || '';
      this.editPaymentNotes = payment.notes || '';
      if (payment.createdAt && payment.createdAt.length >= 10) {
        this.editPaymentDate = payment.createdAt.substring(0, 10);
      } else {
        const d = new Date();
        this.editPaymentDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
    }
  }

  cancelEditPayment() {
    this.editingPaymentId.set(null);
  }

  saveEditPayment(paymentId: number) {
    const maxAllowed = this.getMaxAllowedForPayment(paymentId);
    if (this.editPaymentAmount <= 0 || this.editPaymentAmount > maxAllowed) {
      return;
    }

    this.submittingPayment.set(true);
    
    const originalPayment = this.orderPayments().find(p => p.id === paymentId);
    let timeStr = '12:00:00';
    if (originalPayment && originalPayment.createdAt && originalPayment.createdAt.includes('T')) {
      timeStr = originalPayment.createdAt.split('T')[1];
    } else {
      timeStr = new Date().toTimeString().split(' ')[0];
    }

    const updatedPayment: OrderPayment = {
      id: paymentId,
      amount: this.editPaymentAmount,
      paymentMode: this.editPaymentMode,
      referenceNumber: this.editPaymentReference || undefined,
      notes: this.editPaymentNotes || undefined,
      createdAt: this.editPaymentDate ? `${this.editPaymentDate}T${timeStr}` : undefined
    };

    this.orderService.updatePayment(paymentId, updatedPayment).subscribe({
      next: (updatedOrder) => {
        this.submittingPayment.set(false);
        this.editingPaymentId.set(null);
        this.amountCollected = updatedOrder.amountCollected;
        this.amountBalance = updatedOrder.amountBalance ?? 0;
        this.orderPayments.set(updatedOrder.payments || []);
      },
      error: () => {
        this.submittingPayment.set(false);
      }
    });
  }

  confirmDeletePayment(paymentId: number) {
    const ok = window.confirm("Are you sure you want to delete this payment record? This will adjust the order balance.");
    if (!ok) return;

    this.orderService.deletePayment(paymentId).subscribe({
      next: (updatedOrder) => {
        this.amountCollected = updatedOrder.amountCollected;
        this.amountBalance = updatedOrder.amountBalance ?? 0;
        this.orderPayments.set(updatedOrder.payments || []);
      }
    });
  }
}
