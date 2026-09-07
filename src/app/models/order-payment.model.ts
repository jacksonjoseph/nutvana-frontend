export interface OrderPayment {
  id?: number;
  orderGroupId?: number;
  customerName?: string;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'RETURN_CREDIT';
  paymentType?: 'INITIAL' | 'DUE_RECEIVED' | 'REFUND';
  referenceNumber?: string;
  notes?: string;
  createdAt?: string;
}
