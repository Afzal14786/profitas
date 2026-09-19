import { z } from "zod";

const liquidityTypeEnumZ = z.enum(["sell_match", "get_credit"]);

const liquidityStatusEnumZ = z.enum([
  "requested",
  "processing",
  "completed",
  "rejected",
  "cancelled",
]);

const listingStatusEnumZ = z.enum(["active", "matched", "closed", "cancelled"]);

const offerStatusEnumZ = z.enum([
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
]);

const creditStatusEnumZ = z.enum([
  "requested",
  "routed",
  "approved",
  "rejected",
  "disbursed",
]);

/* ------------------------------------------------------------------ */
/* Requests                                                            */
/* ------------------------------------------------------------------ */

export const createLiquidityRequestSchema = z
  .object({
    propertyId: z.string().uuid("Invalid property id"),
    liquidityType: liquidityTypeEnumZ,
    // sell_match only
    askingPrice: z.coerce.number().positive().optional(),
    // get_credit only
    requestedAmount: z.coerce.number().positive().optional(),
    lenderId: z.string().uuid().optional(),
  })
  .refine((d) => d.liquidityType !== "sell_match" || d.askingPrice != null, {
    message: "askingPrice is required for sell_match liquidity",
    path: ["askingPrice"],
  })
  .refine(
    (d) => d.liquidityType !== "get_credit" || d.requestedAmount != null,
    {
      message: "requestedAmount is required for get_credit liquidity",
      path: ["requestedAmount"],
    },
  );

export const updateLiquidityStatusSchema = z.object({
  status: liquidityStatusEnumZ,
  reason: z.string().max(500).optional(),
});

export const listLiquidityRequestsQuerySchema = z.object({
  propertyId: z.string().uuid().optional(),
  liquidityType: liquidityTypeEnumZ.optional(),
  status: liquidityStatusEnumZ.optional(),
  mine: z.coerce.boolean().optional().default(false),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/* ------------------------------------------------------------------ */
/* Listings                                                            */
/* ------------------------------------------------------------------ */

export const createListingSchema = z.object({
  liquidityRequestId: z.string().uuid(),
  propertyId: z.string().uuid(),
  askingPrice: z.coerce.number().positive(),
});

export const listListingsQuerySchema = z.object({
  status: listingStatusEnumZ.optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/* ------------------------------------------------------------------ */
/* Offers                                                              */
/* ------------------------------------------------------------------ */

export const createOfferSchema = z.object({
  amount: z.coerce.number().positive(),
});

export const updateOfferStatusSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

/* ------------------------------------------------------------------ */
/* Credit applications                                                 */
/* ------------------------------------------------------------------ */

export const createCreditApplicationSchema = z.object({
  liquidityRequestId: z.string().uuid(),
  propertyId: z.string().uuid(),
  requestedAmount: z.coerce.number().positive(),
});

export const routeCreditApplicationSchema = z.object({
  lenderId: z.string().uuid(),
});

export const updateCreditStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "disbursed"]),
});

export const listCreditQuerySchema = z.object({
  status: creditStatusEnumZ.optional(),
  mine: z.coerce.boolean().optional().default(false),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid id"),
});

export const listingParamSchema = z.object({
  listingId: z.string().uuid("Invalid listing id"),
});
