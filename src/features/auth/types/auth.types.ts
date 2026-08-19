export type UserRole = 'admin' | 'customer';

export interface CustomerAddress {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  // Legacy compat aliases (mapped from Shopify fields)
  street: string;      // = address1
  state: string;       // = province
  postalCode: string;  // = zip
}

export interface CustomerOrderLineItem {
  title: string;
  quantity: number;
  variant?: {
    title: string;
    price: { amount: string; currencyCode: string };
  };
}

export interface CustomerOrder {
  id: string;
  orderNumber: number;
  name: string; // e.g. "#1001"
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: CustomerOrderLineItem[];
  statusUrl?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  ordersCount?: number;
  addresses?: CustomerAddress[];
  defaultAddress?: CustomerAddress;
  orders?: CustomerOrder[];
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token?: string;
}
