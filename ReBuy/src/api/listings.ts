import { useMockApi } from '../config/env';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';
import type { Product } from '../types/listing';
import { ApiError, request } from './client';
import { mockResponse } from './mock';

export function fetchListings(): Promise<Product[]> {
  if (useMockApi) {
    return mockResponse(SAMPLE_PRODUCTS);
  }
  return request<Product[]>('/listings');
}

export function fetchListing(id: string): Promise<Product> {
  if (useMockApi) {
    const product = SAMPLE_PRODUCTS.find(p => p.id === id);
    return product
      ? mockResponse(product)
      : Promise.reject(new ApiError('Listing not found', 404));
  }
  return request<Product>(`/listings/${encodeURIComponent(id)}`);
}
