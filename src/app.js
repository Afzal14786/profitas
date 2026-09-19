import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http"

import { logger } from "./config/logger.js";
import routes from "./routes/index.routes.js";

import { notFoundMiddleware } from "./shared/middleware/not-found.middleware.js";
import { errorMiddleware } from "./shared/middleware/error.middleware.js";

const app = express();

app.use(
  pinoHttp({
    logger,
  })
);

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;