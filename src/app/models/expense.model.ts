export enum PaymentMode {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  WALLET = 'WALLET'
}

export interface Expense {
  id?: number;
  categoryId: number;
  categoryName?: string;
  amount: number;
  paymentMode: PaymentMode | string;
  description?: string;
  referenceNumber?: string;
  vendorName?: string;
  laborId?: number;
  laborName?: string;
  salesPersonId?: number;
  salesPersonName?: string;
  createdAt?: string;
}
