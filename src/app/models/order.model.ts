export interface OrderItem {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id?: number;
  customerId?: number;
  customerName?: string;
  salesPersonId?: number;
  salesPersonName?: string;
  isDirectSale?: boolean;
  amountCollected: number;
  amountBalance?: number;
  discount?: number;
  items: OrderItem[];
  orderDate?: string;
  totalAmount?: number;
}

export interface ParsedBillItem {
  extractedName: string;
  matchedProduct?: {
    id: number;
    name: string;
    code: string;
    maxRetailPrice: number;
    maxSalePrice: number;
  };
  quantity: number;
  unitPrice: number;
  confidence: number;
}

export interface BillParseResult {
  items: ParsedBillItem[];
  discount: number;
  amountCollected: number;
}

