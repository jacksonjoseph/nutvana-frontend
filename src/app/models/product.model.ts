export interface Inventory {
  id?: number;
  productId?: number;
  quantity: number;
  reorderLevel: number;
  lastUpdated?: string;
}

export interface Product {
  id?: number;
  name: string;
  code: string;
  maxRetailPrice: number;
  maxSalePrice: number;
  inventory?: Inventory;
}
