import apiClient from '../../client';
import { backendAssetUrl } from '../../../config/env';
import type { Category, Condition, Product } from '../../../types/listing';
import { timeAgo } from '../../../utils/format';

// A listing as the API sends it: Product without postedAt, with relative
// photo paths and a createdAt timestamp.
type ApiListing = Omit<Product, 'postedAt' | 'images'> & {
  images: string[];
  createdAt: string;
};

export interface NewListing {
  title: string;
  category: Category;
  condition: Condition;
  price: number;
  location: string;
  description: string;
  // Where the item is, when it came from GPS.
  coords?: { lat: number; lng: number };
}

export interface ListingPhoto {
  uri: string;
  type?: string;
  fileName?: string;
}

export const MAX_LISTING_PHOTOS = 5;

function toProduct(listing: ApiListing): Product {
  return {
    ...listing,
    images: listing.images
      .map(path => backendAssetUrl(path))
      .filter((uri): uri is string => !!uri),
    postedAt: timeAgo(listing.createdAt),
  };
}

// Posts a listing with its photos in one request; the first photo is the
// cover. Requires a signed-in session.
// `onProgress` gets 0–1 as the upload goes.
export const createListing = async (
  listing: NewListing,
  photos: ListingPhoto[],
  onProgress?: (fraction: number) => void,
): Promise<Product> => {
  const formData = new FormData();
  formData.append('title', listing.title);
  formData.append('category', listing.category);
  formData.append('condition', listing.condition);
  formData.append('price', String(listing.price));
  formData.append('location', listing.location);
  formData.append('description', listing.description);
  if (listing.coords) {
    formData.append('lat', String(listing.coords.lat));
    formData.append('lng', String(listing.coords.lng));
  }
  photos.forEach((photo, index) => {
    const type = photo.type ?? 'image/jpeg';
    formData.append('photos', {
      uri: photo.uri,
      type,
      name: photo.fileName ?? `photo-${index}.${type.split('/')[1] ?? 'jpg'}`,
    } as unknown as Blob);
  });

  const response = await apiClient.post<{ listing: ApiListing }>(
    '/listings',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      // Hand FormData to React Native's networking as-is.
      transformRequest: data => data,
      // Several photos can take a while on mobile data.
      timeout: 60000,
      onUploadProgress: event => {
        if (onProgress && event.total) {
          onProgress(Math.min(event.loaded / event.total, 1));
        }
      },
    },
  );

  if (__DEV__) {
    console.log('Create listing response:', response.status, response.data);
  }

  return toProduct(response.data.listing);
};

export const getListings = async (): Promise<Product[]> => {
  const response = await apiClient.get<{ listings: ApiListing[] }>(
    '/listings',
    { params: { limit: 50 } },
  );

  return response.data.listings.map(toProduct);
};

export const getListing = async (id: string): Promise<Product> => {
  const response = await apiClient.get<{ listing: ApiListing }>(
    `/listings/${encodeURIComponent(id)}`,
  );

  return toProduct(response.data.listing);
};

export const getMyListings = async (): Promise<Product[]> => {
  const response = await apiClient.get<{ listings: ApiListing[] }>(
    '/listings/mine',
  );

  return response.data.listings.map(toProduct);
};
