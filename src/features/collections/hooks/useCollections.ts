import { useQuery } from '@tanstack/react-query';
import { collectionRepository } from '../repository/collectionRepository';

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: () => collectionRepository.getCollections(),
    staleTime: 1000 * 15,
  });
}

export function useCollection(handle: string) {
  return useQuery({
    queryKey: ['collection', handle],
    queryFn: () => collectionRepository.getCollectionByHandle(handle),
    enabled: !!handle,
    staleTime: 1000 * 15,
  });
}

