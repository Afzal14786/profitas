import app from "./app.js";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase } from "./db/index.js";

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(`PROFITAS API running on port ${env.PORT}`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down...`);

      server.close(async () => {
        await import("./db/index.js").then(({ pool }) =>
          pool.end()
        );

        logger.info("Server shut down");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error(error, "Failed to start PROFITAS server");

    process.exit(1);
  }
}

startServer();