import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { DashboardService, ProductSalesSummary } from '../../../services/dashboard.service';
import { Product } from '../../../models/product.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'product-details',
  standalone: true,
  imports: [CurrencyPipe, ConfirmDialogComponent],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetails implements OnInit {
  private productService = inject(ProductService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  product: Product = {
    name: '',
    code: '',
    maxRetailPrice: 0,
    maxSalePrice: 0
  };

  loading = signal(true);
  showMenu = signal(false);
  showDeleteDialog = signal(false);
  showSalePrice = signal(false);
  summaryLoading = signal(true);
  salesSummary = signal<ProductSalesSummary>({
    totalQuantitySold: 0,
    totalPrice: 0
  });
  private productId!: number;

  ngOnInit() {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(this.productId).subscribe({
      next: (data) => {
        this.product = data;
        this.loading.set(false);
        this.loadSalesSummary();
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/products']);
      }
    });
  }

  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  confirmDelete() {
    this.showDeleteDialog.set(true);
  }

  deleteProduct() {
    this.productService.delete(this.productId).subscribe({
      next: () => {
        this.showDeleteDialog.set(false);
        this.router.navigate(['/products']);
      },
      error: () => {
        this.showDeleteDialog.set(false);
      }
    });
  }

  toggleSalePrice() {
    this.showSalePrice.update(v => !v);
  }

  navigateToEdit() {
    this.router.navigate(['/products/edit', this.productId]);
  }

  navigateToInventory() {
    this.router.navigate(['/products', this.productId, 'inventory']);
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  loadSalesSummary() {
    this.summaryLoading.set(true);
    this.dashboardService.getProductSalesSummary(this.productId).subscribe({
      next: (res) => {
        this.salesSummary.set(res);
        this.summaryLoading.set(false);
      },
      error: () => {
        this.summaryLoading.set(false);
      }
    });
  }
}
