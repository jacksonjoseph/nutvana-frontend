import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-print-invoice',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        
        <div class="modal-header">
          <h2 class="modal-title">Print Invoice</h2>
          <div class="header-actions">
            <button class="action-btn secondary" (click)="close.emit()">
              Cancel
            </button>
            <button class="action-btn micro" (click)="printInvoice('micro')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2"/>
                <path d="M12 12h.01"/>
              </svg>
              Micro Print
            </button>
            <button class="action-btn primary" (click)="printInvoice('A4')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              A4 Print
            </button>
            <button class="action-btn a2" (click)="printInvoice('A2')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              A2 Print
            </button>
            <button class="action-btn download" (click)="downloadPdf()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        <div class="invoice-preview" id="print-area">
          <div class="invoice-header">
            <div class="company-info">
              <h1 class="company-name">Nutvana Enterprises</h1>
              <p class="company-address">Meadows Lane, Nalumukku,</p>
              <p class="company-address">Thundathil PO, Kariyavattom,</p>
              <p class="company-address">Thiruvananthapuram, PIN: 695581</p>
            </div>
            <div class="invoice-meta">
              <h2>Invoice: #{{ orderId }}</h2>
              <p><strong>Date:</strong> {{ date | date:'mediumDate' }}</p>
            </div>
          </div>

          <div class="customer-info">
            <h3>Bill To:</h3>
            <p><strong>{{ customerName }}</strong></p>
            <p>{{ customerLocation }}</p>
            <p>{{ customerPhone }}</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items; track item.productId) {
                <tr>
                  <td>{{ item.productName }}</td>
                  <td class="text-center">{{ item.quantity }}</td>
                  <td class="text-right">{{ item.unitPrice | currency:'INR':'₹':'1.2-2' }}</td>
                  <td class="text-right">{{ (item.quantity * item.unitPrice) | currency:'INR':'₹':'1.2-2' }}</td>
                </tr>
              }
            </tbody>
          </table>

          <div class="invoice-summary">
            <div class="summary-row">
              <span>Total Amount:</span>
              <span><strong>{{ totalAmount | currency:'INR':'₹':'1.2-2' }}</strong></span>
            </div>
            @if (discount > 0) {
              <div class="summary-row">
                <span>Discount:</span>
                <span style="color:#16a34a">- {{ discount | currency:'INR':'₹':'1.2-2' }}</span>
              </div>
            }
            <div class="summary-row">
              <span>Amount Received:</span>
              <span>{{ amountCollected | currency:'INR':'₹':'1.2-2' }}</span>
            </div>
            <div class="summary-row balance">
              <span>Balance Due:</span>
              <span><strong>{{ (totalAmount - discount - amountCollected) | currency:'INR':'₹':'1.2-2' }}</strong></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--surface-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      background: white;
      z-index: 10;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 0.4rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s;
      border: none;
      white-space: nowrap;
    }

    .action-btn.secondary {
      background: var(--surface-ground);
      color: var(--text-primary);
      border: 1px solid var(--surface-border);
    }

    .action-btn.secondary:hover {
      background: var(--surface-hover);
    }

    .action-btn.micro {
      background: #f59e0b;
      color: white;
    }

    .action-btn.micro:hover {
      background: #d97706;
    }

    .action-btn.primary {
      background: var(--accent, #6366f1);
      color: white;
    }

    .action-btn.primary:hover {
      background: var(--accent-hover, #4f46e5);
    }

    .action-btn.a2 {
      background: #8b5cf6;
      color: white;
    }

    .action-btn.a2:hover {
      background: #7c3aed;
    }

    .action-btn.download {
      background: #10b981;
      color: white;
    }

    .action-btn.download:hover {
      background: #059669;
    }

    .invoice-preview {
      padding: 2.5rem;
      background: white;
      color: #000;
    }

    .invoice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
      border-bottom: 2px solid #eee;
      padding-bottom: 1rem;
    }

    .company-name {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0 0 0.25rem;
      color: #000;
    }

    .company-address {
      margin: 0;
      font-size: 0.9rem;
      color: #444;
    }

    .invoice-meta h2 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      color: #666;
      text-align: right;
    }

    .invoice-meta p {
      margin: 0 0 0.25rem;
      text-align: right;
      font-size: 0.95rem;
    }

    .customer-info {
      margin-bottom: 2rem;
    }

    .customer-info h3 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      color: #666;
    }

    .customer-info p {
      margin: 0 0 0.25rem;
      font-size: 0.95rem;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
    }

    .items-table th,
    .items-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
      font-size: 0.95rem;
    }

    .items-table th {
      text-align: left;
      font-weight: 600;
      background: #f9f9f9;
      color: #333;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }

    .invoice-summary {
      width: 300px;
      margin-left: auto;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.95rem;
    }

    .summary-row.balance {
      border-top: 2px solid #eee;
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      font-size: 1.1rem;
    }
  `]
})
export class PrintInvoiceComponent {
  @Input() orderId!: number;
  @Input() date!: Date | string | number | null;
  @Input() customerName!: string;
  @Input() customerLocation!: string;
  @Input() customerPhone!: string;
  @Input() items: any[] = [];
  @Input() totalAmount: number = 0;
  @Input() discount: number = 0;
  @Input() amountCollected: number = 0;

  @Output() close = new EventEmitter<void>();

  private formatCurrency(value: number): string {
    return '₹' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  private formatDate(value: Date | string | number | null): string {
    if (!value) return '';
    const d = new Date(value);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  private buildMicroReceiptHtml(): string {
    const itemsHtml = this.items.map(item => `
      <div class="item-row">
        <div class="item-name">${item.productName}</div>
        <div class="item-detail">
          <span>${item.quantity} x ${this.formatCurrency(item.unitPrice)}</span>
          <span>${this.formatCurrency(item.quantity * item.unitPrice)}</span>
        </div>
      </div>
    `).join('');

    const balanceDue = this.totalAmount - this.discount - this.amountCollected;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt #${this.orderId}</title>
        <style>
          @page {
            size: 48mm auto;
            margin: 2mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            color: #000;
            background: white;
            font-size: 8px;
            line-height: 1.3;
            width: 44mm;
          }
          .receipt {
            padding: 1mm;
          }
          .center {
            text-align: center;
          }
          .company-name {
            font-size: 10px;
            font-weight: 800;
            text-align: center;
            margin-bottom: 1px;
          }
          .company-address {
            text-align: center;
            font-size: 7px;
            color: #333;
          }
          .divider {
            border: none;
            border-top: 1px dashed #000;
            margin: 3px 0;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 8px;
          }
          .section-title {
            font-weight: 700;
            font-size: 8px;
            margin-bottom: 2px;
          }
          .customer-name {
            font-weight: 700;
            font-size: 8px;
          }
          .customer-detail {
            font-size: 7px;
          }
          .item-row {
            margin-bottom: 3px;
          }
          .item-name {
            font-size: 8px;
            font-weight: 600;
          }
          .item-detail {
            display: flex;
            justify-content: space-between;
            font-size: 7px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            padding: 1px 0;
          }
          .total-row.grand {
            font-weight: 800;
            font-size: 9px;
          }
          .total-row.balance {
            font-weight: 800;
            font-size: 9px;
          }
          .footer {
            text-align: center;
            font-size: 7px;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="company-name">Nutvana Enterprises</div>
          <div class="company-address">Meadows Lane, Nalumukku</div>
          <div class="company-address">Thundathil PO, Kariyavattom</div>
          <div class="company-address">TVM, PIN: 695581</div>

          <hr class="divider">

          <div class="meta-row">
            <span>Invoice: #${this.orderId}</span>
            <span>${this.formatDate(this.date)}</span>
          </div>

          <hr class="divider">

          <div class="section-title">Bill To:</div>
          <div class="customer-name">${this.customerName}</div>
          <div class="customer-detail">${this.customerLocation}</div>
          <div class="customer-detail">${this.customerPhone}</div>

          <hr class="divider">

          ${itemsHtml}

          <hr class="divider">

          <div class="total-row grand">
            <span>Total:</span>
            <span>${this.formatCurrency(this.totalAmount)}</span>
          </div>
          ${this.discount > 0 ? `<div class="total-row">
            <span>Discount:</span>
            <span>-${this.formatCurrency(this.discount)}</span>
          </div>` : ''}
          <div class="total-row">
            <span>Received:</span>
            <span>${this.formatCurrency(this.amountCollected)}</span>
          </div>
          <div class="total-row balance">
            <span>Balance:</span>
            <span>${this.formatCurrency(balanceDue)}</span>
          </div>

          <hr class="divider">

          <div class="footer">Thank you for your business!</div>
        </div>
      </body>
      </html>
    `;
  }

  private buildInvoiceHtml(pageSize: string, margin: string): string {
    const itemsHtml = this.items.map(item => `
      <tr>
        <td>${item.productName}</td>
        <td style="text-align:center;">${item.quantity}</td>
        <td style="text-align:right;">${this.formatCurrency(item.unitPrice)}</td>
        <td style="text-align:right;">${this.formatCurrency(item.quantity * item.unitPrice)}</td>
      </tr>
    `).join('');

    const balanceDue = this.totalAmount - this.discount - this.amountCollected;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${this.orderId}</title>
        <style>
          @page {
            size: ${pageSize};
            margin: ${margin};
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #000;
            background: white;
            font-size: 14px;
            line-height: 1.4;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
            border-bottom: 2px solid #eee;
            padding-bottom: 12px;
          }
          .company-name {
            font-size: 22px;
            font-weight: 800;
            margin-bottom: 4px;
          }
          .company-address {
            font-size: 13px;
            color: #444;
            margin: 0;
          }
          .invoice-meta h2 {
            font-size: 22px;
            color: #666;
            text-align: right;
            margin-bottom: 6px;
          }
          .invoice-meta p {
            text-align: right;
            font-size: 14px;
            margin: 2px 0;
          }
          .customer-info {
            margin-bottom: 24px;
          }
          .customer-info h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 6px;
          }
          .customer-info p {
            font-size: 14px;
            margin: 2px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          th, td {
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
            font-size: 14px;
          }
          th {
            text-align: left;
            font-weight: 600;
            background: #f9f9f9;
            color: #333;
          }
          .invoice-summary {
            width: 280px;
            margin-left: auto;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 14px;
          }
          .summary-row.balance {
            border-top: 2px solid #eee;
            margin-top: 6px;
            padding-top: 10px;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">s
          <div>
            <div class="company-name">Nutvana Enterprises</div>
            <p class="company-address">Meadows Lane, Nalumukku,</p>
            <p class="company-address">Thundathil PO, Kariyavattom,</p>
            <p class="company-address">Thiruvananthapuram, PIN: 695581</p>
          </div>
          <div class="invoice-meta">
            <h2>Invoice: #${this.orderId}</h2>
            <p><strong>Date:</strong> ${this.formatDate(this.date)}</p>
          </div>
        </div>

        <div class="customer-info">
          <h3>Bill To:</h3>
          <p><strong>${this.customerName}</strong></p>
          <p>${this.customerLocation}</p>
          <p>${this.customerPhone}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="invoice-summary">
          <div class="summary-row">
            <span>Total Amount:</span>
            <span><strong>${this.formatCurrency(this.totalAmount)}</strong></span>
          </div>
          ${this.discount > 0 ? `<div class="summary-row">
            <span>Discount:</span>
            <span style="color:#16a34a">-${this.formatCurrency(this.discount)}</span>
          </div>` : ''}
          <div class="summary-row">
            <span>Amount Received:</span>
            <span>${this.formatCurrency(this.amountCollected)}</span>
          </div>
          <div class="summary-row balance">
            <span>Balance Due:</span>
            <span><strong>${this.formatCurrency(balanceDue)}</strong></span>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private openAndPrint(html: string) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  printInvoice(format: 'micro' | 'A4' | 'A2') {
    if (format === 'micro') {
      const html = this.buildMicroReceiptHtml();
      this.openAndPrint(html);
    } else if (format === 'A4') {
      const html = this.buildInvoiceHtml('A4', '15mm');
      this.openAndPrint(html);
    } else if (format === 'A2') {
      const html = this.buildInvoiceHtml('A2', '15mm');
      this.openAndPrint(html);
    }
  }

  downloadPdf() {
    const html = this.buildInvoiceHtml('A4', '15mm');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }
}
