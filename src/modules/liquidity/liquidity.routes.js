import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import * as ctrl from "./liquidity.controller.js";
import {
  createLiquidityRequestSchema,
  updateLiquidityStatusSchema,
  listLiquidityRequestsQuerySchema,
  createListingSchema,
  listListingsQuerySchema,
  createOfferSchema,
  updateOfferStatusSchema,
  createCreditApplicationSchema,
  routeCreditApplicationSchema,
  updateCreditStatusSchema,
  listCreditQuerySchema,
  uuidParamSchema,
  listingParamSchema,
} from "./liquidity.validation.js";
import { ROLES } from "../../shared/constants/roles.js";

const router = Router();

router.use(authenticate);

/* ---------------- requests ---------------- */

router.post(
  "/requests",
  validate(createLiquidityRequestSchema),
  ctrl.createRequest,
);

router.get(
  "/requests",
  validate(listLiquidityRequestsQuerySchema, "query"),
  ctrl.listRequests,
);

router.get(
  "/requests/:id",
  validate(uuidParamSchema, "params"),
  ctrl.getRequest,
);

router.patch(
  "/requests/:id/status",
  validate(uuidParamSchema, "params"),
  validate(updateLiquidityStatusSchema),
  ctrl.updateRequestStatus,
);

/* ---------------- listings ---------------- */

router.post("/listings", validate(createListingSchema), ctrl.createListing);

router.get(
  "/listings",
  validate(listListingsQuerySchema, "query"),
  ctrl.listListings,
);

router.get(
  "/listings/:id",
  validate(uuidParamSchema, "params"),
  ctrl.getListing,
);

/* ---------------- offers ---------------- */

router.post(
  "/listings/:listingId/offers",
  validate(listingParamSchema, "params"),
  validate(createOfferSchema),
  ctrl.createOffer,
);

router.patch(
  "/offers/:id",
  validate(uuidParamSchema, "params"),
  validate(updateOfferStatusSchema),
  ctrl.updateOffer,
);

/* ---------------- credit applications ---------------- */

router.post(
  "/credit-applications",
  validate(createCreditApplicationSchema),
  ctrl.createCredit,
);

router.get(
  "/credit-applications",
  validate(listCreditQuerySchema, "query"),
  ctrl.listCredit,
);

router.patch(
  "/credit-applications/:id/route",
  authorize(ROLES.ADMIN),
  validate(uuidParamSchema, "params"),
  validate(routeCreditApplicationSchema),
  ctrl.routeCredit,
);

router.patch(
  "/credit-applications/:id/status",
  authorize(ROLES.ADMIN),
  validate(uuidParamSchema, "params"),
  validate(updateCreditStatusSchema),
  ctrl.updateCreditStatus,
);

export default router;
