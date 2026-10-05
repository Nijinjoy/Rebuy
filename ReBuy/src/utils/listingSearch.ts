import { locationIsIn } from '../data/areas';
import type { Category, Condition, Product } from '../types/listing';

export const SORTS = {
  newest: 'Newest',
  priceLow: 'Price: low to high',
  priceHigh: 'Price: high to low',
  rating: 'Top-rated sellers',
} as const;

export type Sort = keyof typeof SORTS;

export const RATINGS = [4, 4.5] as const;

export type Filters = {
  minPrice: number | null;
  maxPrice: number | null;
  conditions: Condition[];
  locations: string[];
  // Minimum seller rating, or null for any.
  minRating: number | null;
};

export const NO_FILTERS: Filters = {
  minPrice: null,
  maxPrice: null,
  conditions: [],
  locations: [],
  minRating: null,
};

// How many filter groups are set, for the badge on the Filters button.
export function countFilters(filters: Filters) {
  return [
    filters.minPrice !== null || filters.maxPrice !== null,
    filters.conditions.length > 0,
    filters.locations.length > 0,
    filters.minRating !== null,
  ].filter(Boolean).length;
}

export type Search = {
  query: string;
  category: Category | null;
  filters: Filters;
  sort: Sort;
};

function matches(product: Product, { query, category, filters }: Search) {
  const q = query.trim().toLowerCase();
  const { minPrice, maxPrice, conditions, locations, minRating } = filters;
  return (
    (!category || product.category === category) &&
    (!q ||
      product.title.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      product.location.toLowerCase().includes(q)) &&
    (minPrice === null || product.price >= minPrice) &&
    (maxPrice === null || product.price <= maxPrice) &&
    (conditions.length === 0 || conditions.includes(product.condition)) &&
    (locations.length === 0 || locationIsIn(product.location, locations)) &&
    (minRating === null || product.sellerRating >= minRating)
  );
}

// Listings matching `search`, in its sort order. Products are assumed to be
// newest first already.
export function searchListings(products: Product[], search: Search) {
  const found = products.filter(p => matches(p, search));
  switch (search.sort) {
    case 'priceLow':
      return found.sort((a, b) => a.price - b.price);
    case 'priceHigh':
      return found.sort((a, b) => b.price - a.price);
    case 'rating':
      return found.sort((a, b) => b.sellerRating - a.sellerRating);
    default:
      return found;
  }
}
