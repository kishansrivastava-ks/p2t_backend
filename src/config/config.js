require("dotenv").config();

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/your_database",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};

module.exports = { config };
