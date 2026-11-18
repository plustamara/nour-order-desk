export const STATUSES = ["Pending", "Preparing", "Delivered"] as const;

export type OrderStatus = (typeof STATUSES)[number];

export type Order = {
  id: string;
  customerName: string;
  phone: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: OrderStatus;
};

// What the client may send when creating an order
export type OrderInput = {
  customerName: string;
  phone: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

// What the client may send when updating an order (every field optional)
export type OrderUpdate = Partial<OrderInput> & { status?: OrderStatus };