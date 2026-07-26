import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../../services/expense.service';
import { ExpenseCategoryService } from '../../../services/expense-category.service';
import { Expense } from '../../../models/expense.model';
import { ExpenseCategory } from '../../../models/expense-category.model';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, CommonModule],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.scss'
})
export class ExpenseList implements OnInit {
  private expenseService = inject(ExpenseService);
  private expenseCategoryService = inject(ExpenseCategoryService);
  private router = inject(Router);

  expenses = signal<Expense[]>([]);
  categories = signal<ExpenseCategory[]>([]);
  selectedCategoryIds = signal<number[]>([]);
  showCategoryDropdown = signal(false);

  startDate = signal<string>('');
  endDate = signal<string>('');
  loading = signal(true);

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(25);

  ngOnInit() {
    this.loadCategories();
    this.loadExpenses();
  }

  loadCategories() {
    this.expenseCategoryService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data || []);
      }
    });
  }

  loadExpenses(page: number = 0) {
    this.loading.set(true);

    let startIso: string | undefined = undefined;
    if (this.startDate()) {
      startIso = `${this.startDate()}T00:00:00`;
    }

    let endIso: string | undefined = undefined;
    if (this.endDate()) {
      endIso = `${this.endDate()}T23:59:59`;
    }

    this.expenseService.getAll(
      page,
      this.pageSize(),
      'createdAt,desc',
      this.selectedCategoryIds(),
      startIso,
      endIso
    ).subscribe({
      next: (data) => {
        const sortedList = (data.content || []).sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (dateB !== dateA) return dateB - dateA;
          return (b.id || 0) - (a.id || 0);
        });
        this.expenses.set(sortedList);
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

  toggleFilterDropdown() {
    this.showCategoryDropdown.update(show => !show);
  }

  toggleCategorySelection(id: number) {
    const current = [...this.selectedCategoryIds()];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    this.selectedCategoryIds.set(current);
    this.loadExpenses(0);
  }

  isCategorySelected(id: number): boolean {
    return this.selectedCategoryIds().includes(id);
  }

  clearCategoryFilter() {
    this.selectedCategoryIds.set([]);
    this.loadExpenses(0);
  }

  onStartDateChange(val: string) {
    this.startDate.set(val);
    this.loadExpenses(0);
  }

  onEndDateChange(val: string) {
    this.endDate.set(val);
    this.loadExpenses(0);
  }

  resetAllFilters() {
    this.selectedCategoryIds.set([]);
    this.startDate.set('');
    this.endDate.set('');
    this.loadExpenses(0);
  }

  navigateToCreate() {
    this.router.navigate(['/expenses/create']);
  }

  navigateToView(id: number) {
    this.router.navigate(['/expenses/details', id]);
  }
}
