import {
  countFilters,
  NO_FILTERS,
  Search,
  searchListings,
} from '../src/utils/listingSearch';
import { SAMPLE_PRODUCTS } from '../__fixtures__/sampleProducts';

const all: Search = {
  query: '',
  category: null,
  filters: NO_FILTERS,
  sort: 'newest',
};

test('no search returns every listing in original order', () => {
  expect(searchListings(SAMPLE_PRODUCTS, all)).toEqual(SAMPLE_PRODUCTS);
});

test('category and query narrow the results', () => {
  const found = searchListings(SAMPLE_PRODUCTS, {
    ...all,
    category: 'Electronics',
    query: 'iphone',
  });
  expect(found.map(p => p.id)).toEqual(['p1']);
});

test('filters by price, condition, location and rating', () => {
  const filters = {
    minPrice: 200,
    maxPrice: 1500,
    conditions: ['Very good' as const],
    locations: [],
    minRating: 4.5,
  };
  const found = searchListings(SAMPLE_PRODUCTS, { ...all, filters });
  expect(found.length).toBeGreaterThan(0);
  for (const p of found) {
    expect(p.price).toBeGreaterThanOrEqual(200);
    expect(p.price).toBeLessThanOrEqual(1500);
    expect(p.condition).toBe('Very good');
    expect(p.sellerRating).toBeGreaterThanOrEqual(4.5);
  }
  expect(countFilters(filters)).toBe(3);
});

test('sorts by price and rating without mutating the source', () => {
  const before = [...SAMPLE_PRODUCTS];
  const low = searchListings(SAMPLE_PRODUCTS, { ...all, sort: 'priceLow' });
  const high = searchListings(SAMPLE_PRODUCTS, { ...all, sort: 'priceHigh' });
  const rated = searchListings(SAMPLE_PRODUCTS, { ...all, sort: 'rating' });

  expect(low.map(p => p.price)).toEqual(
    [...before].map(p => p.price).sort((a, b) => a - b),
  );
  expect(high[0].price).toBe(Math.max(...before.map(p => p.price)));
  expect(rated[0].sellerRating).toBe(
    Math.max(...before.map(p => p.sellerRating)),
  );
  expect(SAMPLE_PRODUCTS).toEqual(before);
});
