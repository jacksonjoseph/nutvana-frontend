import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, NgClass, DecimalPipe } from '@angular/common';
import { InsightsService, ProductInsight } from '../../../services/insights.service';

@Component({
  selector: 'app-top-products',
  standalone: true,
  imports: [CurrencyPipe, NgClass, DecimalPipe],
  template: `
    <div class="view-container">
      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      } @else {
        <div class="section-label">
          Top products by revenue · {{ totalProducts() }} total
        </div>

        <div class="list">
          @for (product of products(); track product.productId; let i = $index) {
            <div class="card" (click)="navigateTo(product.productId)">
              <div class="rank-badge" [ngClass]="getRankClass(i)">
                {{ i + 1 + currentPage() * pageSize }}
              </div>

              <div class="product-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>

              <div class="info">
                <span class="name">{{ product.productName }}</span>
                <div class="meta">
                  <span class="chip code-chip">{{ product.productCode }}</span>
                  <span class="chip qty-chip">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      <polyline points="17 6 23 6 23 12"/>
                    </svg>
                    {{ product.totalQuantitySold }} sold
                  </span>
                  @if (product.quantityAvailable > 0) {
                    <span class="chip stock-chip">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M5 12h14"/><path d="M12 5v14"/>
                      </svg>
                      {{ product.quantityAvailable }} in stock
                    </span>
                  } @else {
                    <span class="chip out-chip">Out of stock</span>
                  }
                </div>
              </div>

              <div class="amounts">
                <span class="amount-total">{{ product.totalRevenueGenerated | currency:'INR':'₹':'1.0-0' }}</span>
                @if (product.stockValue > 0) {
                  <span class="amount-sub success">Stock ₹{{ product.stockValue | number:'1.0-0' }}</span>
                }
              </div>
            </div>
          }
        </div>

        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="btn-page" [disabled]="currentPage() === 0 || loading()" (click)="load(currentPage() - 1)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Prev
            </button>
            <span class="page-info">{{ currentPage() + 1 }} / {{ totalPages() }}</span>
            <button class="btn-page" [disabled]="currentPage() >= totalPages() - 1 || loading()" (click)="load(currentPage() + 1)">
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .view-container { animation: fadeInUp 0.3s ease both; }

    .section-label {
      font-size: 0.75rem; font-weight: 600; color: var(--text-secondary);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.85rem;
    }

    .list { display: flex; flex-direction: column; gap: 0.6rem; }

    .card {
      display: flex; align-items: center; gap: 0.75rem;
      background: var(--surface-card); border: 1px solid var(--surface-border);
      border-radius: 0.9rem; padding: 0.85rem 1rem;
      transition: all 0.2s ease; cursor: pointer;
    }
    .card:hover { border-color: var(--accent); transform: translateX(2px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }

    .rank-badge {
      min-width: 26px; height: 26px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 800;
      background: var(--surface-hover); color: var(--text-secondary); flex-shrink: 0;
    }
    .rank-badge.rank-gold { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #1a1a0a; }
    .rank-badge.rank-silver { background: linear-gradient(135deg, #94a3b8, #cbd5e1); color: #1a1a1a; }
    .rank-badge.rank-bronze { background: linear-gradient(135deg, #b45309, #d97706); color: #1a1a0a; }

    .product-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.18));
      color: var(--accent-light);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .info { flex: 1; min-width: 0; }
    .name { display: block; font-size: 0.88rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta { display: flex; align-items: center; gap: 0.35rem; margin-top: 0.2rem; flex-wrap: wrap; }

    .chip { display: inline-flex; align-items: center; gap: 0.2rem; font-size: 0.68rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 9999px; }
    .code-chip { background: var(--surface-hover); color: var(--text-secondary); font-size: 0.65rem; letter-spacing: 0.4px; }
    .qty-chip { background: var(--accent-subtle); color: var(--accent-light); }
    .stock-chip { background: var(--success-subtle); color: var(--success); }
    .out-chip { background: rgba(239,68,68,0.1); color: var(--danger); font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 9999px; }

    .amounts { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
    .amount-total { font-size: 0.95rem; font-weight: 800; color: var(--text-primary); }
    .amount-sub { font-size: 0.68rem; font-weight: 600; }
    .amount-sub.success { color: var(--success); }

    .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1rem; color: var(--text-secondary); }
    .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--surface-border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 1rem; }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.5rem; }
    .btn-page {
      display: flex; align-items: center; gap: 0.25rem;
      background: var(--surface-card); border: 1px solid var(--surface-border);
      padding: 0.5rem 1rem; border-radius: 0.6rem;
      font-size: 0.82rem; color: var(--text-primary); cursor: pointer;
      transition: all 0.2s; font-family: inherit; font-weight: 600;
    }
    .btn-page:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-info { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; min-width: 4rem; text-align: center; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class TopProductsComponent implements OnInit {
  private insightsService = inject(InsightsService);
  private router = inject(Router);

  products = signal<ProductInsight[]>([]);
  loading = signal(true);
  currentPage = signal(0);
  totalPages = signal(0);
  totalProducts = signal(0);
  readonly pageSize = 10;

  ngOnInit() { this.load(); }

  load(page: number = 0) {
    this.loading.set(true);
    this.insightsService.getTopProducts(page, this.pageSize).subscribe({
      next: (data) => {
        this.products.set(data.content);
        this.currentPage.set(data.page.number);
        this.totalPages.set(data.page.totalPages);
        this.totalProducts.set(data.page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  navigateTo(productId: number) {
    this.router.navigate(['/products/details', productId]);
  }

  getRankClass(index: number): string {
    const rank = index + this.currentPage() * this.pageSize;
    if (rank === 0) return 'rank-gold';
    if (rank === 1) return 'rank-silver';
    if (rank === 2) return 'rank-bronze';
    return '';
  }
}
