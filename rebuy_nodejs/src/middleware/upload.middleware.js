const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");
const AVATAR_DIR = path.join(UPLOADS_DIR, "avatars");
const LISTING_DIR = path.join(UPLOADS_DIR, "listings");

const MB = 1024 * 1024;
const MAX_LISTING_PHOTOS = 5;

const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
};

// Builds middleware that saves image uploads from `field` into `dir` and
// turns multer's errors into JSON responses like the rest of the API.
const imageUpload = ({ dir, field, maxCount, maxSizeMb }) => {
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) => {
      cb(null, `${crypto.randomUUID()}${EXTENSIONS[file.mimetype]}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: maxSizeMb * MB, files: maxCount },
    fileFilter: (req, file, cb) => {
      if (!EXTENSIONS[file.mimetype]) {
        return cb(new Error("Only JPEG, PNG, WebP or HEIC images are allowed"));
      }
      cb(null, true);
    },
  });

  const handler =
    maxCount === 1 ? upload.single(field) : upload.array(field, maxCount);

  return (req, res, next) => {
    handler(req, res, (error) => {
      if (!error) {
        return next();
      }

      let message = error.message;
      if (error.code === "LIMIT_FILE_SIZE") {
        message = `Each image must be ${maxSizeMb} MB or smaller`;
      } else if (
        error.code === "LIMIT_FILE_COUNT" ||
        error.code === "LIMIT_UNEXPECTED_FILE"
      ) {
        message = `You can upload up to ${maxCount} image${
          maxCount === 1 ? "" : "s"
        }`;
      }

      return res.status(400).json({
        success: false,
        message,
      });
    });
  };
};

// Deletes uploaded files, e.g. after a failed request; missing files are fine.
const removeFiles = async (filePaths) => {
  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        await fs.promises.unlink(filePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("Remove upload error:", error);
        }
      }
    })
  );
};

const uploadAvatar = imageUpload({
  dir: AVATAR_DIR,
  field: "avatar",
  maxCount: 1,
  maxSizeMb: 5,
});

const uploadListingPhotos = imageUpload({
  dir: LISTING_DIR,
  field: "photos",
  maxCount: MAX_LISTING_PHOTOS,
  maxSizeMb: 8,
});

module.exports = {
  AVATAR_DIR,
  LISTING_DIR,
  MAX_LISTING_PHOTOS,
  removeFiles,
  uploadAvatar,
  uploadListingPhotos,
};
