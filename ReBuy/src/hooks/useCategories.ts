import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../services/api/categories/categoryService';
import { CategoryInfo, DEFAULT_CATEGORIES } from '../types/listing';

export const categoryKeys = {
  all: ['categories'] as const,
};

const FALLBACK: CategoryInfo[] = DEFAULT_CATEGORIES.map(name => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
}));

// Categories from the API. Always returns a usable list: the built-in
// defaults while loading or if the request fails, so screens never have
// to handle an empty or missing list.
export function useCategories() {
  const query = useQuery({
    queryKey: categoryKeys.all,
    queryFn: getCategories,
    // They rarely change; refetch at most every 10 minutes.
    staleTime: 10 * 60 * 1000,
  });

  const categories =
    query.data && query.data.length > 0 ? query.data : FALLBACK;

  // Memoized so screens can use it as a useMemo dependency.
  const names = useMemo(() => categories.map(c => c.name), [categories]);

  return { ...query, categories, names };
}
