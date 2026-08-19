import { useQuery } from '@tanstack/react-query';
import { productRepository } from '../repository/productRepository';

export function useProduct(handle: string) {
  return useQuery({
    queryKey: ['product', handle],
    queryFn: () => productRepository.getProductByHandle(handle),
    enabled: !!handle,
    staleTime: 1000 * 15,
  });
}

