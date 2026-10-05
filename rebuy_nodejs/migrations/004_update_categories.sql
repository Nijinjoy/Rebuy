-- Category set for the Sell screen: Electronics, Furniture, Home Appliances,
-- Mobiles & Tablets, Fashion, Kids & Baby, Sports, Other.
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Home Appliances', 'home-appliances', 3),
  ('Mobiles & Tablets', 'mobiles-tablets', 4),
  ('Kids & Baby', 'kids-baby', 6)
ON CONFLICT (name) DO NOTHING;

UPDATE categories SET sort_order = 1 WHERE name = 'Electronics';
UPDATE categories SET sort_order = 2 WHERE name = 'Furniture';
UPDATE categories SET sort_order = 3 WHERE name = 'Home Appliances';
UPDATE categories SET sort_order = 4 WHERE name = 'Mobiles & Tablets';
UPDATE categories SET sort_order = 5 WHERE name = 'Fashion';
UPDATE categories SET sort_order = 6 WHERE name = 'Kids & Baby';
UPDATE categories SET sort_order = 7 WHERE name = 'Sports';
UPDATE categories SET sort_order = 8 WHERE name = 'Other';

-- 'Home' is no longer offered. Hidden rather than deleted so existing
-- listings that reference it stay valid.
UPDATE categories SET is_active = FALSE WHERE name = 'Home';
