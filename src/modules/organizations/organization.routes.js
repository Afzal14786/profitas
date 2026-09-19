import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import * as orgController from "./organization.controller.js";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
  listOrganizationsQuerySchema,
  uuidParamSchema,
  memberParamSchema,
} from "./organization.validation.js";
import { ROLES } from "../../shared/constants/roles.js";

const router = Router();

// All organization routes require authentication
router.use(authenticate);

// Self-service
router.post("/", validate(createOrganizationSchema), orgController.create);
router.get("/me", orgController.listMine);

// Admin-only list of all organizations
router.get(
  "/",
  authorize(ROLES.ADMIN),
  validate(listOrganizationsQuerySchema, "query"),
  orgController.listAll,
);

// Org detail + update
router.get("/:id", validate(uuidParamSchema, "params"), orgController.getOne);
router.patch(
  "/:id",
  validate(uuidParamSchema, "params"),
  validate(updateOrganizationSchema),
  orgController.update,
);

// Members
router.post(
  "/:id/members",
  validate(uuidParamSchema, "params"),
  validate(addMemberSchema),
  orgController.addMember,
);
router.get(
  "/:id/members",
  validate(uuidParamSchema, "params"),
  orgController.listMembers,
);
router.delete(
  "/:id/members/:userId",
  validate(memberParamSchema, "params"),
  orgController.removeMember,
);

export default router;
