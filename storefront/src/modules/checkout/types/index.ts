export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  governorate: string;
  postalCode: string;
}

export interface PlaceOrderInput {
  shippingAddress: ShippingAddressInput;
  couponCode?: string;
  discountAmount: number;
  notes?: string;
}

export interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  total: number;
  placedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subTotal: number;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  placedAt: string;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[];
  shippingAddress: ShippingAddressInput;
  subTotal: number;
  discountAmount: number;
  shippingFee: number;
  couponCode?: string;
  notes?: string;
}
