import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { ProductService } from '../../services/product.service';
import { InventorySummary, InventoryTransaction, InventoryTransactionType } from '../../models/inventory.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss'
})
export class InventoryComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productId!: number;
  product: Product | null = null;
  transactions = signal<InventoryTransaction[]>([]);
  loading = signal(true);
  
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(20);

  transactionTypes = Object.values(InventoryTransactionType);
  showCreateModal = signal(false);
  newTransaction: InventoryTransaction = {
    productId: 0,
    quantity: 0,
    transactionType: InventoryTransactionType.PRODUCTION_IN,
    referenceId: '',
    notes: ''
  };

  ngOnInit() {
    this.productId = Number(this.route.snapshot.paramMap.get('productId'));
    this.newTransaction.productId = this.productId;
    this.loadProduct();
  }

  loadProduct() {
     this.productService.getById(this.productId).subscribe(p => {
       this.product = p;
       if (this.product?.inventory?.id) {
         this.loadTransactions();
       } else {
         this.loading.set(false);
       }
     });
  }

  loadTransactions(page: number = 0) {
    if (!this.product?.inventory?.id) return;
    this.loading.set(true);
    this.inventoryService.getTransactions(this.product.inventory.id, page, this.pageSize()).subscribe({
      next: (data) => {
        this.transactions.set(data.content);
        this.currentPage.set(data.page.number);
        this.totalPages.set(data.page.totalPages);
        this.totalElements.set(data.page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreateModal() {
    this.newTransaction = {
      productId: this.productId,
      quantity: 0,
      transactionType: InventoryTransactionType.PRODUCTION_IN,
      referenceId: '',
      notes: ''
    };
    this.showCreateModal.set(true);
  }

  onSubmit() {
    if (this.newTransaction.quantity <= 0) return;
    this.inventoryService.createTransaction(this.newTransaction).subscribe({
      next: () => {
         this.showCreateModal.set(false);
         this.loadProduct();
      }
    });
  }

  getTypeClass(type: InventoryTransactionType): string {
    const redTypes = [InventoryTransactionType.SALE, InventoryTransactionType.WASTAGE, InventoryTransactionType.ADJUSTMENT_OUT];
    return redTypes.includes(type) ? 'danger' : 'success';
  }

  goBack() {
    this.router.navigate(['/products/details', this.productId]);
  }
}
