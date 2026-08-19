import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, PurchaseType } from '../types/cart.types';
import { Product, ProductVariant, SellingPlan } from '../../products/types/product.types';
import { env } from '../../../config/env';

interface CartStoreState {
  items: CartItem[];
  addItem: (
    product: Product,
    variant?: ProductVariant,
    quantity?: number,
    purchaseType?: PurchaseType,
    sellingPlan?: SellingPlan
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalQuantity: () => number;
  getSubtotal: () => number;
  getItemUnitPrice: (item: CartItem) => number;
  createCheckoutUrl: () => Promise<string>;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, selectedVariant, quantity = 1, purchaseType = 'one-time', sellingPlan) => {
        const variant = selectedVariant || product.variants[0] || {
          id: `${product.id}_default`,
          title: 'Default',
          price: product.price,
          available: true,
          options: [],
        };

        const discount = purchaseType === 'subscription' ? (sellingPlan?.discountPercentage || 10) : 0;
        const planKey = sellingPlan?.id || (purchaseType === 'subscription' ? 'sub-default' : 'one-time');
        const itemId = `${product.id}_${variant.id}_${purchaseType}_${planKey}`;
        const existingIndex = get().items.findIndex((item) => item.id === itemId);

        if (existingIndex > -1) {
          const updated = [...get().items];
          updated[existingIndex].quantity = quantity;
          updated[existingIndex].variant = variant;
          updated[existingIndex].product = product;
          updated[existingIndex].purchaseType = purchaseType;
          updated[existingIndex].sellingPlan = sellingPlan;
          updated[existingIndex].subscriptionDiscount = discount;
          set({ items: updated });
        } else {

          set({
            items: [
              ...get().items,
              {
                id: itemId,
                productId: product.id,
                variantId: variant.id,
                product,
                variant,
                quantity,
                purchaseType,
                sellingPlan,
                subscriptionDiscount: discount,
              },
            ],
          });
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
        });
      },

      clearCart: () => set({ items: [] }),

      getItemUnitPrice: (item: CartItem) => {
        const basePrice = item.variant.price || item.product.price;
        if (item.purchaseType === 'subscription') {
          const discount = item.subscriptionDiscount ?? 10;
          return basePrice * (1 - discount / 100);
        }
        return basePrice;
      },

      getTotalQuantity: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const unitPrice = get().getItemUnitPrice(item);
          return total + unitPrice * item.quantity;
        }, 0);
      },

      createCheckoutUrl: async (): Promise<string> => {
        const items = get().items;
        if (items.length === 0) throw new Error('Cart is empty.');

        if (env.apiProvider === 'shopify' && env.shopifyDomain && env.shopifyStorefrontToken) {
          const endpoint = `https://${env.shopifyDomain}/api/2024-10/graphql.json`;
          const lines = items.map((item) => {
            const line: Record<string, unknown> = {
              merchandiseId: item.variantId,
              quantity: item.quantity,
            };
            if (item.sellingPlan?.id && item.sellingPlan.id.startsWith('gid://')) {
              line.sellingPlanId = item.sellingPlan.id;
            }
            return line;
          });

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': env.shopifyStorefrontToken,
            },
            body: JSON.stringify({
              query: `
                mutation createStorefrontCart($lines: [CartLineInput!]) {
                  cartCreate(input: { lines: $lines }) {
                    cart {
                      id
                      checkoutUrl
                    }
                    userErrors {
                      field
                      message
                    }
                  }
                }
              `,
              variables: { lines },
            }),
          });

          const json = await res.json();
          if (json.data?.cartCreate?.cart?.checkoutUrl) {
            return json.data.cartCreate.cart.checkoutUrl;
          }
          if (json.data?.cartCreate?.userErrors?.length) {
            throw new Error(json.data.cartCreate.userErrors[0].message);
          }
        }

        // Fallback fallback URL
        return `https://${env.shopifyDomain || '47751d.myshopify.com'}/cart`;
      },
    }),
    {
      name: 'monts-cart-storage',
    }
  )
);

