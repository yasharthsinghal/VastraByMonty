import { Product, ProductFilter } from '../../../features/products/types/product.types';
import { ShopifyProductRaw } from '../../../types/shopify.raw';
import { mapShopifyProductToDomain } from '../../mappers/productMapper';
import { env } from '../../../config/env';

// ─── Shared fetch helper ──────────────────────────────────────────────────────

async function storefrontFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const endpoint = `https://${env.shopifyDomain}/api/2024-10/graphql.json`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': env.shopifyStorefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront API HTTP error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL error: ${json.errors[0].message}`);
  }
  return json.data as T;
}

// ─── GraphQL fragments & queries ─────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    vendor
    productType
    tags
    availableForSale
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    featuredImage { url altText width height }
    images(first: 6) {
      edges { node { url altText width height } }
    }
    variants(first: 20) {
      edges {
        node {
          id
          title
          sku
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
          image { url altText }
        }
      }
    }
    options { name values }
  }
`;

const GET_PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query) {
      edges { node { ...ProductFields } }
    }
  }
`;

const GET_PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
`;

// ─── Filter → Storefront query variables ─────────────────────────────────────

function buildSortVariables(sortBy?: ProductFilter['sortBy']): {
  sortKey: string;
  reverse: boolean;
} {
  switch (sortBy) {
    case 'price-asc':  return { sortKey: 'PRICE', reverse: false };
    case 'price-desc': return { sortKey: 'PRICE', reverse: true };
    case 'title-asc':  return { sortKey: 'TITLE', reverse: false };
    case 'newest':     return { sortKey: 'CREATED_AT', reverse: true };
    default:           return { sortKey: 'RELEVANCE', reverse: false };
  }
}

function buildQueryString(filter?: ProductFilter): string | undefined {
  if (!filter) return undefined;
  const parts: string[] = [];
  if (filter.searchQuery) parts.push(filter.searchQuery);
  if (filter.category) {
    const cat = filter.category.trim();
    parts.push(`(product_type:"${cat}" OR tag:"${cat}")`);
  }
  if (filter.minPrice !== undefined) parts.push(`price:>=${filter.minPrice}`);
  if (filter.maxPrice !== undefined) parts.push(`price:<=${filter.maxPrice}`);
  if (filter.availableOnly) parts.push('available_for_sale:true');
  return parts.length > 0 ? parts.join(' ') : undefined;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export class ShopifyProductProvider {
  private get isConfigured(): boolean {
    return !!(env.shopifyDomain && env.shopifyStorefrontToken);
  }

  async getProducts(filter?: ProductFilter): Promise<Product[]> {
    if (!this.isConfigured) {
      console.warn('[ShopifyProductProvider] Missing credentials — returning empty array.');
      return [];
    }

    const { sortKey, reverse } = buildSortVariables(filter?.sortBy);
    const query = buildQueryString(filter);

    const data = await storefrontFetch<{
      products: { edges: { node: ShopifyProductRaw }[] };
    }>(GET_PRODUCTS_QUERY, { first: 50, sortKey, reverse, query });

    return data.products.edges.map((e) => mapShopifyProductToDomain(e.node));
  }

  async getProductByHandle(handle: string): Promise<Product | null> {
    if (!this.isConfigured) return null;

    const data = await storefrontFetch<{ product: ShopifyProductRaw | null }>(
      GET_PRODUCT_BY_HANDLE_QUERY,
      { handle },
    );

    return data.product ? mapShopifyProductToDomain(data.product) : null;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    if (!this.isConfigured) return [];

    // First attempt: products tagged featured or best-seller
    const data = await storefrontFetch<{
      products: { edges: { node: ShopifyProductRaw }[] };
    }>(GET_PRODUCTS_QUERY, {
      first: 8,
      sortKey: 'RELEVANCE',
      reverse: false,
      query: 'tag:featured OR tag:best-seller',
    });

    let products = data.products.edges.map((e) => mapShopifyProductToDomain(e.node));

    // Fallback: If merchant hasn't tagged products yet, show latest/top Shopify products
    if (products.length === 0) {
      const fallbackData = await storefrontFetch<{
        products: { edges: { node: ShopifyProductRaw }[] };
      }>(GET_PRODUCTS_QUERY, {
        first: 8,
        sortKey: 'RELEVANCE',
        reverse: false,
      });
      products = fallbackData.products.edges.map((e) => mapShopifyProductToDomain(e.node));
    }

    return products;
  }
}

export const shopifyProductProvider = new ShopifyProductProvider();

