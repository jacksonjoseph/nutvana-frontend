export interface OrderPayment {
  id?: number;
  orderGroupId?: number;
  customerName?: string;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE';
  referenceNumber?: string;
  notes?: string;
  createdAt?: string;
}
