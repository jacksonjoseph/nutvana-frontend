import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { DashboardService, OrderSummary, ExpenseSummary, StockValuation } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Overview at a glance</p>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      } @else {
        <!-- Top Stats: Products & Customers -->
        <div class="stats-row">
          <div class="stat-card" (click)="navigateTo('/products')">
            <div class="stat-icon products-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ productsCount() }}</span>
              <span class="stat-label">Products</span>
            </div>
            <svg class="stat-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div class="stat-card" (click)="navigateTo('/customers')">
            <div class="stat-icon customers-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ customersCount() }}</span>
              <span class="stat-label">Customers</span>
            </div>
            <svg class="stat-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        <!-- Orders Summary -->
        <div class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span>Orders Summary</span>
        </div>

        <div class="orders-grid">
          <div class="order-card total-orders" (click)="navigateTo('/orders')">
            <span class="order-label">Total Orders</span>
            <span class="order-value">{{ orderSummary().totalOrders }}</span>
          </div>

          <div class="order-card total-price">
            <span class="order-label">Total Revenue</span>
            <span class="order-value money">{{ orderSummary().totalPrice | currency:'INR':'₹':'1.0-0' }}</span>
          </div>

          <div class="order-card total-collected">
            <span class="order-label">Collected</span>
            <span class="order-value money" [class.success]="orderSummary().totalCollected > 0" [class.muted]="orderSummary().totalCollected === 0">{{ orderSummary().totalCollected | currency:'INR':'₹':'1.0-0' }}</span>
          </div>

          <div class="order-card total-balance" (click)="navigateToBalanceDue()" style="cursor: pointer;">
            <span class="order-label">Balance</span>
            <span class="order-value money" [class.danger]="orderSummary().totalBalance > 0" [class.muted]="orderSummary().totalBalance === 0">{{ orderSummary().totalBalance | currency:'INR':'₹':'1.0-0' }}</span>
          </div>
        </div>

        <!-- Side-by-Side: Expenses & Stock Valuation -->
        <div class="orders-grid" style="margin-top: 2rem;">
          <div class="section-container">
            <div class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span>Expense Summary</span>
            </div>
            <div class="order-card" (click)="navigateTo('/expenses')" style="cursor: pointer;">
              <span class="order-label">Total Expenses</span>
              <span class="order-value money danger">{{ totalExpense() | currency:'INR':'₹':'1.0-0' }}</span>
            </div>
          </div>

          <div class="section-container">
            <div class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              <span>Stock Valuation</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div class="order-card">
                <span class="order-label">Warehouse Stock Value</span>
                <span class="order-value money success">{{ stockValuation().totalStockValue | currency:'INR':'₹':'1.0-0' }}</span>
              </div>
              <div class="order-card">
                <span class="order-label">Sales Person Stock Value</span>
                <span class="order-value money" style="color: #3b82f6;">{{ stockValuation().totalSalesPersonStockValue | currency:'INR':'₹':'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-container { padding: 1rem; padding-bottom: 2rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .page-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin: 0.25rem 0 0; }
    .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.75rem; animation: fadeInUp 0.4s ease both; }
    .stat-card { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 1rem; padding: 1.25rem 1rem; display: flex; flex-direction: column; align-items: flex-start; gap: 0.75rem; cursor: pointer; transition: all 0.25s ease; position: relative; overflow: hidden; }
    .stat-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); }
    .stat-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 1rem 1rem 0 0; }
    .stat-card:first-child::after { background: var(--accent-gradient); }
    .stat-card:last-child::after { background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%); }
    .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .products-icon { background: var(--accent-subtle); color: var(--accent-light); }
    .customers-icon { background: var(--success-subtle); color: var(--success); }
    .stat-info { display: flex; flex-direction: column; gap: 2px; }
    .stat-value { font-size: 2rem; font-weight: 800; color: var(--text-primary); letter-spacing: -1px; line-height: 1; }
    .stat-label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-arrow { position: absolute; right: 1rem; bottom: 1.25rem; color: var(--text-secondary); opacity: 0.4; transition: all 0.25s ease; }
    .stat-card:hover .stat-arrow { opacity: 1; color: var(--accent); transform: translateX(3px); }
    .section-title { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem; }
    .section-title svg { color: var(--accent-light); }
    .orders-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; animation: fadeInUp 0.4s ease 0.1s both; }
    .order-card { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; transition: all 0.25s ease; height: 100%; }
    .order-label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    .order-value { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; line-height: 1; }
    .order-value.money { font-size: 1.35rem; }
    .order-value.success { color: var(--success); }
    .order-value.danger { color: var(--danger); }
    .order-value.muted { color: var(--text-secondary); }
    .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1rem; color: var(--text-secondary); }
    .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--surface-border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  loading = signal(true);
  productsCount = signal(0);
  customersCount = signal(0);
  orderSummary = signal<OrderSummary>({
    totalOrders: 0,
    totalPrice: 0,
    totalCollected: 0,
    totalBalance: 0
  });
  totalExpense = signal(0);
  stockValuation = signal<StockValuation>({ totalStockValue: 0, totalSalesPersonStockValue: 0 });

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    let completed = 0;
    const totalRequests = 5;
    const checkDone = () => {
      completed++;
      if (completed === totalRequests) {
        this.loading.set(false);
      }
    };

    this.dashboardService.getProductsCount().subscribe({
      next: (res) => { this.productsCount.set(res.totalCount); checkDone(); },
      error: () => checkDone()
    });

    this.dashboardService.getCustomersCount().subscribe({
      next: (res) => { this.customersCount.set(res.totalCount); checkDone(); },
      error: () => checkDone()
    });

    this.dashboardService.getInventorySummary().subscribe({
      next: (res) => { this.stockValuation.set(res); checkDone(); },
      error: () => checkDone()
    });

    this.dashboardService.getOrdersSummary().subscribe({
      next: (res) => { this.orderSummary.set(res); checkDone(); },
      error: () => checkDone()
    });

    this.dashboardService.getExpenseSummary().subscribe({
      next: (res) => { this.totalExpense.set(res.totalExpense); checkDone(); },
      error: () => checkDone()
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  navigateToBalanceDue() {
    this.router.navigate(['/orders'], { queryParams: { paymentDue: 'true' } });
  }
}
