import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SalesPersonService } from '../../../services/sales-person.service';
import { SalesPerson } from '../../../models/sales-person.model';

@Component({
  selector: 'app-sales-person-create-edit',
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
        <h1 class="form-title">{{ isEdit() ? 'Edit Sales Partner' : 'New Sales Partner' }}</h1>
        <div style="width: 36px;"></div>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      } @else {
        <form class="form-body" (ngSubmit)="onSubmit()" #salesPersonForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="name">Full Name</label>
            <input
              id="name"
              class="form-input"
              type="text"
              placeholder="e.g. John Doe"
              [(ngModel)]="salesPerson.name"
              name="name"
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
              [(ngModel)]="salesPerson.phone"
              name="phone"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              class="form-input"
              type="email"
              placeholder="e.g. john.doe@example.com"
              [(ngModel)]="salesPerson.email"
              name="email"
              required
            />
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="salesPerson.isActive"
                name="isActive"
              />
              <span class="checkbox-text">Active Representative</span>
            </label>
            <p class="checkbox-help">Inactive representatives cannot be assigned to new customers or orders.</p>
          </div>

          <div class="btn-row">
            <button type="button" class="cancel-btn" (click)="goBack()" [disabled]="saving()">Cancel</button>
            <button type="submit" class="submit-btn" [disabled]="saving() || !salesPersonForm.valid">
              @if (saving()) {
                <span class="btn-spinner"></span> Saving...
              } @else {
                {{ isEdit() ? 'Save Changes' : 'Create Sales Partner' }}
              }
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

    .checkbox-group {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      padding: 1rem;
      border-radius: 0.75rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.95rem;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--accent);
      cursor: pointer;
    }

    .checkbox-help {
      margin: 0.35rem 0 0 2rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .btn-row {
      display: flex;
      gap: 0.75rem;
      margin-top: 2rem;
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
export class SalesPersonCreateEditComponent implements OnInit {
  private salesPersonService = inject(SalesPersonService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  salesPerson: SalesPerson = {
    name: '',
    phone: '',
    email: '',
    isActive: true
  };

  loading = signal(false);
  saving = signal(false);
  isEdit = signal(false);
  private salesPersonId: number | null = null;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.salesPersonId = Number(idParam);
      this.loading.set(true);
      this.salesPersonService.getById(this.salesPersonId).subscribe({
        next: (data) => {
          this.salesPerson = data;
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/sales-persons']);
        }
      });
    }
  }

  goBack() {
    if (this.isEdit() && this.salesPersonId) {
      this.router.navigate(['/sales-persons/details', this.salesPersonId]);
    } else {
      this.router.navigate(['/sales-persons']);
    }
  }

  onSubmit() {
    this.saving.set(true);
    if (this.isEdit() && this.salesPersonId) {
      this.salesPersonService.update(this.salesPersonId, this.salesPerson).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/sales-persons/details', this.salesPersonId]);
        },
        error: () => {
          this.saving.set(false);
        }
      });
    } else {
      this.salesPersonService.create(this.salesPerson).subscribe({
        next: (created) => {
          this.saving.set(false);
          if (created && created.id) {
            this.router.navigate(['/sales-persons/details', created.id]);
          } else {
            this.router.navigate(['/sales-persons']);
          }
        },
        error: () => {
          this.saving.set(false);
        }
      });
    }
  }
}
