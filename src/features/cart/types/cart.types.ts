import { Product, ProductVariant, SellingPlan } from '../../products/types/product.types';

export type PurchaseType = 'one-time' | 'subscription';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  purchaseType?: PurchaseType;
  sellingPlan?: SellingPlan;
  subscriptionDiscount?: number; // e.g. 10 (%)
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  totalQuantity: number;
  currency: string;
  checkoutUrl?: string;
}

