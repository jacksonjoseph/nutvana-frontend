import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../../services/expense.service';
import { ExpenseCategoryService } from '../../../services/expense-category.service';
import { Expense, PaymentMode } from '../../../models/expense.model';
import { ExpenseCategory } from '../../../models/expense-category.model';

@Component({
  selector: 'app-expense-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './expense-create.html',
  styleUrl: './expense-create.scss'
})
export class ExpenseCreate implements OnInit {
  private expenseService = inject(ExpenseService);
  private categoryService = inject(ExpenseCategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  expense: Expense = {
    categoryId: 0,
    amount: 0,
    paymentMode: PaymentMode.CASH,
    description: '',
    referenceNumber: '',
    vendorName: ''
  };

  categories = signal<ExpenseCategory[]>([]);
  paymentModes = Object.values(PaymentMode);

  loading = signal(false);
  categoriesLoading = signal(true);
  createdAtInput = '';

  ngOnInit() {
    this.loadCategories();
    
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    this.createdAtInput = `${year}-${month}-${day}`;
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        const activeCategories = data.filter(c => c.active);
        this.categories.set(activeCategories);
        if (activeCategories.length > 0) {
          this.expense.categoryId = activeCategories[0].id!;
        }
        this.categoriesLoading.set(false);
      },
      error: () => this.categoriesLoading.set(false)
    });
  }

  onSubmit() {
    if (!this.expense.categoryId || !this.expense.amount || !this.expense.paymentMode || !this.createdAtInput) return;

    this.expense.createdAt = `${this.createdAtInput}T00:00:00`;

    this.loading.set(true);
    this.expenseService.create(this.expense).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/expenses']);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/expenses']);
  }
}
