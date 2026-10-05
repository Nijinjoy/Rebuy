const pool = require("../config/database");
const { removeFiles } = require("../middleware/upload.middleware");
const { isActiveCategory } = require("./category.controller");

const CONDITIONS = ["Brand new", "Like new", "Very good", "Good", "Fair"];
const SELLER_TYPES = ["individual", "company"];
const MAX_PRICE = 9999999;
const LISTING_URL_PREFIX = "/uploads/listings/";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Listing columns plus the seller's name and photo URLs (cover first).
const LISTING_SELECT = `
  SELECT l.id, l.seller_id, l.seller_type, l.title, l.category, l.condition,
         l.price, l.description, l.location_name, l.lat, l.lng, l.status,
         l.created_at, l.updated_at,
         u.name AS seller_name, u.avatar_url AS seller_avatar_url,
         COALESCE(
           json_agg(li.url ORDER BY li.position)
             FILTER (WHERE li.id IS NOT NULL),
           '[]'
         ) AS images
  FROM listings l
  JOIN users u ON u.id = l.seller_id
  LEFT JOIN listing_images li ON li.listing_id = l.id`;

const LISTING_GROUP = "GROUP BY l.id, u.id";

// Matches the app's Product type so screens can use it as-is.
const toListing = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  price: Number(row.price),
  condition: row.condition,
  location: row.location_name,
  lat: row.lat,
  lng: row.lng,
  description: row.description,
  sellerId: row.seller_id,
  sellerType: row.seller_type,
  sellerName: row.seller_name,
  sellerAvatarUrl: row.seller_avatar_url,
  // No reviews yet.
  sellerRating: 0,
  sellerReviewCount: 0,
  images: row.images,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const findListing = async (db, id) => {
  const result = await db.query(
    `${LISTING_SELECT} WHERE l.id = $1 ${LISTING_GROUP}`,
    [id]
  );
  return result.rows[0] ? toListing(result.rows[0]) : null;
};

// Returns [errors, cleanValues] for a create request's text fields.
const validateListing = (body, files) => {
  const errors = {};

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  const price = Number(body.price);
  const sellerType = body.sellerType || "individual";

  if (!title) {
    errors.title = "Give your item a title";
  } else if (title.length > 80) {
    errors.title = "Title must be 80 characters or fewer";
  }
  if (!CONDITIONS.includes(body.condition)) {
    errors.condition = "Choose a valid condition";
  }
  if (!Number.isInteger(price) || price <= 0 || price > MAX_PRICE) {
    errors.price = "Enter a whole price between 1 and 9,999,999";
  }
  if (!location) {
    errors.location = "Enter where the item is";
  } else if (location.length > 100) {
    errors.location = "Location must be 100 characters or fewer";
  }
  if (description.length > 1000) {
    errors.description = "Description must be 1000 characters or fewer";
  }
  if (!SELLER_TYPES.includes(sellerType)) {
    errors.sellerType = "Choose a valid seller type";
  }
  if (!files || files.length === 0) {
    errors.photos = "Add at least one photo";
  }

  // Coordinates are optional but must come as a valid pair.
  let lat = null;
  let lng = null;
  if (body.lat !== undefined || body.lng !== undefined) {
    lat = Number(body.lat);
    lng = Number(body.lng);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    ) {
      errors.location = "Location coordinates are invalid";
    }
  }

  return [
    errors,
    { title, description, location, price, sellerType, lat, lng },
  ];
};

const createListing = async (req, res) => {
  const files = req.files || [];
  const filePaths = files.map((file) => file.path);

  const [errors, values] = validateListing(req.body, files);
  try {
    if (!(await isActiveCategory(req.body.category))) {
      errors.category = "Choose a valid category";
    }
  } catch (error) {
    await removeFiles(filePaths);
    console.error("Check category error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

  if (Object.keys(errors).length > 0) {
    await removeFiles(filePaths);

    return res.status(400).json({
      success: false,
      message: Object.values(errors)[0],
      errors,
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const inserted = await client.query(
      `INSERT INTO listings
         (seller_id, seller_type, title, category, condition, price,
          description, location_name, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        req.user.userId,
        values.sellerType,
        values.title,
        req.body.category,
        req.body.condition,
        values.price,
        values.description,
        values.location,
        values.lat,
        values.lng,
      ]
    );
    const listingId = inserted.rows[0].id;

    // Photos keep the order they were sent in; the first is the cover.
    for (const [position, file] of files.entries()) {
      await client.query(
        `INSERT INTO listing_images (listing_id, url, position)
         VALUES ($1, $2, $3)`,
        [listingId, `${LISTING_URL_PREFIX}${file.filename}`, position]
      );
    }

    const listing = await findListing(client, listingId);
    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Listing posted",
      listing,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    await removeFiles(filePaths);
    console.error("Create listing error:", error);

    // The seller's account was deleted after their token was issued.
    if (error.code === "23503") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

// Public feed of active listings, newest first. Query: category, page, limit.
const getListings = async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const params = [];
  let where = "WHERE l.status = 'active'";

  try {
    if (req.query.category) {
      if (!(await isActiveCategory(req.query.category))) {
        return res.status(400).json({
          success: false,
          message: "Unknown category",
        });
      }
      params.push(req.query.category);
      where += ` AND l.category = $${params.length}`;
    }


    // One extra row tells us whether another page exists.
    params.push(limit + 1, (page - 1) * limit);
    const result = await pool.query(
      `${LISTING_SELECT}
       ${where}
       ${LISTING_GROUP}
       ORDER BY l.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const rows = result.rows.slice(0, limit);

    return res.status(200).json({
      success: true,
      listings: rows.map(toListing),
      page,
      hasMore: result.rows.length > limit,
    });
  } catch (error) {
    console.error("Get listings error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Everything the signed-in user has listed, including sold items.
const getMyListings = async (req, res) => {
  try {
    const result = await pool.query(
      `${LISTING_SELECT}
       WHERE l.seller_id = $1
       ${LISTING_GROUP}
       ORDER BY l.created_at DESC`,
      [req.user.userId]
    );

    return res.status(200).json({
      success: true,
      listings: result.rows.map(toListing),
    });
  } catch (error) {
    console.error("Get my listings error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getListing = async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) {
    return res.status(404).json({
      success: false,
      message: "Listing not found",
    });
  }

  try {
    const listing = await findListing(pool, req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    return res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error("Get listing error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createListing,
  getListings,
  getMyListings,
  getListing,
};
