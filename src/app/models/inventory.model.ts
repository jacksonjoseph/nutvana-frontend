export enum InventoryTransactionType {
  PRODUCTION_IN = 'PRODUCTION_IN',
  SALES_RETURN = 'SALES_RETURN',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  SALE = 'SALE',
  WASTAGE = 'WASTAGE',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT'
}

export interface InventoryTransaction {
  id?: number;
  productId: number;
  quantity: number;
  transactionType: InventoryTransactionType;
  referenceId?: string;
  notes?: string;
  createdAt?: string;
}

export interface InventorySummary {
  quantity: number;
  reorderLevel: number;
  lastUpdated: string;
}
