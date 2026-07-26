import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ExpenseService } from '../../../services/expense.service';
import { Expense, PaymentMode } from '../../../models/expense.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-expense-details',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ConfirmDialogComponent],
  templateUrl: './expense-details.html',
  styleUrl: './expense-details.scss'
})
export class ExpenseDetails implements OnInit {
  private expenseService = inject(ExpenseService);
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

  loading = signal(true);
  showMenu = signal(false);
  showDeleteDialog = signal(false);
  private expenseId!: number;

  ngOnInit() {
    this.expenseId = Number(this.route.snapshot.paramMap.get('id'));
    this.expenseService.getById(this.expenseId).subscribe({
      next: (data) => {
        this.expense = data;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/expenses']);
      }
    });
  }

  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  confirmDelete() {
    this.showDeleteDialog.set(true);
  }

  deleteExpense() {
    this.expenseService.delete(this.expenseId).subscribe({
      next: () => {
        this.showDeleteDialog.set(false);
        this.router.navigate(['/expenses']);
      },
      error: () => {
        this.showDeleteDialog.set(false);
      }
    });
  }

  navigateToEdit() {
    this.router.navigate(['/expenses/edit', this.expenseId]);
  }

  goBack() {
    this.router.navigate(['/expenses']);
  }
}
