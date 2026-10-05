const pool = require("../config/database");

// True when `name` is an active category, e.g. before saving a listing.
const isActiveCategory = async (name) => {
  if (typeof name !== "string" || !name) {
    return false;
  }

  const result = await pool.query(
    "SELECT 1 FROM categories WHERE name = $1 AND is_active",
    [name]
  );
  return result.rows.length > 0;
};

// Active categories in display order, with how many active listings each has.
const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.slug, c.image_url, c.sort_order,
              COUNT(l.id)::int AS listing_count
       FROM categories c
       LEFT JOIN listings l
         ON l.category = c.name AND l.status = 'active'
       WHERE c.is_active
       GROUP BY c.id
       ORDER BY c.sort_order, c.name`
    );

    return res.status(200).json({
      success: true,
      categories: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        imageUrl: row.image_url,
        listingCount: row.listing_count,
      })),
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getCategories,
  isActiveCategory,
};
