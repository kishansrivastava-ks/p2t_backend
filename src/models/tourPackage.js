// models/tourPackage.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Review Schema (for nested reviews within stays)
const reviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  text: {
    type: String,
    required: true,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
});

// Stay Schema
const staySchema = new Schema({
  hotelName: {
    type: String,
    required: true,
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  roomType: {
    type: String,
    enum: ["Single", "Double", "Triple", "Twin Sharing", "Family"],
    required: true,
  },
  amenities: [
    {
      type: String,
    },
  ],
  acType: {
    type: String,
    enum: ["AC", "Non-AC", "Both Available"],
    default: "AC",
  },
  mealPlan: {
    type: String,
    enum: [
      "Breakfast Only",
      "Half Board",
      "Full Board",
      "All Inclusive",
      "None",
    ],
    default: "Breakfast Only",
  },
  description: {
    type: String,
  },
  reviews: [reviewSchema],
  location: {
    type: String,
    required: true,
  },
});

// Highlight Schema
const highlightSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  description: {
    type: String,
  },
});

// Inclusion Item Schema
const inclusionItemSchema = new Schema({
  category: {
    type: String,
    required: true,
  },
  points: [
    {
      type: String,
      required: true,
    },
  ],
});

// Itinerary Day Schema
const itineraryDaySchema = new Schema({
  day: {
    type: Number,
    required: true,
  },
  points: [
    {
      type: String,
      required: true,
    },
  ],
});

// Main Tour Package Schema
const tourPackageSchema = new Schema(
  {
    packageName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      basePrice: {
        type: Number,
        required: true,
      },
      isVariable: {
        type: Boolean,
        default: false,
      },
      priceVariations: [
        {
          name: String,
          condition: String,
          price: Number,
        },
      ],
    },
    duration: {
      days: {
        type: Number,
        required: true,
      },
      nights: {
        type: Number,
        required: true,
      },
    },
    datesAvailable: [
      {
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        availableSpots: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
        }, // Optional: Allow different pricing for different dates
      },
    ],
    maxGroupSize: {
      type: Number,
      required: true,
    },
    destinations: [
      {
        type: String,
        required: true,
      },
    ],
    overview: {
      type: String,
      required: true,
    },
    itinerary: [itineraryDaySchema],
    inclusions: [inclusionItemSchema],
    highlights: [highlightSchema],
    stays: [staySchema],
    mainImage: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    galleryImages: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    categories: [
      {
        type: String,
        enum: [
          "Adventure",
          "Beach",
          "Cultural",
          "Wildlife",
          "Pilgrimage",
          "Family",
          "Honeymoon",
          "Luxury",
          "Budget",
        ],
      },
    ],
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Difficult"],
      default: "Easy",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    discount: {
      hasDiscount: {
        type: Boolean,
        default: false,
      },
      discountPercentage: {
        type: Number,
      },
      discountedPrice: {
        type: Number,
      },
    },
    status: {
      type: String,
      enum: ["Active", "Draft", "Archived"],
      default: "Draft",
    },
    cancellationPolicy: {
      type: String,
    },
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate slug
tourPackageSchema.pre("save", function (next) {
  if (!this.isModified("packageName")) return next();

  this.slug = this.packageName
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");

  next();
});

// Method to check availability for a specific date range
tourPackageSchema.methods.checkAvailability = function (
  startDate,
  endDate,
  numberOfPeople
) {
  // Find matching date range
  const matchingDateRange = this.datesAvailable.find((dateRange) => {
    return dateRange.startDate <= startDate && dateRange.endDate >= endDate;
  });

  if (!matchingDateRange) return false;
  return matchingDateRange.availableSpots >= numberOfPeople;
};

// Virtual for calculating discounted price
tourPackageSchema.virtual("currentPrice").get(function () {
  if (this.discount.hasDiscount && this.discount.discountedPrice) {
    return this.discount.discountedPrice;
  }
  return this.price.basePrice;
});

// Create the model
const TourPackage = mongoose.model("TourPackage", tourPackageSchema);

module.exports = TourPackage;
