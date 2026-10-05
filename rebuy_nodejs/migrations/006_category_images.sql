-- Fixed cover image per category, served from public/categories. The app
-- shows these instead of a listing's photo.
UPDATE categories
SET image_url = '/assets/categories/' || slug || '.jpg'
WHERE slug IN (
  'electronics',
  'furniture',
  'home-appliances',
  'mobiles-tablets',
  'fashion',
  'kids-baby',
  'sports',
  'other'
);
