import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import * as ctrl from "./partner.controller.js";
import {
  createPartnerSchema,
  updatePartnerSchema,
  listPartnersQuerySchema,
  uuidParamSchema,
} from "./partner.validation.js";
import { ROLES } from "../../shared/constants/roles.js";

const router = Router();
router.use(authenticate);

router.post(
  "/",
  authorize(ROLES.ADMIN),
  validate(createPartnerSchema),
  ctrl.create,
);
router.get("/", validate(listPartnersQuerySchema, "query"), ctrl.list);
router.get("/:id", validate(uuidParamSchema, "params"), ctrl.getOne);
router.patch(
  "/:id",
  authorize(ROLES.ADMIN),
  validate(uuidParamSchema, "params"),
  validate(updatePartnerSchema),
  ctrl.update,
);
router.delete(
  "/:id",
  authorize(ROLES.ADMIN),
  validate(uuidParamSchema, "params"),
  ctrl.remove,
);

export default router;
