import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer.model';
import { SalesPersonService } from '../../../services/sales-person.service';
import { SalesPerson } from '../../../models/sales-person.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Customers</h1>
          <p class="page-subtitle">{{ totalElements() }} contacts</p>
        </div>
        <button class="fab" (click)="navigateToCreate()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <div class="controls-container" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; align-items: center; position: relative;">
        <div class="search-bar" style="flex: 1; margin-bottom: 0; position: relative;">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            class="search-input"
            type="text"
            placeholder="Search customers..."
            [ngModel]="searchTerm()"
            (ngModelChange)="onSearch($event)"
            name="customerSearch"
            style="width: 100%; box-sizing: border-box;"
          />
          @if (searchTerm()) {
            <button class="search-clear" (click)="clearSearch()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          }
        </div>

        <!-- Sales Person Multi-select Dropdown Filter -->
        <div class="filter-dropdown-container" style="position: relative; display: inline-block;">
          <button type="button" class="btn-filter" (click)="toggleFilterDropdown()" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1rem; background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 0.75rem; color: var(--text-primary); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <span>Agent Filter</span>
            @if (selectedSalesPersonIds().length > 0) {
              <span class="badge" style="background: var(--accent); color: white; font-size: 0.7rem; font-weight: 700; padding: 0.1rem 0.35rem; border-radius: 0.3rem;">
                {{ selectedSalesPersonIds().length }}
              </span>
            }
          </button>

          @if (showFilterDropdown()) {
            <div class="backdrop" (click)="showFilterDropdown.set(false)" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99; background: transparent;"></div>
            <div class="filter-dropdown-menu" style="position: absolute; right: 0; top: calc(100% + 0.5rem); z-index: 100; width: 220px; background: var(--surface-card); border: 1.5px solid var(--surface-border); border-radius: 0.85rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2); padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="font-weight: 700; font-size: 0.8rem; color: var(--text-secondary); border-bottom: 1px solid var(--surface-border); padding-bottom: 0.35rem; display: flex; justify-content: space-between; align-items: center;">
                <span>FILTER BY AGENT</span>
                @if (selectedSalesPersonIds().length > 0) {
                  <button type="button" (click)="clearFilter()" style="background: none; border: none; color: var(--accent); font-size: 0.75rem; font-weight: 700; cursor: pointer; padding: 0;">Clear</button>
                }
              </div>
              <div class="dropdown-list" style="max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.4rem;">
                @for (sp of salesPersons(); track sp.id) {
                  <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-primary); cursor: pointer; padding: 0.25rem 0; user-select: none;">
                    <input type="checkbox" [checked]="isSalesPersonSelected(sp.id!)" (change)="toggleSalesPersonSelection(sp.id!)" style="accent-color: var(--accent); width: 15px; height: 15px;" />
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ sp.name }}</span>
                  </label>
                } @empty {
                  <div style="font-size: 0.75rem; color: var(--text-secondary); text-align: center; padding: 0.5rem 0;">No agents found</div>
                }
              </div>
            </div>
          }
        </div>
      </div>

      @if (loading() && customers().length === 0) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading customers...</p>
        </div>
      } @else if (customers().length === 0) {
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h3>No Customers Found</h3>
          <p>Modify filters or add a new customer</p>
          <button class="btn-primary" (click)="navigateToCreate()">Add Customer</button>
        </div>
      } @else {
        <div class="grid">
          @for (customer of customers(); track customer.id) {
            <div class="card" (click)="navigateToView(customer.id!)">
              <div class="card-header">
                <div class="avatar">{{ getInitials(customer.name) }}</div>
                <h3 class="card-title">{{ customer.name }}</h3>
              </div>
              <div class="card-meta">
                <div class="meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{{ customer.location }}</span>
                </div>
                @if (customer.salesPersonNames && customer.salesPersonNames.length > 0) {
                  <div class="meta-item" style="margin-top: 0.25rem; display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-secondary); flex-shrink: 0;">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    @for (name of customer.salesPersonNames; track name) {
                      <span class="sp-badge" style="font-size: 0.7rem; font-weight: 700; background: var(--accent-subtle); color: var(--accent); padding: 0.05rem 0.35rem; border-radius: 0.25rem;">
                        {{ name }}
                      </span>
                    }
                  </div>
                } @else if (customer.salesPersonName) {
                  <div class="meta-item" style="margin-top: 0.15rem;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>SP: {{ customer.salesPersonName }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        @if (totalPages() > 1 && !searchTerm()) {
          <div class="pagination">
            <button class="btn-page" [disabled]="currentPage() === 0 || loading()" (click)="loadCustomers(currentPage() - 1)">Previous</button>
            <span class="page-info">Page {{ currentPage() + 1 }} of {{ totalPages() }}</span>
            <button class="btn-page" [disabled]="currentPage() >= totalPages() - 1 || loading()" (click)="loadCustomers(currentPage() + 1)">Next</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page-container {
      padding: 1rem;
      padding-bottom: 5rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }

    .page-subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0.25rem 0 0;
    }

    .fab {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: var(--accent-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      transition: all 0.3s ease;
    }

    .fab:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }

    .search-bar {
      position: relative;
      margin-bottom: 1rem;
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.7rem 2.5rem 0.7rem 2.5rem;
      background: var(--surface-card);
      border: 1.5px solid var(--surface-border);
      border-radius: 0.75rem;
      font-size: 0.85rem;
      color: var(--text-primary);
      font-family: inherit;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-subtle);
    }

    .search-input::placeholder { color: var(--text-placeholder); }

    .search-clear {
      position: absolute;
      right: 0.6rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.3rem;
      display: flex;
      transition: all 0.2s;
    }

    .search-clear:hover {
      color: var(--text-primary);
      background: var(--surface-hover);
    }

    .btn-filter:hover {
      border-color: var(--accent) !important;
      color: var(--accent) !important;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.75rem;
    }

    .card {
      background: var(--surface-card);
      border-radius: 0.85rem;
      padding: 0.85rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid var(--surface-border);
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: var(--accent);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.3rem;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 700;
    }

    .card-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .card-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .meta-item svg {
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

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
      text-align: center;
      color: var(--text-secondary);
    }

    .empty-state svg {
      margin-bottom: 1.5rem;
      opacity: 0.4;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      color: var(--text-primary);
      margin: 0 0 0.5rem;
    }

    .empty-state p {
      margin: 0 0 1.5rem;
    }

    .btn-primary {
      background: var(--accent-gradient);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 0.75rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-page {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-page:hover:not(:disabled) {
      border-color: var(--accent);
      color: var(--accent);
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);
  private salesPersonService = inject(SalesPersonService);
  private router = inject(Router);

  customers = signal<Customer[]>([]);
  salesPersons = signal<SalesPerson[]>([]);
  selectedSalesPersonIds = signal<number[]>([]);
  showFilterDropdown = signal(false);

  loading = signal(true);
  searchTerm = signal('');

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(25);

  private searchTimeout: any;

  ngOnInit() {
    this.loadSalesPersons();
    this.loadCustomers();
  }

  loadSalesPersons() {
    this.salesPersonService.getAll(0, 100).subscribe({
      next: (data) => {
        this.salesPersons.set(data.content || []);
      }
    });
  }

  loadCustomers(page: number = 0) {
    this.loading.set(true);
    this.customerService.getAll(page, this.pageSize(), this.selectedSalesPersonIds()).subscribe({
      next: (data) => {
        this.customers.set(data.content);
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
    this.showFilterDropdown.update(show => !show);
  }

  toggleSalesPersonSelection(id: number) {
    const current = [...this.selectedSalesPersonIds()];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    this.selectedSalesPersonIds.set(current);

    // Reload search or paginated results
    if (this.searchTerm().trim()) {
      this.onSearch(this.searchTerm());
    } else {
      this.loadCustomers(0);
    }
  }

  isSalesPersonSelected(id: number): boolean {
    return this.selectedSalesPersonIds().includes(id);
  }

  clearFilter() {
    this.selectedSalesPersonIds.set([]);
    if (this.searchTerm().trim()) {
      this.onSearch(this.searchTerm());
    } else {
      this.loadCustomers(0);
    }
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    clearTimeout(this.searchTimeout);

    if (!term.trim() && this.selectedSalesPersonIds().length === 0) {
      this.loadCustomers();
      return;
    }

    if (!term.trim()) {
      this.loadCustomers(0);
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.loading.set(true);
      this.customerService.search(term, this.selectedSalesPersonIds()).subscribe({
        next: (data) => {
          this.customers.set(data);
          this.currentPage.set(0);
          this.totalPages.set(1);
          this.totalElements.set(data.length);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }, 300);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.loadCustomers();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  navigateToCreate() {
    this.router.navigate(['/customers/create']);
  }

  navigateToView(id: number) {
    this.router.navigate(['/customers/details', id]);
  }
}
