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
