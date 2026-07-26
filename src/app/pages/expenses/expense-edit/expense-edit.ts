import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../../services/expense.service';
import { ExpenseCategoryService } from '../../../services/expense-category.service';
import { Expense, PaymentMode } from '../../../models/expense.model';
import { ExpenseCategory } from '../../../models/expense-category.model';

@Component({
  selector: 'app-expense-edit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './expense-edit.html',
  styleUrl: './expense-edit.scss'
})
export class ExpenseEdit implements OnInit {
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
  initialLoading = signal(true);
  createdAtInput = '';
  private expenseId!: number;

  ngOnInit() {
    this.expenseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCategories();
    this.loadExpense();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        const activeCategories = data.filter(c => c.active);
        this.categories.set(activeCategories);
        this.categoriesLoading.set(false);
      },
      error: () => this.categoriesLoading.set(false)
    });
  }

  loadExpense() {
    this.initialLoading.set(true);
    this.expenseService.getById(this.expenseId).subscribe({
      next: (data) => {
        this.expense = data;
        if (this.expense.createdAt) {
          // Extracts yyyy-Mm-dd from yyyy-MM-ddThh:mm:ss
          this.createdAtInput = this.expense.createdAt.split('T')[0];
        }
        this.initialLoading.set(false);
      },
      error: () => {
        this.initialLoading.set(false);
        this.router.navigate(['/expenses']);
      }
    });
  }

  onSubmit() {
    if (!this.expense.categoryId || !this.expense.amount || !this.expense.paymentMode || !this.createdAtInput) return;

    this.expense.createdAt = `${this.createdAtInput}T00:00:00`;

    this.loading.set(true);
    this.expenseService.update(this.expenseId, this.expense).subscribe({
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
