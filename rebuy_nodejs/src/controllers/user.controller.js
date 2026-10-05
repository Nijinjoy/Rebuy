const fs = require("fs/promises");
const path = require("path");
const pool = require("../config/database");
const { AVATAR_DIR } = require("../middleware/upload.middleware");

const USER_FIELDS = "id, name, email, avatar_url, created_at, updated_at";
const AVATAR_URL_PREFIX = "/uploads/avatars/";

// Deletes a previously uploaded avatar file; a missing file is not an error.
const removeAvatarFile = async (avatarUrl) => {
  if (!avatarUrl || !avatarUrl.startsWith(AVATAR_URL_PREFIX)) {
    return;
  }

  const fileName = path.basename(avatarUrl);

  try {
    await fs.unlink(path.join(AVATAR_DIR, fileName));
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Remove avatar file error:", error);
    }
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT ${USER_FIELDS}
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Choose an image to upload",
    });
  }

  const avatarUrl = `${AVATAR_URL_PREFIX}${req.file.filename}`;

  try {
    const userId = req.user.userId;

    const previous = await pool.query(
      "SELECT avatar_url FROM users WHERE id = $1",
      [userId]
    );

    if (previous.rows.length === 0) {
      await removeAvatarFile(avatarUrl);

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET avatar_url = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING ${USER_FIELDS}`,
      [avatarUrl, userId]
    );

    await removeAvatarFile(previous.rows[0].avatar_url);

    return res.status(200).json({
      success: true,
      message: "Profile photo updated",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update avatar error:", error);
    await removeAvatarFile(avatarUrl);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;

    const previous = await pool.query(
      "SELECT avatar_url FROM users WHERE id = $1",
      [userId]
    );

    if (previous.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET avatar_url = NULL, updated_at = NOW()
       WHERE id = $1
       RETURNING ${USER_FIELDS}`,
      [userId]
    );

    await removeAvatarFile(previous.rows[0].avatar_url);

    return res.status(200).json({
      success: true,
      message: "Profile photo removed",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Delete avatar error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getProfile,
  updateAvatar,
  deleteAvatar,
};
