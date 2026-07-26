import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SalesPersonService } from '../../../services/sales-person.service';
import { SalesPerson } from '../../../models/sales-person.model';

@Component({
  selector: 'app-sales-person-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Sales Partners</h1>
          <p class="page-subtitle">{{ totalElements() }} representatives</p>
        </div>
        <button class="fab" (click)="navigateToCreate()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <div class="search-bar">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          class="search-input"
          type="text"
          placeholder="Search sales representatives..."
          [ngModel]="searchTerm()"
          (ngModelChange)="onSearch($event)"
          name="salesPersonSearch"
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

      @if (loading() && salesPersons().length === 0) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading sales representatives...</p>
        </div>
      } @else if (salesPersons().length === 0) {
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h3>No Sales Partners Yet</h3>
          <p>Add your first sales representative to get started</p>
          <button class="btn-primary" (click)="navigateToCreate()">Add Sales Partner</button>
        </div>
      } @else {
        <div class="grid">
          @for (sp of salesPersons(); track sp.id) {
            <div class="card" (click)="navigateToView(sp.id!)">
              <div class="card-header">
                <div class="avatar">{{ getInitials(sp.name) }}</div>
                <div class="header-details">
                  <h3 class="card-title">{{ sp.name }}</h3>
                  <span class="status-badge" [class.active]="sp.isActive" [class.inactive]="!sp.isActive">
                    {{ sp.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
              <div class="card-meta">
                @if (sp.phone) {
                  <div class="meta-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>{{ sp.phone }}</span>
                  </div>
                }
                @if (sp.email) {
                  <div class="meta-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>{{ sp.email }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        @if (totalPages() > 1 && !searchTerm()) {
          <div class="pagination">
            <button class="btn-page" [disabled]="currentPage() === 0 || loading()" (click)="loadSalesPersons(currentPage() - 1)">Previous</button>
            <span class="page-info">Page {{ currentPage() + 1 }} of {{ totalPages() }}</span>
            <button class="btn-page" [disabled]="currentPage() >= totalPages() - 1 || loading()" (click)="loadSalesPersons(currentPage() + 1)">Next</button>
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
      padding: 0.7rem 2.5rem;
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
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 100px;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: var(--accent);
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
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
      flex-shrink: 0;
    }

    .header-details {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      flex: 1;
      min-width: 0;
    }

    .card-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status-badge {
      display: inline-block;
      align-self: flex-start;
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.05rem 0.3rem;
      border-radius: 0.25rem;
    }

    .status-badge.active {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }

    .status-badge.inactive {
      background: rgba(100, 116, 139, 0.15);
      color: #64748b;
    }

    .card-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      border-top: 1.5px solid var(--surface-border);
      padding-top: 0.5rem;
      margin-top: 0.25rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
export class SalesPersonListComponent implements OnInit {
  private salesPersonService = inject(SalesPersonService);
  private router = inject(Router);

  salesPersons = signal<SalesPerson[]>([]);
  loading = signal(true);
  searchTerm = signal('');

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(25);

  private searchTimeout: any;

  ngOnInit() {
    this.loadSalesPersons();
  }

  loadSalesPersons(page: number = 0) {
    this.loading.set(true);
    this.salesPersonService.getAll(page, this.pageSize()).subscribe({
      next: (data) => {
        this.salesPersons.set(data.content);
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

  onSearch(term: string) {
    this.searchTerm.set(term);
    clearTimeout(this.searchTimeout);

    if (!term.trim()) {
      this.loadSalesPersons();
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.loading.set(true);
      this.salesPersonService.search(term).subscribe({
        next: (data) => {
          this.salesPersons.set(data);
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
    this.loadSalesPersons();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  navigateToCreate() {
    this.router.navigate(['/sales-persons/create']);
  }

  navigateToView(id: number) {
    this.router.navigate(['/sales-persons/details', id]);
  }
}
