export interface CartItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subTotal: number;
  imageUrl: string | null;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subTotal: number;
  itemCount: number;
  couponCode: string | null;
}

export interface AddToCartInput {
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
}
