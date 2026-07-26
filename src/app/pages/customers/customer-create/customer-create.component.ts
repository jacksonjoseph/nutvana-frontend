import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../services/customer.service';
import { SalesPersonService } from '../../../services/sales-person.service';
import { Customer } from '../../../models/customer.model';
import { SalesPerson } from '../../../models/sales-person.model';

@Component({
  selector: 'app-customer-create',
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
        <h1 class="form-title">New Customer</h1>
        <div style="width:36px"></div>
      </div>

      <form class="form-body" (ngSubmit)="onSubmit()" #customerForm="ngForm">
        <div class="form-group">
          <label class="form-label" for="name">Full Name</label>
          <input
            id="name"
            class="form-input"
            type="text"
            placeholder="e.g. John Doe"
            [(ngModel)]="customer.name"
            name="name"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="location">Location</label>
          <input
            id="location"
            class="form-input"
            type="text"
            placeholder="e.g. Mumbai"
            [(ngModel)]="customer.location"
            name="location"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="contact">Contact</label>
          <input
            id="contact"
            class="form-input"
            type="text"
            placeholder="e.g. info@example.com or details"
            [(ngModel)]="customer.contact"
            name="contact"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="phone">Phone</label>
          <input
            id="phone"
            class="form-input"
            type="tel"
            placeholder="e.g. 9876543210"
            [(ngModel)]="customer.phone"
            name="phone"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" style="margin-bottom: 0.5rem;">Assigned Sales Partners</label>
          <div style="background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 0.75rem; padding: 0.75rem; max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;">
            @for (sp of salesPersons(); track sp.id) {
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-primary); cursor: pointer; user-select: none;">
                <input
                  type="checkbox"
                  [checked]="isSalesPersonSelected(sp.id!)"
                  (change)="toggleSalesPersonSelection(sp.id!)"
                  style="accent-color: var(--accent); width: 16px; height: 16px;"
                />
                <span>{{ sp.name }}</span>
              </label>
            } @empty {
              <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; padding: 0.5rem 0;">No active agents found</div>
            }
          </div>
        </div>

        <button
          type="submit"
          class="submit-btn"
          [disabled]="saving() || !customerForm.valid"
        >
          @if (saving()) {
            <span class="btn-spinner"></span> Saving...
          } @else {
            Create Customer
          }
        </button>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .form-page { min-height: 100vh; background: var(--surface-ground); }

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

    .back-btn:hover { background: var(--surface-hover); }

    .form-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .form-body { padding: 0.5rem 1rem 2rem; }

    .form-group { margin-bottom: 1.25rem; }

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

    .form-input::placeholder { color: var(--text-placeholder); }

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

    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

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

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class CustomerCreateComponent implements OnInit {
  private customerService = inject(CustomerService);
  private salesPersonService = inject(SalesPersonService);
  private router = inject(Router);

  customer: Customer = {
    name: '',
    location: '',
    contact: '',
    phone: '',
    salesPersonIds: []
  };

  salesPersons = signal<SalesPerson[]>([]);
  saving = signal(false);

  ngOnInit() {
    this.salesPersonService.getAll(0, 100).subscribe({
      next: (response) => {
        const active = response.content.filter(sp => sp.isActive);
        this.salesPersons.set(active);
      }
    });
  }

  isSalesPersonSelected(id: number): boolean {
    return this.customer.salesPersonIds?.includes(id) ?? false;
  }

  toggleSalesPersonSelection(id: number) {
    if (!this.customer.salesPersonIds) {
      this.customer.salesPersonIds = [];
    }
    const idx = this.customer.salesPersonIds.indexOf(id);
    if (idx >= 0) {
      this.customer.salesPersonIds.splice(idx, 1);
    } else {
      this.customer.salesPersonIds.push(id);
    }
  }

  goBack() {
    this.router.navigate(['/customers']);
  }

  onSubmit() {
    this.saving.set(true);
    this.customerService.create(this.customer).subscribe({
      next: (createdCustomer) => {
        if (createdCustomer && createdCustomer.id) {
          this.router.navigate(['/customers/details', createdCustomer.id]);
        } else {
          this.router.navigate(['/customers']);
        }
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }
}
