export interface SalesPerson {
  id?: number;
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export interface SalesPersonInventory {
  id?: number;
  salesPersonId: number;
  salesPersonName?: string;
  productId: number;
  productName: string;
  quantity: number;
  lastUpdated?: string;
}

export enum SalesPersonInventoryTransactionType {
  ALLOCATION = 'ALLOCATION',
  SALE = 'SALE',
  RETURN = 'RETURN',
  WASTAGE = 'WASTAGE',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT'
}

export interface SalesPersonInventoryTransaction {
  id?: number;
  salesPersonId: number;
  salesPersonName?: string;
  productId: number;
  productName?: string;
  transactionType: SalesPersonInventoryTransactionType;
  quantity: number;
  referenceId?: string;
  notes?: string;
  createdAt?: string;
}
