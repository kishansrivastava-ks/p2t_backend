const app = require("./app");
const { config } = require("./config/config");
const { connectDB } = require("./config/database");
const { logger } = require("./utils/logger");

const startServer = async () => {
  try {
    // connect to mongoDB
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info(
        `Server is running in ${config.nodeEnv} on port ${config.port}`
      );
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled Rejection:", err);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
