import { Collection } from '../../../features/collections/types/collection.types';
import { ShopifyCollectionRaw } from '../../../types/shopify.raw';
import { mapShopifyCollectionToDomain } from '../../mappers/collectionMapper';
import { env } from '../../../config/env';

// ─── Shared fetch helper (mirrors shopifyProductProvider) ─────────────────────

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

// ─── GraphQL queries ──────────────────────────────────────────────────────────

const COLLECTION_PRODUCT_FIELDS = `
  id handle title description vendor productType tags availableForSale
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  compareAtPriceRange { minVariantPrice { amount currencyCode } }
  featuredImage { url altText }
  images(first: 4) { edges { node { url altText } } }
  variants(first: 10) {
    edges {
      node {
        id title sku availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
        image { url }
      }
    }
  }
  options { name values }
`;

const GET_COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image { url altText }
          products(first: 20) {
            edges { node { ${COLLECTION_PRODUCT_FIELDS} } }
          }
        }
      }
    }
  }
`;

const GET_COLLECTION_BY_HANDLE_QUERY = `
  query GetCollectionByHandle($handle: String!, $productsFirst: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { url altText }
      products(first: $productsFirst) {
        edges { node { ${COLLECTION_PRODUCT_FIELDS} } }
      }
    }
  }
`;

// ─── Category Fallback Definitions ──────────────────────────────────────────

const CATEGORY_MAP: Record<string, { title: string; description: string; query: string }> = {
  all: {
    title: 'All Ready-to-Wear',
    description: 'Browse our complete catalog of luxury ready-to-wear garments and accessories.',
    query: '',
  },
  featured: {
    title: 'Featured Collection',
    description: 'Handpicked signature pieces and curated luxury silhouettes.',
    query: 'tag:featured OR tag:best-seller',
  },
  tops: {
    title: 'Tops & Blouses',
    description: 'Silk blouses, tailored shirts, and minimalist tops crafted from Mulberry silk.',
    query: 'product_type:"Tops & Blouses" OR product_type:Tops OR tag:tops OR tag:blouse',
  },
  outerwear: {
    title: 'Outerwear & Coats',
    description: 'Cashmere blend coats, structured jackets, and timeless silhouettes.',
    query: 'product_type:"Outerwear & Coats" OR product_type:Outerwear OR tag:outerwear OR tag:coat',
  },
  dresses: {
    title: 'Dresses & Skirts',
    description: 'Effortless evening dresses, midi skirts, and elevated everyday wear.',
    query: 'product_type:Dresses OR product_type:Skirts OR tag:dress OR tag:skirt',
  },
  accessories: {
    title: 'Luxury Accessories',
    description: 'Fine accessories, artisanal pouches, sling bags, and quilted cotton totes.',
    query: 'product_type:Accessories OR tag:accessories OR tag:bag OR tag:wallet OR tag:pouch OR tag:tote OR tag:sling',
  },
  'pipeline-special': {
    title: 'Pipeline Theme Special',
    description: 'Curated designs inspired by the clean luxury aesthetic of the Pipeline theme.',
    query: 'tag:pipeline OR tag:special',
  },
  'best-sellers': {
    title: 'Best Sellers',
    description: 'Our most-loved silhouettes and timeless customer favorites.',
    query: 'tag:best-seller OR tag:featured',
  },
  'new-arrivals': {
    title: 'New Arrivals',
    description: 'The latest additions to the MONTS luxury ready-to-wear line.',
    query: 'tag:new OR tag:new-arrival',
  },
  minimalist: {
    title: 'Minimalist Line',
    description: 'Understated elegance and clean lines for the modern wardrobe.',
    query: 'tag:minimalist OR tag:minimal',
  },
};

const GET_ALL_PRODUCTS_QUERY = `
  query GetAllProductsForCollection($first: Int!, $query: String) {
    products(first: $first, sortKey: RELEVANCE, query: $query) {
      edges { node { ${COLLECTION_PRODUCT_FIELDS} } }
    }
  }
`;

// ─── Provider ────────────────────────────────────────────────────────────────

export class ShopifyCollectionProvider {
  private get isConfigured(): boolean {
    return !!(env.shopifyDomain && env.shopifyStorefrontToken);
  }

  async getCollections(): Promise<Collection[]> {
    if (!this.isConfigured) {
      console.warn('[ShopifyCollectionProvider] Missing credentials — returning empty array.');
      return [];
    }

    const data = await storefrontFetch<{
      collections: { edges: { node: ShopifyCollectionRaw }[] };
    }>(GET_COLLECTIONS_QUERY, { first: 20 });

    const collections = data.collections.edges.map((e) => mapShopifyCollectionToDomain(e.node));

    // If Shopify returns collections, return them directly
    if (collections.length > 0) {
      return collections;
    }

    // Fallback if no collections created in Shopify admin: return default catalog collection
    const productsData = await storefrontFetch<{
      products: { edges: { node: any }[] };
    }>(GET_ALL_PRODUCTS_QUERY, { first: 20 });
    const products = productsData.products.edges.map((e) => e.node);

    return [
      {
        id: 'col_all',
        handle: 'all',
        title: 'All Ready-to-Wear',
        description: 'Explore the complete luxury collection.',
        image: products[0]?.featuredImage?.url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
        productCount: products.length,
        featured: true,
      },
    ];
  }

  async getCollectionByHandle(handle: string): Promise<Collection | null> {
    if (!this.isConfigured) return null;

    // 1. If handle is a direct Shopify collection handle, query it first
    if (handle !== 'all') {
      try {
        const data = await storefrontFetch<{ collection: ShopifyCollectionRaw | null }>(
          GET_COLLECTION_BY_HANDLE_QUERY,
          { handle, productsFirst: 50 },
        );

        if (data.collection) {
          return mapShopifyCollectionToDomain(data.collection);
        }
      } catch {
        // Fall through to category handler
      }
    }

    // 2. If handle is in category map (or 'all')
    const categoryInfo = CATEGORY_MAP[handle] || {
      title: handle
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      description: `Explore products in ${handle.replace('-', ' ')}.`,
      query: `product_type:"${handle}" OR tag:"${handle}"`,
    };

    // Query products matching this category/tag from Shopify Storefront API
    const productsData = await storefrontFetch<{
      products: { edges: { node: any }[] };
    }>(GET_ALL_PRODUCTS_QUERY, {
      first: 50,
      query: categoryInfo.query || undefined,
    });

    const rawProducts = productsData.products.edges;
    const fakeRawCollection: ShopifyCollectionRaw = {
      id: `col_${handle}`,
      handle,
      title: categoryInfo.title,
      description: categoryInfo.description,
      image: rawProducts[0]?.node?.featuredImage,
      products: { edges: rawProducts },
    };

    return mapShopifyCollectionToDomain(fakeRawCollection);
  }
}

export const shopifyCollectionProvider = new ShopifyCollectionProvider();

