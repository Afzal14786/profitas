import { HTTP_STATUS } from "../constants/http-status.js";
import { logger } from "../../config/logger.js";

export function errorMiddleware(err, req, res, next) {
  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
    },
    "Request failed"
  );

  const statusCode =
    err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal server error",
    code: err.code || "INTERNAL_SERVER_ERROR",
    details: err.details || null,
  });
}