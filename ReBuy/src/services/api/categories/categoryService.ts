import apiClient from '../../client';
import { backendAssetUrl } from '../../../config/env';
import type { CategoryInfo } from '../../../types/listing';

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  listingCount: number;
};

// Active categories in the order the server sets.
export const getCategories = async (): Promise<CategoryInfo[]> => {
  const response = await apiClient.get<{ categories: ApiCategory[] }>(
    '/categories',
  );

  return response.data.categories.map(category => ({
    name: category.name,
    slug: category.slug,
    imageUrl: backendAssetUrl(category.imageUrl),
    listingCount: category.listingCount,
  }));
};
