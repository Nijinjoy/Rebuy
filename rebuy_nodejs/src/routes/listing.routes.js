const express = require("express");
const {
  createListing,
  getListings,
  getMyListings,
  getListing,
} = require("../controllers/listing.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { uploadListingPhotos } = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/", getListings);
// Before "/:id" so "mine" isn't read as an id.
router.get("/mine", authMiddleware, getMyListings);
router.get("/:id", getListing);
router.post("/", authMiddleware, uploadListingPhotos, createListing);

module.exports = router;
