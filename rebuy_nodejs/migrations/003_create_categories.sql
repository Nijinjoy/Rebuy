-- Categories the app offers for listings. Add, rename, reorder or hide
-- them here instead of shipping an app update.
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE,
  slug VARCHAR(40) NOT NULL UNIQUE,
  -- Fixed cover image; without one the app shows the category's icon.
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Inactive categories are hidden and can't take new listings.
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO categories (name, slug, sort_order) VALUES
  ('Electronics', 'electronics', 1),
  ('Furniture', 'furniture', 2),
  ('Fashion', 'fashion', 3),
  ('Home', 'home', 4),
  ('Sports', 'sports', 5),
  ('Other', 'other', 6)
ON CONFLICT (name) DO NOTHING;

-- Listings now point at the categories table instead of a fixed list.
-- ON UPDATE CASCADE keeps listings in step when a category is renamed.
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_category_check;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'listings_category_fkey'
  ) THEN
    ALTER TABLE listings
      ADD CONSTRAINT listings_category_fkey
      FOREIGN KEY (category) REFERENCES categories(name)
      ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS listings_category_idx
  ON listings (category, status, created_at DESC);
