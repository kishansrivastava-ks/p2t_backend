// controllers/tourPackageController.js
const TourPackage = require("../models/tourPackage");
const { cloudinary, configureUpload } = require("../config/cloudinary");
const asyncHandler = require("express-async-handler");

// Create a new tour package with images
const createTourPackage = asyncHandler(async (req, res) => {
  // First create a basic tour package to get an ID
  const tourData = req.body;
  //   tourData.seller = req.user.id;

  // Create a placeholder for images that will be updated
  tourData.mainImage = { public_id: "", url: "" };
  if (tourData.highlights) {
    tourData.highlights = JSON.parse(tourData.highlights || "[]").map(
      (highlight) => ({
        ...highlight,
        image: { public_id: "", url: "" },
      })
    );
  }
  if (tourData.stays) {
    tourData.stays = JSON.parse(tourData.stays || "[]").map((stay) => ({
      ...stay,
      image: { public_id: "", url: "" },
    }));
  }

  let tourPackage = await TourPackage.create(tourData);
  const tourId = tourPackage._id;

  // Now configure upload with the new tour ID
  const uploadMiddleware = configureUpload(tourId);

  // Handle file uploads
  const uploadPromises = [];

  // Process main image
  if (req.files && req.files.mainImage && req.files.mainImage[0]) {
    const mainImageFile = req.files.mainImage[0];

    // Upload to Cloudinary with the dynamic folder path
    const mainImageUploadPromise = new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload(mainImageFile.path, {
        folder: `tour-packages/${tourId}/main`,
      });

      upload
        .then((result) => {
          tourPackage.mainImage = {
            public_id: result.public_id,
            url: result.secure_url,
          };
          resolve();
        })
        .catch((err) => reject(err));
    });

    uploadPromises.push(mainImageUploadPromise);
  }

  // Process gallery images
  if (
    req.files &&
    req.files.galleryImages &&
    req.files.galleryImages.length > 0
  ) {
    const galleryUploadPromise = Promise.all(
      req.files.galleryImages.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: `tour-packages/${tourId}/gallery`,
        })
      )
    ).then((results) => {
      tourPackage.galleryImages = results.map((result) => ({
        public_id: result.public_id,
        url: result.secure_url,
      }));
    });

    uploadPromises.push(galleryUploadPromise);
  }

  // Process highlight images (similar approach)
  if (
    req.files &&
    req.files.highlightImages &&
    req.files.highlightImages.length > 0
  ) {
    const highlights = JSON.parse(req.body.highlights || "[]");
    const highlightUploadPromise = Promise.all(
      req.files.highlightImages.map((file, index) =>
        cloudinary.uploader
          .upload(file.path, {
            folder: `tour-packages/${tourId}/highlights`,
          })
          .then((result) => ({ result, index }))
      )
    ).then((results) => {
      results.forEach(({ result, index }) => {
        if (index < tourPackage.highlights.length) {
          tourPackage.highlights[index].image = {
            public_id: result.public_id,
            url: result.secure_url,
          };
        }
      });
    });

    uploadPromises.push(highlightUploadPromise);
  }

  // Process stay images (similar approach)
  if (req.files && req.files.stayImages && req.files.stayImages.length > 0) {
    const stays = JSON.parse(req.body.stays || "[]");
    const stayUploadPromise = Promise.all(
      req.files.stayImages.map((file, index) =>
        cloudinary.uploader
          .upload(file.path, {
            folder: `tour-packages/${tourId}/stays`,
          })
          .then((result) => ({ result, index }))
      )
    ).then((results) => {
      results.forEach(({ result, index }) => {
        if (index < tourPackage.stays.length) {
          tourPackage.stays[index].image = {
            public_id: result.public_id,
            url: result.secure_url,
          };
        }
      });
    });

    uploadPromises.push(stayUploadPromise);
  }

  // Wait for all uploads to complete
  try {
    await Promise.all(uploadPromises);

    // Save the updated tour package
    await tourPackage.save();

    res.status(201).json({
      status: "success",
      data: {
        tourPackage,
      },
    });
  } catch (error) {
    // If there's an error, delete the partially created tour package
    await TourPackage.findByIdAndDelete(tourId);

    // And also try to clean up any uploaded images
    cloudinary.api.delete_resources_by_prefix(`tour-packages/${tourId}/`);

    res.status(400).json({
      status: "fail",
      message: `Failed to upload images: ${error.message}`,
    });
  }
});

// Update tour package
const updateTourPackage = asyncHandler(async (req, res) => {
  // Similar approach as above but for updating
  // You'll need to handle deleting old images when they're replaced

  // First get the existing tour package
  let tourPackage = await TourPackage.findById(req.params.id);

  if (!tourPackage) {
    return res.status(404).json({
      status: "fail",
      message: "Tour package not found",
    });
  }

  // Authorization check
  if (
    tourPackage.seller.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      status: "fail",
      message: "You are not authorized to update this tour package",
    });
  }

  const tourId = tourPackage._id;
  const updateData = req.body;

  // Handle file uploads with dynamic folders
  const uploadPromises = [];

  // Handle main image update
  if (req.files && req.files.mainImage && req.files.mainImage[0]) {
    const mainImageFile = req.files.mainImage[0];

    // Delete previous image if it exists
    if (tourPackage.mainImage && tourPackage.mainImage.public_id) {
      await cloudinary.uploader.destroy(tourPackage.mainImage.public_id);
    }

    // Upload new image
    const mainImageUploadPromise = cloudinary.uploader
      .upload(mainImageFile.path, {
        folder: `tour-packages/${tourId}/main`,
      })
      .then((result) => {
        updateData.mainImage = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      });

    uploadPromises.push(mainImageUploadPromise);
  }

  // Similar handling for other image fields

  // Wait for all uploads to complete
  try {
    await Promise.all(uploadPromises);

    // Update the tour package
    tourPackage = await TourPackage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        tourPackage,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: `Failed to update tour package: ${error.message}`,
    });
  }
});

// Delete tour package
const deleteTourPackage = asyncHandler(async (req, res) => {
  const tourPackage = await TourPackage.findById(req.params.id);

  if (!tourPackage) {
    return res.status(404).json({
      status: "fail",
      message: "Tour package not found",
    });
  }

  // Check authorization
  if (
    tourPackage.seller.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      status: "fail",
      message: "You are not authorized to delete this tour package",
    });
  }

  const tourId = tourPackage._id;

  // Delete all images associated with this tour
  // This deletes the entire folder for this tour package
  await cloudinary.api.delete_folder(`tour-packages/${tourId}`);

  // Delete the tour package
  await TourPackage.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  createTourPackage,
  updateTourPackage,
  deleteTourPackage,
  // other controller functions
};
