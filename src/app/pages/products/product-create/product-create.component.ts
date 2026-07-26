import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-create',
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
        <h1 class="form-title">New Product</h1>
        <div style="width:36px"></div>
      </div>

      <form class="form-body" (ngSubmit)="onSubmit()" #productForm="ngForm">
        <div class="form-group">
          <label class="form-label" for="name">Product Name</label>
          <input
            id="name"
            class="form-input"
            type="text"
            placeholder="e.g. Chocolate Cake"
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
            placeholder="e.g. CHK-001"
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
              placeholder="0.00"
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
              placeholder="0.00"
              [(ngModel)]="product.maxSalePrice"
              name="maxSalePrice"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          class="submit-btn"
          [disabled]="saving() || !productForm.valid"
        >
          @if (saving()) {
            <span class="btn-spinner"></span> Saving...
          } @else {
            Create Product
          }
        </button>
      </form>
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

    .form-input::placeholder {
      color: var(--text-placeholder);
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
      margin-top: 1rem;
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ProductCreateComponent {
  private productService = inject(ProductService);
  private router = inject(Router);

  product: Product = {
    name: '',
    code: '',
    maxRetailPrice: 0,
    maxSalePrice: 0
  };

  saving = signal(false);

  goBack() {
    this.router.navigate(['/products']);
  }

  onSubmit() {
    this.saving.set(true);
    this.productService.create(this.product).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }
}
