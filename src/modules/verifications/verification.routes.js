import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import * as ctrl from "./verification.controller.js";
import {
  createVerificationSchema,
  updateVerificationSchema,
  listVerificationsQuerySchema,
  uuidParamSchema,
} from "./verification.validation.js";
import { ROLES } from "../../shared/constants/roles.js";

const router = Router();

router.use(authenticate);

// Legal workflow is admin-only in MVP (admin represents the legal advocate)
router.post(
  "/",
  authorize(ROLES.ADMIN),
  validate(createVerificationSchema),
  ctrl.create,
);

router.get("/", validate(listVerificationsQuerySchema, "query"), ctrl.list);

router.get("/:id", validate(uuidParamSchema, "params"), ctrl.getOne);

router.patch(
  "/:id",
  authorize(ROLES.ADMIN),
  validate(uuidParamSchema, "params"),
  validate(updateVerificationSchema),
  ctrl.update,
);

export default router;
