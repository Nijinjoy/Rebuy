import {
  getListing,
  getListings,
} from '../services/api/listings/listingService';
import type { Product } from '../types/listing';
import { ApiError } from './client';

// Listings from the ReBuy API, newest first.
export function fetchListings(): Promise<Product[]> {
  return getListings();
}

export async function fetchListing(id: string): Promise<Product> {
  try {
    return await getListing(id);
  } catch {
    throw new ApiError('Listing not found', 404);
  }
}
