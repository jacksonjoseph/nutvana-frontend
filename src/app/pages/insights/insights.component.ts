import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Insights</h1>
          <p class="page-subtitle">Business analytics at a glance</p>
        </div>
      </div>

      <div class="tab-bar">
        <a routerLink="top-customers" routerLinkActive="active" class="tab-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Top Customers</span>
        </a>
        <a routerLink="top-products" routerLinkActive="active" class="tab-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <span>Top Products</span>
        </a>
        <a routerLink="monthly-sales" routerLinkActive="active" class="tab-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span>Monthly Sales</span>
        </a>
      </div>

      <router-outlet />
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page-container {
      padding: 1rem;
      padding-bottom: 5rem;
    }

    .page-header { margin-bottom: 1.5rem; }

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

    .tab-bar {
      display: flex;
      gap: 0.5rem;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 1rem;
      padding: 0.35rem;
      margin-bottom: 1.5rem;
      text-decoration: none;
    }

    .tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.65rem 0.5rem;
      background: none;
      border: none;
      border-radius: 0.7rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      text-decoration: none;
    }

    .tab-btn:hover {
      color: var(--text-primary);
      background: var(--surface-hover);
    }

    .tab-btn.active {
      background: var(--accent-gradient);
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }
  `]
})
export class InsightsComponent {}
