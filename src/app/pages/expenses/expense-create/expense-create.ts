import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../../services/expense.service';
import { ExpenseCategoryService } from '../../../services/expense-category.service';
import { LaborService } from '../../../services/labor.service';
import { SalesPersonService } from '../../../services/sales-person.service';
import { Expense, PaymentMode } from '../../../models/expense.model';
import { ExpenseCategory } from '../../../models/expense-category.model';
import { Labor } from '../../../models/labor.model';
import { SalesPerson } from '../../../models/sales-person.model';

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
  private laborService = inject(LaborService);
  private salesPersonService = inject(SalesPersonService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  expense: Expense = {
    categoryId: 0,
    amount: 0,
    paymentMode: PaymentMode.CASH,
    description: '',
    referenceNumber: '',
    vendorName: '',
    laborId: undefined,
    salesPersonId: undefined
  };

  categories = signal<ExpenseCategory[]>([]);
  allLabors = signal<Labor[]>([]);
  allSalesPersons = signal<SalesPerson[]>([]);
  paymentModes = Object.values(PaymentMode);

  loading = signal(false);
  categoriesLoading = signal(true);
  laborsLoading = signal(true);
  salesPersonsLoading = signal(true);
  createdAtInput = '';

  // Inline labor creation state
  showAddLaborForm = signal(false);
  newLaborName = '';
  newLaborPhone = '';
  laborSaving = signal(false);

  ngOnInit() {
    this.loadCategories();
    this.loadLabors();
    this.loadSalesPersons();
    
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

  loadLabors() {
    this.laborsLoading.set(true);
    this.laborService.getAll().subscribe({
      next: (data) => {
        this.allLabors.set(data || []);
        this.laborsLoading.set(false);
      },
      error: () => this.laborsLoading.set(false)
    });
  }

  loadSalesPersons() {
    this.salesPersonsLoading.set(true);
    this.salesPersonService.getAll(0, 100).subscribe({
      next: (data) => {
        this.allSalesPersons.set(data.content || []);
        this.salesPersonsLoading.set(false);
      },
      error: () => this.salesPersonsLoading.set(false)
    });
  }

  isLaborCategorySelected(): boolean {
    const selectedCat = this.categories().find(c => c.id === Number(this.expense.categoryId));
    return selectedCat?.name?.toLowerCase() === 'labor';
  }

  selectedPartnerKey(): string | undefined {
    if (this.expense.laborId) {
      return `labor_${this.expense.laborId}`;
    }
    if (this.expense.salesPersonId) {
      return `sp_${this.expense.salesPersonId}`;
    }
    return undefined;
  }

  onPartnerChange(key: string) {
    if (!key || key === 'null' || key === 'undefined') {
      this.expense.laborId = undefined;
      this.expense.salesPersonId = undefined;
      return;
    }
    if (key.startsWith('labor_')) {
      this.expense.laborId = Number(key.replace('labor_', ''));
      this.expense.salesPersonId = undefined;
    } else if (key.startsWith('sp_')) {
      this.expense.salesPersonId = Number(key.replace('sp_', ''));
      this.expense.laborId = undefined;
    }
  }

  toggleAddLaborForm() {
    this.showAddLaborForm.set(!this.showAddLaborForm());
    this.newLaborName = '';
    this.newLaborPhone = '';
  }

  saveNewLabor() {
    if (!this.newLaborName.trim()) return;

    this.laborSaving.set(true);
    const newLabor: Labor = {
      name: this.newLaborName.trim(),
      phone: this.newLaborPhone.trim() || undefined,
      isActive: true
    };

    this.laborService.create(newLabor).subscribe({
      next: (savedLabor) => {
        this.allLabors.update(list => [...list, savedLabor].sort((a, b) => a.name.localeCompare(b.name)));
        this.expense.laborId = savedLabor.id;
        this.expense.salesPersonId = undefined;
        this.toggleAddLaborForm();
        this.laborSaving.set(false);
      },
      error: (err) => {
        console.error('Failed to save laborer', err);
        this.laborSaving.set(false);
      }
    });
  }

  onSubmit() {
    if (!this.expense.categoryId || !this.expense.amount || !this.expense.paymentMode || !this.createdAtInput) return;

    this.expense.createdAt = `${this.createdAtInput}T00:00:00`;
    
    // Clear laborId and salesPersonId if it's not a labor category
    if (!this.isLaborCategorySelected()) {
      this.expense.laborId = undefined;
      this.expense.salesPersonId = undefined;
    } else {
      // Set vendorName to selected labor's name or salesperson's name for redundancy/readability if needed
      if (this.expense.laborId) {
        const selectedLabor = this.allLabors().find(l => l.id === Number(this.expense.laborId));
        if (selectedLabor) {
          this.expense.vendorName = selectedLabor.name;
        }
      } else if (this.expense.salesPersonId) {
        const selectedSP = this.allSalesPersons().find(sp => sp.id === Number(this.expense.salesPersonId));
        if (selectedSP) {
          this.expense.vendorName = selectedSP.name;
        }
      }
    }

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
