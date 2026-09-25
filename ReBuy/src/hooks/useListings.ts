import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchListing, fetchListings } from '../api/listings';
import type { Product } from '../types/listing';

export const listingKeys = {
  all: ['listings'] as const,
  detail: (id: string) => ['listings', id] as const,
};

export function useListings() {
  return useQuery({ queryKey: listingKeys.all, queryFn: fetchListings });
}

// Shows the listing straight away when the full list is already loaded.
export function useListing(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => fetchListing(id),
    initialData: () =>
      queryClient
        .getQueryData<Product[]>(listingKeys.all)
        ?.find(p => p.id === id),
  });
}
