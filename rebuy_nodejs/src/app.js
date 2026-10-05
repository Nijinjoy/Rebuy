const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const listingRoutes = require("./routes/listing.routes");
const categoryRoutes = require("./routes/category.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Log every request and its response status
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`);
  });
  next();
});

// Uploaded files such as profile photos.
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Images shipped with the backend, such as category covers.
app.use("/assets", express.static(path.join(__dirname, "../public")));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Recommerce backend is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/categories", categoryRoutes);

module.exports = app;
