import { useQuery } from '@tanstack/react-query';
import { productRepository } from '../repository/productRepository';
import { ProductFilter } from '../types/product.types';

export function useProducts(filter?: ProductFilter) {
  return useQuery({
    queryKey: ['products', filter],
    queryFn: () => productRepository.getProducts(filter),
    staleTime: 1000 * 15, // 15s cache — reflects Shopify updates promptly
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productRepository.getFeaturedProducts(),
    staleTime: 1000 * 15,
  });
}

