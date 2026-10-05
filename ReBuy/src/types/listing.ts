// Category names now come from the API (see useCategories). This list is
// the fallback while they load or if the API can't be reached.
export const DEFAULT_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Home Appliances',
  'Mobiles & Tablets',
  'Fashion',
  'Kids & Baby',
  'Sports',
  'Other',
];

export type Category = string;

export type CategoryInfo = {
  name: Category;
  slug: string;
  // Fixed cover set on the server; screens fall back to the category's icon.
  imageUrl?: string;
  // Active listings from the API.
  listingCount?: number;
};

export const CONDITIONS = [
  'Brand new',
  'Like new',
  'Very good',
  'Good',
  'Fair',
] as const;

export type Condition = (typeof CONDITIONS)[number];

export type Product = {
  id: string;
  title: string;
  category: Category;
  price: number; // AED
  condition: Condition;
  location: string;
  description: string;
  sellerName: string;
  // Average of buyers' reviews, 1–5.
  sellerRating: number;
  sellerReviewCount: number;
  // Photo URLs, cover photo first.
  images: string[];
  // Relative time, e.g. "2 days ago".
  postedAt: string;
  // Where the item is, when the seller picked it on the map or used GPS.
  lat?: number | null;
  lng?: number | null;
  sellerId?: string;
  status?: 'active' | 'sold';
};
