import { env } from '../../../config/env';
import {
  UserProfile,
  CustomerAddress,
  CustomerOrder,
} from '../../../features/auth/types/auth.types';

const ENDPOINT = `https://${env.shopifyDomain}/api/2024-10/graphql.json`;
const TOKEN = env.shopifyStorefrontToken;

// ---------------------------------------------------------------------------
// Generic Storefront GraphQL fetcher
// ---------------------------------------------------------------------------
async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ---------------------------------------------------------------------------
// GraphQL fragments & queries
// ---------------------------------------------------------------------------
const CUSTOMER_FRAGMENT = /* GraphQL */ `
  fragment CustomerFields on Customer {
    id
    email
    firstName
    lastName
    phone
    numberOfOrders
    defaultAddress {
      id
      firstName
      lastName
      address1
      address2
      city
      province
      zip
      country
      phone
    }
    addresses(first: 10) {
      edges {
        node {
          id
          firstName
          lastName
          address1
          address2
          city
          province
          zip
          country
          phone
        }
      }
    }
    orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
      edges {
        node {
          id
          orderNumber
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPriceV2 { amount currencyCode }
          lineItems(first: 5) {
            edges {
              node {
                title
                quantity
                variant {
                  title
                  priceV2 { amount currencyCode }
                }
              }
            }
          }
          statusUrl
        }
      }
    }
  }
`;

const CREATE_CUSTOMER_MUTATION = /* GraphQL */ `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id email firstName lastName }
      customerUserErrors { code field message }
    }
  }
`;

const CREATE_ACCESS_TOKEN_MUTATION = /* GraphQL */ `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code field message }
    }
  }
`;

const DELETE_ACCESS_TOKEN_MUTATION = /* GraphQL */ `
  mutation customerAccessTokenDelete($token: String!) {
    customerAccessTokenDelete(customerAccessToken: $token) {
      deletedAccessToken
      userErrors { field message }
    }
  }
`;

const GET_CUSTOMER_QUERY = /* GraphQL */ `
  query getCustomer($token: String!) {
    customer(customerAccessToken: $token) {
      ...CustomerFields
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

const RECOVER_CUSTOMER_MUTATION = /* GraphQL */ `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors { code field message }
    }
  }
`;

const RESET_BY_URL_MUTATION = /* GraphQL */ `
  mutation customerResetByUrl($resetUrl: URL!, $password: String!) {
    customerResetByUrl(resetUrl: $resetUrl, password: $password) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code field message }
    }
  }
