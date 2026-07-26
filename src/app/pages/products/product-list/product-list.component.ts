import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Products</h1>
          <p class="page-subtitle">{{ totalElements() }} items</p>
        </div>
        <button class="fab" (click)="navigateToCreate()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <div class="search-bar">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          class="search-input"
          type="text"
          placeholder="Search products..."
          [ngModel]="searchTerm()"
          (ngModelChange)="onSearch($event)"
          name="productSearch"
        />
        @if (searchTerm()) {
          <button class="search-clear" (click)="clearSearch()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        }
      </div>

      @if (loading() && products().length === 0) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      } @else if (products().length === 0) {
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <h3>No Products Yet</h3>
          <p>Create your first product to get started</p>
          <button class="btn-primary" (click)="navigateToCreate()">Add Product</button>
        </div>
      } @else {
        <div class="grid">
          @for (product of products(); track product.id) {
            <div class="card" (click)="navigateToView(product.id!)">
              <div class="card-header">
                <div class="card-badge">{{ product.code }}</div>
                <span class="card-price">{{ product.maxRetailPrice | currency:'INR':'₹':'1.0-0' }}</span>
              </div>
              <h3 class="card-title">{{ product.name }}</h3>
              @if (product.inventory) {
                <div class="card-inventory">
                  <span class="inventory-label">Stock:</span>
                  <span class="inventory-value" [class.success]="product.inventory.quantity > product.inventory.reorderLevel" [class.danger]="product.inventory.reorderLevel > product.inventory.quantity">
                    {{ product.inventory.quantity }}
                  </span>
                </div>
              }
            </div>
          }
        </div>

        @if (totalPages() > 1 && !searchTerm()) {
          <div class="pagination">
            <button class="btn-page" [disabled]="currentPage() === 0 || loading()" (click)="loadProducts(currentPage() - 1)">Previous</button>
            <span class="page-info">Page {{ currentPage() + 1 }} of {{ totalPages() }}</span>
            <button class="btn-page" [disabled]="currentPage() >= totalPages() - 1 || loading()" (click)="loadProducts(currentPage() + 1)">Next</button>
          </div>
        }
        @if (totalPages() > 1 && searchTerm()) {
           <div class="pagination">
            <span class="page-info">Search results don't support pagination</span>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

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
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }

    .search-bar {
      position: relative;
      margin-bottom: 1rem;
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.7rem 2.5rem 0.7rem 2.5rem;
      background: var(--surface-card);
      border: 1.5px solid var(--surface-border);
      border-radius: 0.75rem;
      font-size: 0.85rem;
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

    .search-clear {
      position: absolute;
      right: 0.6rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.3rem;
      display: flex;
      transition: all 0.2s;
    }

    .search-clear:hover {
      color: var(--text-primary);
      background: var(--surface-hover);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .card {
      background: var(--surface-card);
      border-radius: 0.85rem;
      padding: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--surface-border);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .card:hover {
      border-color: var(--accent);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .card-badge {
      background: var(--accent-subtle);
      color: var(--accent);
      padding: 0.15rem 0.45rem;
      border-radius: 2rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.4px;
    }

    .card-price {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .card-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-inventory {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding-top: 0.5rem;
      border-top: 1px dashed var(--surface-border);
    }

    .inventory-label {
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .inventory-value {
      color: var(--text-primary);
    }

    .inventory-value.success {
      color: var(--success);
    }

    .inventory-value.danger {
      color: var(--danger);
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
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  products = signal<Product[]>([]);
  loading = signal(true);
  searchTerm = signal('');

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(25);

  private searchTimeout: any;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(page: number = 0) {
    this.loading.set(true);
    this.productService.getAll(page, this.pageSize()).subscribe({
      next: (data) => {
        this.products.set(data.content);
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

  onSearch(term: string) {
    this.searchTerm.set(term);
    clearTimeout(this.searchTimeout);

    if (!term.trim()) {
      this.loadProducts();
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.loading.set(true);
      this.productService.search(term).subscribe({
        next: (data) => {
          this.products.set(data);
          this.currentPage.set(0);
          this.totalPages.set(1);
          this.totalElements.set(data.length);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }, 300);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.loadProducts();
  }

  navigateToCreate() {
    this.router.navigate(['/products/create']);
  }

  navigateToView(id: number) {
    this.router.navigate(['/products/details', id]);
  }
}
