import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import * as ctrl from "./compliance.controller.js";
import {
  createComplianceSchema,
  updateComplianceSchema,
  listComplianceQuerySchema,
  uuidParamSchema,
} from "./compliance.validation.js";
import { ROLES } from "../../shared/constants/roles.js";

const router = Router();

router.use(authenticate);

// Admin manages compliance records (represents the compliance officer)
router.post(
  "/",
  authorize(ROLES.ADMIN),
  validate(createComplianceSchema),
  ctrl.create,
);

// Public to authenticated users — needed for property detail views
router.get("/", validate(listComplianceQuerySchema, "query"), ctrl.list);

// IMPORTANT: /stats must come BEFORE /:id
router.get("/stats", authorize(ROLES.ADMIN), ctrl.stats);

router.get("/:id", validate(uuidParamSchema, "params"), ctrl.getOne);

router.patch(
  "/:id",
  authorize(ROLES.ADMIN),
  validate(uuidParamSchema, "params"),
  validate(updateComplianceSchema),
  ctrl.update,
);

export default router;
