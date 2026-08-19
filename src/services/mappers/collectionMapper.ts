import { ShopifyCollectionRaw } from '../../types/shopify.raw';
import { Collection } from '../../features/collections/types/collection.types';
import { mapShopifyProductToDomain } from './productMapper';

export function mapShopifyCollectionToDomain(raw: ShopifyCollectionRaw): Collection {
  const products = raw.products.edges.map((e) => mapShopifyProductToDomain(e.node));
  const fallbackImage =
    products[0]?.featuredImage ||
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80';

  let title = raw.title;
  let description = raw.description;

  if (title === 'Default example products' || raw.handle.includes('example-products')) {
    title = 'Artisanal Handcrafted Series';
    description = 'Heritage hand-block prints, quilted cotton totes, and sustainable artisanal travel accessories.';
  }

  return {
    id: raw.id,
    handle: raw.handle,
    title,
    description: description || 'Curated luxury ready-to-wear pieces and handcrafted accessories.',
    image: raw.image?.url || fallbackImage,
    productCount: products.length,
    featured: raw.handle === 'featured' || raw.handle === 'ready-to-wear' || raw.handle.includes('example-products'),
    products,
  };
}

