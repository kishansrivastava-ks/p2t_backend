const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to create storage with dynamic folder path
const createStorage = (folderPath) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderPath,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1000, height: 1000, crop: "limit" }],
      format: "webp",
    },
  });
};

// This middleware will be used in the routes
const configureUpload = (tourId) => {
  const baseFolder = `tour-packages/${tourId}`;

  return {
    mainImage: multer({
      storage: createStorage(`${baseFolder}/main`),
      limits: { fileSize: 5 * 1024 * 1024 },
    }).single("mainImage"),

    galleryImages: multer({
      storage: createStorage(`${baseFolder}/gallery`),
      limits: { fileSize: 5 * 1024 * 1024 },
    }).array("galleryImages", 10),

    highlightImages: multer({
      storage: createStorage(`${baseFolder}/highlights`),
      limits: { fileSize: 5 * 1024 * 1024 },
    }).array("highlightImages", 8),

    stayImages: multer({
      storage: createStorage(`${baseFolder}/stays`),
      limits: { fileSize: 5 * 1024 * 1024 },
    }).array("stayImages", 15),
  };
};

module.exports = {
  cloudinary,
  configureUpload,
};
