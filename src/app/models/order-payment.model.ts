export interface OrderPayment {
  id?: number;
  orderGroupId?: number;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE';
  referenceNumber?: string;
  notes?: string;
  createdAt?: string;
}
