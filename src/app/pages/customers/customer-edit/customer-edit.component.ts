import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';
import { SalesPersonService } from '../../../services/sales-person.service';
import { Customer } from '../../../models/customer.model';
import { SalesPerson } from '../../../models/sales-person.model';

@Component({
  selector: 'app-customer-edit',
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
        <h1 class="form-title">Edit Customer</h1>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading customer...</p>
        </div>
      } @else {
        <!-- Edit-mode form -->
        <form class="form-body" (ngSubmit)="onSubmit()" #customerForm="ngForm">
            <div class="form-group">
              <label class="form-label" for="name">Full Name</label>
              <input id="name" class="form-input" type="text" [(ngModel)]="customer.name" name="name" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="location">Location</label>
              <input id="location" class="form-input" type="text" [(ngModel)]="customer.location" name="location" />
            </div>
            <div class="form-group">
              <label class="form-label" for="contact">Contact</label>
              <input id="contact" class="form-input" type="text" [(ngModel)]="customer.contact" name="contact" />
            </div>
            <div class="form-group">
              <label class="form-label" for="phone">Phone</label>
              <input id="phone" class="form-input" type="tel" [(ngModel)]="customer.phone" name="phone" />
            </div>

            <div class="form-group">
              <label class="form-label" style="margin-bottom: 0.5rem;">Assigned Sales Persons</label>
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
            <div class="btn-row">
              <button type="button" class="cancel-btn" (click)="cancelEdit()" [disabled]="saving()">Cancel</button>
              <button type="submit" class="submit-btn" [disabled]="saving() || !customerForm.valid">
                @if (saving()) { <span class="btn-spinner"></span> Saving... } @else { Save }
              </button>
            </div>
          </form>
      }
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

    .icon-btn:hover { background: var(--surface-hover); }

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

    /* View mode compact card */
    .view-card {
      margin: 0.5rem 1rem 1rem;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.85rem;
      padding: 0.85rem;
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .view-avatar {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .view-info { flex: 1; min-width: 0; }

    .view-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .view-rows { display: flex; flex-direction: column; gap: 0.3rem; }

    .view-row {
      display: flex;
      gap: 0.5rem;
      font-size: 0.75rem;
      line-height: 1.3;
    }

    .view-lbl {
      color: var(--text-secondary);
      font-weight: 600;
      min-width: 54px;
      flex-shrink: 0;
    }

    .view-val {
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .form-body { padding: 0.5rem 1rem 1rem; }

    .form-group { margin-bottom: 1rem; }

    .form-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.4rem;
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
      font-weight: 500;
      color: var(--text-primary);
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

    .cancel-btn:hover { background: var(--surface-hover); }
    .cancel-btn:disabled { opacity: 0.6; cursor: not-allowed; }

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

    /* Orders section */
    .orders-section {
      padding: 0 1rem 5rem;
    }

    .orders-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .title-with-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .new-order-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--surface-card);
      color: var(--accent);
      border: 1px solid var(--accent);
      padding: 0.4rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .new-order-btn:hover {
      background: var(--accent-subtle);
      transform: translateY(-1px);
    }

    .orders-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .orders-count {
      background: var(--accent-subtle);
      color: var(--accent);
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 1rem;
    }

    .orders-loading {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .loading-spinner-sm {
      width: 28px;
      height: 28px;
      border: 2.5px solid var(--surface-border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .orders-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem;
      color: var(--text-secondary);
      font-size: 0.85rem;
    }

    .orders-empty p { margin: 0; }

    .orders-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.75rem;
    }

    .order-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.85rem;
      padding: 0.85rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .order-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: var(--accent);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.5rem;
    }

    .order-id {
      background: var(--accent-subtle);
      color: var(--accent);
      padding: 0.15rem 0.45rem;
      border-radius: 2rem;
      font-size: 0.65rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .card-date {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.7rem;
      color: var(--text-secondary);
      margin-bottom: 0.6rem;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.6rem;
      border-top: 1px solid var(--surface-border);
    }

    .amount-col {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .amount-col:first-child { align-items: flex-start; }
    .amount-col:nth-child(2) { align-items: center; }
    .amount-col:last-child { align-items: flex-end; }

    .amount-lbl {
      font-size: 0.65rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .amount-val {
      font-size: 0.8rem;
      font-weight: 700;
    }

    .total {
      color: #3b82f6;
    }

    .collected {
      color: #22c55e;
    }

    .balance-due {
      color: #ef4444;
    }

    .balance-clear {
      color: var(--text-secondary);
    }

    .items-count {
      font-size: 0.7rem;
      color: var(--text-secondary);
      font-weight: 500;
      flex-shrink: 0;
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

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class CustomerEditComponent implements OnInit {
  private customerService = inject(CustomerService);
  private salesPersonService = inject(SalesPersonService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  customer: Customer = { name: '', location: '', contact: '', phone: '' };
  salesPersons = signal<SalesPerson[]>([]);

  loading = signal(true);
  saving = signal(false);
  private customerId!: number;

  ngOnInit() {
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));
    this.salesPersonService.getAll(0, 100).subscribe({
      next: (spResponse) => {
        this.customerService.getById(this.customerId).subscribe({
          next: (data) => {
            this.customer = data;
            const activeOrCurrent = spResponse.content.filter(sp => sp.isActive || sp.id === data.salesPersonId);
            this.salesPersons.set(activeOrCurrent);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.router.navigate(['/customers']);
          }
        });
      },
      error: () => {
        this.customerService.getById(this.customerId).subscribe({
          next: (data) => {
            this.customer = data;
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.router.navigate(['/customers']);
          }
        });
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

  cancelEdit() {
    this.router.navigate(['/customers/details', this.customerId]);
  }

  goBack() {
    this.router.navigate(['/customers/details', this.customerId]);
  }

  onSubmit() {
    this.saving.set(true);
    this.customerService.update(this.customerId, this.customer).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/customers/details', this.customerId]);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }
}
