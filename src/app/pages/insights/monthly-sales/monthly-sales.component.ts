import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { InsightsService, MonthlySale } from '../../../services/insights.service';

@Component({
  selector: 'app-monthly-sales',
  standalone: true,
  imports: [CurrencyPipe, NgClass],
  template: `
    <div class="view-container">
      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading monthly sales...</p>
        </div>
      } @else if (sales().length === 0) {
        <div class="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <p>No monthly sales data available</p>
        </div>
      } @else {
        <div class="section-label">Monthly revenue overview</div>

        <div class="content-layout">
          <!-- Bar Chart -->
          <div class="chart-container">
            <div class="chart-inner">
              <!-- Gridlines -->
              <div class="gridlines">
                <div class="gridline"></div>
                <div class="gridline"></div>
                <div class="gridline"></div>
                <div class="gridline"></div>
              </div>
              <!-- Bars -->
              <div class="bar-chart">
                @for (sale of salesSorted(); track sale.orderMonth) {
                  <div class="bar-group">
                    <div class="bar-wrap">
                      <span class="bar-value">{{ sale.totalAmount | currency:'INR':'₹':'1.0-0' }}</span>
                      <div class="bar" [style.height.%]="getBarHeight(sale.totalAmount)">
                        <div class="bar-shine"></div>
                      </div>
                    </div>
                    <div class="bar-label">
                      <span>{{ formatMonth(sale.orderMonth) }}</span>
                      <span class="bar-year">{{ sale.orderMonth.split('-')[0] }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Monthly Cards -->
          <div class="monthly-list">
            @for (sale of salesSorted(); track sale.orderMonth; let i = $index) {
              <div class="monthly-card">
                <div class="monthly-left">
                  <div class="month-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <span class="month-name">{{ formatMonth(sale.orderMonth) }}</span>
                    <span class="month-year">{{ sale.orderMonth.split('-')[0] }}</span>
                  </div>
                </div>
                <div class="monthly-right">
                  <span class="month-amount">{{ sale.totalAmount | currency:'INR':'₹':'1.0-0' }}</span>
                  @if (i > 0) {
                    <span class="month-change" [ngClass]="getGrowthClass(sale.totalAmount, salesSorted()[i - 1].totalAmount)">
                      {{ getGrowthText(sale.totalAmount, salesSorted()[i - 1].totalAmount) }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .view-container { animation: fadeInUp 0.3s ease both; }

    .section-label {
      font-size: 0.75rem; font-weight: 600; color: var(--text-secondary);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.85rem;
    }

    /* ---- Responsive layout ---- */
    .content-layout {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    @media (min-width: 768px) {
      .content-layout {
        flex-direction: row;
        align-items: flex-start;
        gap: 1.5rem;
      }
      .chart-container {
        flex: 0 0 55%;
        margin-bottom: 0 !important;
      }
      .monthly-list {
        flex: 1;
        min-width: 0;
      }
      .bar-chart {
        height: 420px !important;
      }
      .gridlines {
        padding-bottom: 2.5rem !important;
      }
    }

    /* Bar chart */
    .chart-container {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 1.25rem;
      padding: 1.5rem 1.25rem 1rem;
      margin-bottom: 0;
    }

    .chart-inner {
      position: relative;
    }

    .gridlines {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: none;
      padding-bottom: 2rem;
    }

    .gridline {
      width: 100%;
      height: 1px;
      background: var(--surface-border);
      opacity: 0.5;
    }

    .bar-chart {
      position: relative;
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      height: 300px;
      padding-bottom: 2rem;
    }

    .bar-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      height: 100%;
      justify-content: flex-end;
    }

    .bar-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      width: 100%;
      flex: 1;
      justify-content: flex-end;
    }

    .bar-value {
      font-size: 0.62rem;
      font-weight: 700;
      color: var(--text-secondary);
      white-space: nowrap;
      text-align: center;
    }

    .bar {
      position: relative;
      width: 100%;
      border-radius: 0.5rem 0.5rem 0 0;
      background: var(--accent-gradient);
      min-height: 4px;
      transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 -2px 16px rgba(99, 102, 241, 0.4);
      overflow: hidden;
    }

    .bar-shine {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 40%;
      background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%);
      border-radius: inherit;
    }

    .bar-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-align: center;
      padding-top: 0.5rem;
      line-height: 1.2;
    }

    .bar-year {
      font-size: 0.6rem;
      font-weight: 600;
      color: var(--text-placeholder);
    }

    /* Monthly cards */
    .monthly-list { display: flex; flex-direction: column; gap: 0.6rem; }
    .monthly-card {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--surface-card); border: 1px solid var(--surface-border);
      border-radius: 0.9rem; padding: 0.9rem 1rem; transition: all 0.2s ease;
    }
    .monthly-card:hover { border-color: var(--accent); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }

    .monthly-left { display: flex; align-items: center; gap: 0.75rem; }
    .month-icon {
      width: 38px; height: 38px; border-radius: 10px;
      background: var(--accent-subtle); color: var(--accent-light);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .month-name { display: block; font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
    .month-year { display: block; font-size: 0.72rem; color: var(--text-secondary); }

    .monthly-right { display: flex; flex-direction: column; align-items: flex-end; }
    .month-amount { font-size: 1rem; font-weight: 800; color: var(--text-primary); }
    .month-change { font-size: 0.72rem; font-weight: 600; margin-top: 0.1rem; }
    .month-change.up { color: var(--success); }
    .month-change.down { color: var(--danger); }

    /* Loading / empty */
    .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1rem; color: var(--text-secondary); }
    .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--surface-border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 1rem; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; color: var(--text-secondary); text-align: center; gap: 0.75rem; }
    .empty-state svg { opacity: 0.3; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MonthlySalesComponent implements OnInit {
  private insightsService = inject(InsightsService);

  sales = signal<MonthlySale[]>([]);
  loading = signal(true);

  salesSorted = computed(() =>
    [...this.sales()].sort((a, b) => a.orderMonth.localeCompare(b.orderMonth))
  );

  maxAmount = computed(() =>
    Math.max(...this.salesSorted().map(s => s.totalAmount), 1)
  );

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.insightsService.getMonthlySales().subscribe({
      next: (data) => { this.sales.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getBarHeight(amount: number): number {
    return Math.max((amount / this.maxAmount()) * 100, 5);
  }

  formatMonth(orderMonth: string): string {
    const [year, month] = orderMonth.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
  }

  getGrowthText(current: number, previous: number): string {
    if (previous === 0) return '';
    const pct = ((current - previous) / previous) * 100;
    return `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(1)}%`;
  }

  getGrowthClass(current: number, previous: number): string {
    return current >= previous ? 'up' : 'down';
  }
}
