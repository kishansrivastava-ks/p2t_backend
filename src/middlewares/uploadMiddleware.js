const { tourImageUpload } = require("../config/cloudinary");
const asyncHandler = require("express-async-handler");

// Middleware for single image upload
const uploadSingleImage = (fieldName) => tourImageUpload.single(fieldName);

// Middleware for multiple images (up to 10)
const uploadMultipleImages = (fieldName, maxCount = 10) =>
  tourImageUpload.array(fieldName, maxCount);

// Middleware for multiple fields with multiple images
const uploadMixedImages = (fields) => tourImageUpload.fields(fields);

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  uploadMixedImages,
};
