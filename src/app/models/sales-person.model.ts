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
