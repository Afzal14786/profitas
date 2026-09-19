import { Router } from "express";

import { checkDatabaseConnection } from "../shared/infra/health-check.js";

const router = Router();

router.get("/health", async (req, res, next) => {
  try {
    await checkDatabaseConnection();

    return res.status(200).json({
      success: true,
      message: "PROFITAS API is healthy",
      database: "connected",
    });
  } catch (error) {
    next(error);
  }
});

export default router;