import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import { checkDatabaseConnection } from "../shared/infra/health-check.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

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