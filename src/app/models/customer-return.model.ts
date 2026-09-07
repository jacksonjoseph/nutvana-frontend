export interface CustomerReturn {
  id?: number;
  customerId: number;
  customerName?: string;
  salesPersonId: number;
  salesPersonName?: string;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  returnAmount?: number;
  settlementType?: 'STORE_CREDIT' | 'SALES_PERSON_PAID';
  notes?: string;
  createdAt?: string;
}