`;

const UPDATE_CUSTOMER_MUTATION = /* GraphQL */ `
  mutation customerUpdate($token: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $token, customer: $customer) {
      customer {
        ...CustomerFields
      }
      customerUserErrors { code field message }
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

// ---------------------------------------------------------------------------
// Response shape helpers
// ---------------------------------------------------------------------------
interface ShopifyUserError {
  code: string;
  field: string[];
  message: string;
}

interface RawAddress {
  id: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

interface RawOrderLineItem {
  title: string;
  quantity: number;
  variant?: {
    title: string;
    priceV2: { amount: string; currencyCode: string };
  };
}

interface RawOrder {
  id: string;
  orderNumber: number;
  name: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPriceV2: { amount: string; currencyCode: string };
  lineItems: { edges: { node: RawOrderLineItem }[] };
  statusUrl?: string;
}

interface RawCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  numberOfOrders?: number;
  defaultAddress?: RawAddress;
  addresses: { edges: { node: RawAddress }[] };
  orders: { edges: { node: RawOrder }[] };
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------
function mapAddress(node: RawAddress, isDefault: boolean): CustomerAddress {
  return {
    id: node.id,
    firstName: node.firstName,
    lastName: node.lastName,
    address1: node.address1 || '',
    address2: node.address2,
    city: node.city || '',
    province: node.province,
    zip: node.zip || '',
    country: node.country || '',
    phone: node.phone,
    isDefault,
    // Legacy aliases
    street: node.address1 || '',
    state: node.province || '',
    postalCode: node.zip || '',
  };
}

function mapCustomer(raw: RawCustomer): UserProfile {
  const defaultAddr = raw.defaultAddress
    ? mapAddress(raw.defaultAddress, true)
    : undefined;

  const allAddresses: CustomerAddress[] = (raw.addresses?.edges || []).map(
    (e) => mapAddress(e.node, e.node.id === raw.defaultAddress?.id)
  );

  const orders: CustomerOrder[] = (raw.orders?.edges || []).map((e) => ({
    id: e.node.id,
    orderNumber: e.node.orderNumber,
    name: e.node.name,
    processedAt: e.node.processedAt,
    financialStatus: e.node.financialStatus,
    fulfillmentStatus: e.node.fulfillmentStatus,
    totalPrice: e.node.totalPriceV2,
    lineItems: (e.node.lineItems?.edges || []).map((li) => ({
      title: li.node.title,
      quantity: li.node.quantity,
      variant: li.node.variant
        ? {
            title: li.node.variant.title,
            price: li.node.variant.priceV2,
          }
        : undefined,
    })),
    statusUrl: e.node.statusUrl,
  }));

  return {
    id: raw.id,
    email: raw.email,
    firstName: raw.firstName || '',
    lastName: raw.lastName || '',
    role: 'customer',
    phone: raw.phone,
    ordersCount: raw.numberOfOrders ?? orders.length,
    defaultAddress: defaultAddr,
    addresses: allAddresses,
    orders,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${raw.firstName || ''} ${raw.lastName || ''}`.trim()
    )}&background=8b7355&color=fff`,
  };
}

// ---------------------------------------------------------------------------
// Service class
// ---------------------------------------------------------------------------
class ShopifyCustomerService {
  /** Create a new Shopify customer account */
  async createCustomer(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ token: { accessToken: string; expiresAt: string }; customer: UserProfile }> {
    const data = await storefrontFetch<{
      customerCreate: {
        customer: { id: string } | null;
        customerUserErrors: ShopifyUserError[];
      };
    }>(CREATE_CUSTOMER_MUTATION, {
      input: { email, password, firstName, lastName },
    });

    const errors = data.customerCreate.customerUserErrors;
    if (errors.length) throw new Error(errors[0].message);

    // Auto-login after registration
    const token = await this.createAccessToken(email, password);
    const customer = await this.getCustomer(token.accessToken);
    return { token, customer };
  }

  /** Create a customer access token (login) */
  async createAccessToken(
    email: string,
    password: string
  ): Promise<{ accessToken: string; expiresAt: string }> {
    const data = await storefrontFetch<{
      customerAccessTokenCreate: {
        customerAccessToken: { accessToken: string; expiresAt: string } | null;
        customerUserErrors: ShopifyUserError[];
      };
    }>(CREATE_ACCESS_TOKEN_MUTATION, { input: { email, password } });

    const errors = data.customerAccessTokenCreate.customerUserErrors;
    if (errors.length) throw new Error(errors[0].message);

    const tokenObj = data.customerAccessTokenCreate.customerAccessToken;
    if (!tokenObj) throw new Error('Failed to create access token.');

    return tokenObj;
  }

  /** Delete a customer access token (logout) — best effort, errors suppressed */
  async deleteAccessToken(accessToken: string): Promise<void> {
    try {
      await storefrontFetch(DELETE_ACCESS_TOKEN_MUTATION, { token: accessToken });
    } catch {
      // Suppress errors — best-effort logout
    }
  }

  /** Fetch full customer profile using a stored access token */
  async getCustomer(accessToken: string): Promise<UserProfile> {
    const data = await storefrontFetch<{ customer: RawCustomer | null }>(
      GET_CUSTOMER_QUERY,
      { token: accessToken }
    );

    if (!data.customer) throw new Error('Customer not found or token expired.');
    return mapCustomer(data.customer);
  }

  /** Trigger Shopify password recovery email */
  async recoverPassword(email: string): Promise<void> {
    const data = await storefrontFetch<{
      customerRecover: { customerUserErrors: ShopifyUserError[] };
    }>(RECOVER_CUSTOMER_MUTATION, { email });

    const errors = data.customerRecover.customerUserErrors;
    // Shopify does NOT error when email doesn't exist (security by design)
    if (errors.length) throw new Error(errors[0].message);
  }

  /** Reset password using the URL from the Shopify email link */
  async resetPasswordByUrl(
    resetUrl: string,
    password: string
  ): Promise<{ accessToken: string; expiresAt: string }> {
    const data = await storefrontFetch<{
      customerResetByUrl: {
        customerAccessToken: { accessToken: string; expiresAt: string } | null;
        customerUserErrors: ShopifyUserError[];
      };
    }>(RESET_BY_URL_MUTATION, { resetUrl, password });

    const errors = data.customerResetByUrl.customerUserErrors;
    if (errors.length) throw new Error(errors[0].message);

    const tokenObj = data.customerResetByUrl.customerAccessToken;
    if (!tokenObj) throw new Error('Failed to reset password.');
    return tokenObj;
  }

  /** Update customer profile fields */
  async updateCustomer(
    accessToken: string,
    fields: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      password?: string;
    }
  ): Promise<UserProfile> {
    const data = await storefrontFetch<{
      customerUpdate: {
        customer: RawCustomer | null;
        customerUserErrors: ShopifyUserError[];
      };
    }>(UPDATE_CUSTOMER_MUTATION, { token: accessToken, customer: fields });

    const errors = data.customerUpdate.customerUserErrors;
    if (errors.length) throw new Error(errors[0].message);

    if (!data.customerUpdate.customer)
      throw new Error('Failed to update customer.');
    return mapCustomer(data.customerUpdate.customer);
  }
}

export const shopifyCustomerService = new ShopifyCustomerService();
