import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="form-page">
      <div class="form-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="form-title">Edit Product</h1>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
      } @else {
        <form class="form-body" (ngSubmit)="onSubmit()" #productForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="name">Product Name</label>
            <input
              id="name"
              class="form-input"
              type="text"
              [(ngModel)]="product.name"
              name="name"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="code">Product Code</label>
            <input
              id="code"
              class="form-input"
              type="text"
              [(ngModel)]="product.code"
              name="code"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="mrp">Max Retail Price</label>
              <input
                id="mrp"
                class="form-input"
                type="number"
                step="0.01"
                [(ngModel)]="product.maxRetailPrice"
                name="maxRetailPrice"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="msp">Max Sale Price</label>
              <input
                id="msp"
                class="form-input"
                type="number"
                step="0.01"
                [(ngModel)]="product.maxSalePrice"
                name="maxSalePrice"
                required
              />
            </div>
          </div>

          <div class="btn-row">
            <button
              type="button"
              class="cancel-btn"
              (click)="cancelEdit()"
              [disabled]="saving()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="submit-btn"
              [disabled]="saving() || !productForm.valid"
            >
              @if (saving()) {
                <span class="btn-spinner"></span> Saving...
              } @else {
                Save
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .form-page {
      min-height: 100vh;
      background: var(--surface-ground);
    }

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

    .back-btn:hover {
      background: var(--surface-hover);
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

    .icon-btn:hover {
      background: var(--surface-hover);
    }

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

    .form-body {
      padding: 0.5rem 1rem 2rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
      flex: 1;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .form-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
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
      font-weight: 600;
      color: var(--text-primary);
    }

    .form-value.accent {
      color: var(--accent);
    }

    .masked-value {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .eye-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.2rem;
      border-radius: 0.35rem;
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }

    .eye-btn:hover {
      color: var(--accent);
      background: var(--accent-subtle);
    }

    .code-badge {
      background: var(--accent-subtle);
      color: var(--accent);
      padding: 0.15rem 0.5rem;
      border-radius: 0.35rem;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.5px;
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

    .cancel-btn:hover {
      background: var(--surface-hover);
    }

    .cancel-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

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

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ProductEditComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  product: Product = {
    name: '',
    code: '',
    maxRetailPrice: 0,
    maxSalePrice: 0
  };

  loading = signal(true);
  saving = signal(false);
  private productId!: number;

  ngOnInit() {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(this.productId).subscribe({
      next: (data) => {
        this.product = data;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/products']);
      }
    });
  }

  cancelEdit() {
    this.router.navigate(['/products/details', this.productId]);
  }

  goBack() {
    this.router.navigate(['/products/details', this.productId]);
  }

  onSubmit() {
    this.saving.set(true);
    this.productService.update(this.productId, this.product).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/products/details', this.productId]);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }
}
