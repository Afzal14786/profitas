import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import organizationRoutes from "../modules/organizations/organization.routes.js";
import propertyRoutes from "../modules/properties/property.routes.js";
import partnerRoutes from "../modules/partners/partner.routes.js";
import documentRoutes from "../modules/documents/document.routes.js";
import verificationRoutes from "../modules/verifications/verification.routes.js";

import { checkDatabaseConnection } from "../shared/infra/health-check.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/organizations", organizationRoutes);
router.use("/properties", propertyRoutes);
router.use("/partners", partnerRoutes);
router.use("/documents", documentRoutes);
router.use("/verifications", verificationRoutes);

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