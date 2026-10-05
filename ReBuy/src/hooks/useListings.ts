import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchListing, fetchListings } from '../api/listings';
import { useAuth } from '../context/AuthContext';
import {
  createListing,
  getMyListings,
  ListingPhoto,
  NewListing,
} from '../services/api/listings/listingService';
import type { Product } from '../types/listing';

export const listingKeys = {
  all: ['listings'] as const,
  mine: ['listings', 'mine'] as const,
  detail: (id: string) => ['listings', 'detail', id] as const,
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

// The signed-in user's own listings, including sold ones.
export function useMyListings() {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: listingKeys.mine,
    queryFn: getMyListings,
    enabled: isSignedIn,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listing,
      photos,
      onProgress,
    }: {
      listing: NewListing;
      photos: ListingPhoto[];
      onProgress?: (fraction: number) => void;
    }) => createListing(listing, photos, onProgress),
    onSuccess: product => {
      // Open straight away without a refetch, then refresh the lists.
      queryClient.setQueryData(listingKeys.detail(product.id), product);
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
}
