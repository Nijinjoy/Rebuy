export const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Fashion',
  'Home',
  'Sports',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONDITIONS = ['Like new', 'Very good', 'Good'] as const;

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
  // Pre-formatted until listings have real timestamps.
  postedAt: string;
};
