-- More conditions for listings: adds 'Brand new' and 'Fair'. Keep in step
-- with CONDITIONS in listing.controller.js.
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_condition_check;

ALTER TABLE listings
  ADD CONSTRAINT listings_condition_check
  CHECK (condition IN ('Brand new', 'Like new', 'Very good', 'Good', 'Fair'));
