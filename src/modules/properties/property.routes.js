import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import * as propertyController from "./property.controller.js";
import {
  createPropertySchema,
  updatePropertySchema,
  updatePropertyStatusSchema,
  listPropertiesQuerySchema,
  uuidParamSchema,
} from "./property.validation.js";
import { ROLES } from "../../shared/constants/roles.js";

const router = Router();

// All property routes require authentication
router.use(authenticate);

// Create + list + read
router.post("/", validate(createPropertySchema), propertyController.create);
router.get(
  "/",
  validate(listPropertiesQuerySchema, "query"),
  propertyController.list,
);
router.get(
  "/:id",
  validate(uuidParamSchema, "params"),
  propertyController.getOne,
);

// Update + archive
router.patch(
  "/:id",
  validate(uuidParamSchema, "params"),
  validate(updatePropertySchema),
  propertyController.update,
);
router.delete(
  "/:id",
  validate(uuidParamSchema, "params"),
  propertyController.archive,
);

// Admin-only status flip
router.patch(
  "/:id/status",
  authorize(ROLES.ADMIN),
  validate(uuidParamSchema, "params"),
  validate(updatePropertyStatusSchema),
  propertyController.updateStatus,
);

export default router;
