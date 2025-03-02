const express = require("express");
const router = express.Router();
const {
  uploadSingleImage,
  uploadMultipleImages,
  uploadMixedImages,
} = require("../middleware/uploadMiddleware");
const {
  createTourPackage,
  updateTourPackage,
  // other controller functions
} = require("../controllers/tourPackageController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { configureUpload } = require("../config/cloudinary");

// Route for creating a tour package with multiple image fields
router.post(
  "/",
  //   protect,
  //   restrictTo("seller", "admin"),
  uploadMixedImages([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
    { name: "highlightImages", maxCount: 8 },
    { name: "stayImages", maxCount: 15 },
  ]),
  createTourPackage
);

// Route for updating a tour package
router.patch(
  "/:id",
  //   protect,
  //   restrictTo("seller", "admin"),
  uploadMixedImages([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
    { name: "highlightImages", maxCount: 8 },
    { name: "stayImages", maxCount: 15 },
  ]),
  updateTourPackage
);

// Other routes...

module.exports = router;
