-- Items users put up for sale. Category and condition match the app's
-- CATEGORIES and CONDITIONS lists.
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_type VARCHAR(20) NOT NULL DEFAULT 'individual'
    CHECK (seller_type IN ('individual', 'company')),
  title VARCHAR(80) NOT NULL,
  category VARCHAR(30) NOT NULL
    CHECK (category IN ('Electronics', 'Furniture', 'Fashion', 'Home', 'Sports', 'Other')),
  condition VARCHAR(20) NOT NULL
    CHECK (condition IN ('Like new', 'Very good', 'Good')),
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  description TEXT NOT NULL DEFAULT '',
  location_name VARCHAR(100) NOT NULL,
  -- Where the item is, when the seller used GPS; drives "Nearby".
  lat DOUBLE PRECISION CHECK (lat BETWEEN -90 AND 90),
  lng DOUBLE PRECISION CHECK (lng BETWEEN -180 AND 180),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'sold')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listings_feed_idx ON listings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS listings_seller_idx ON listings (seller_id, created_at DESC);

-- Photos for a listing; position 0 is the cover.
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position SMALLINT NOT NULL,
  UNIQUE (listing_id, position)
);
