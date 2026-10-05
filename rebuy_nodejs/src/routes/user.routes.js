const express = require("express");
const {
  getProfile,
  updateAvatar,
  deleteAvatar,
} = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { uploadAvatar } = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/avatar", authMiddleware, uploadAvatar, updateAvatar);
router.delete("/avatar", authMiddleware, deleteAvatar);

module.exports = router;
