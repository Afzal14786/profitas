import { eq, and, desc, count, sql, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  liquidityRequests,
  listings,
  offers,
  creditApplications,
} from "../../db/schema/liquidity.schema.js";
import { properties } from "../../db/schema/properties.schema.js";
import { partners } from "../../db/schema/partners.schema.js";
import { AppError } from "../../shared/utils/app-error.js";
import { ERROR_CODES } from "../../shared/constants/error-codes.js";
import {
  assertLiquidityEligibility,
  assertPropertyOwnership,
} from "./liquidity.engine.js";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function normaliseRequest(row) {
  return row;
}

async function assertLender(lenderId) {
  const [lender] = await db
    .select()
    .from(partners)
    .where(eq(partners.id, lenderId));
  if (!lender)
    throw new AppError("Lender not found", 404, ERROR_CODES.NOT_FOUND);
  if (!["bank", "nbfc", "institution"].includes(lender.partnerType)) {
    throw new AppError(
      "Lender must be a bank, NBFC, or institution",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }
  return lender;
}

async function getRequestOrFail(id) {
  const [row] = await db
    .select()
    .from(liquidityRequests)
    .where(eq(liquidityRequests.id, id));
  if (!row) {
    throw new AppError(
      "Liquidity request not found",
      404,
      ERROR_CODES.NOT_FOUND,
    );
  }
  return row;
}

async function getListingOrFail(id) {
  const [row] = await db.select().from(listings).where(eq(listings.id, id));
  if (!row) throw new AppError("Listing not found", 404, ERROR_CODES.NOT_FOUND);
  return row;
}

/* ================================================================== */
/* REQUESTS                                                            */
/* ================================================================== */

export async function createLiquidityRequest(requester, data) {
  // 1. Eligibility (verified + no active request)
  const prop = await assertLiquidityEligibility(data.propertyId);

  // 2. Ownership (only owner/admin can request)
  await assertPropertyOwnership(prop, requester);

  // 3. Create parent request
  const [request] = await db
    .insert(liquidityRequests)
    .values({
      propertyId: data.propertyId,
      requestedBy: requester.id,
      liquidityType: data.liquidityType,
      status: "requested",
    })
    .returning();

  // 4. Create route-specific child
  if (data.liquidityType === "sell_match") {
    await db.insert(listings).values({
      liquidityRequestId: request.id,
      propertyId: data.propertyId,
      askingPrice: String(data.askingPrice),
      status: "active",
    });
  } else if (data.liquidityType === "get_credit") {
    if (data.lenderId) await assertLender(data.lenderId);

    await db.insert(creditApplications).values({
      liquidityRequestId: request.id,
      propertyId: data.propertyId,
      investorId: requester.id,
      lenderId: data.lenderId ?? null,
      requestedAmount: String(data.requestedAmount),
      status: data.lenderId ? "routed" : "requested",
    });
  }

  return getLiquidityRequestById(request.id, requester);
}

export async function listLiquidityRequests(query, requester) {
  const { propertyId, liquidityType, status, mine, page, limit } = query;

  const conditions = [];
  if (propertyId) conditions.push(eq(liquidityRequests.propertyId, propertyId));
  if (liquidityType)
    conditions.push(eq(liquidityRequests.liquidityType, liquidityType));
  if (status) conditions.push(eq(liquidityRequests.status, status));

  // Non-admin sees only own requests (unless explicitly filtered to all by admin)
  if (requester.role !== "admin" || mine) {
    conditions.push(eq(liquidityRequests.requestedBy, requester.id));
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select()
    .from(liquidityRequests)
    .where(where)
    .orderBy(desc(liquidityRequests.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(liquidityRequests)
    .where(where);

  const total = Number(totalRow?.total || 0);

  return {
    data: rows.map(normaliseRequest),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function getLiquidityRequestById(id, requester = null) {
  const request = await getRequestOrFail(id);

  if (
    requester &&
    requester.role !== "admin" &&
    request.requestedBy !== requester.id
  ) {
    throw new AppError(
      "You do not have access to this liquidity request",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.liquidityRequestId, id));

  const [credit] = await db
    .select()
    .from(creditApplications)
    .where(eq(creditApplications.liquidityRequestId, id));

  return {
    ...request,
    listing: listing || null,
    creditApplication: credit || null,
  };
}

export async function updateLiquidityStatus(id, requester, { status }) {
  const existing = await getRequestOrFail(id);

  if (requester.role !== "admin" && existing.requestedBy !== requester.id) {
    throw new AppError(
      "You do not have permission to update this request",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  const [updated] = await db
    .update(liquidityRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(liquidityRequests.id, id))
    .returning();

  return updated;
}

/* ================================================================== */
/* LISTINGS                                                            */
/* ================================================================== */

export async function createListing(requester, data) {
  const req = await getRequestOrFail(data.liquidityRequestId);

  if (req.requestedBy !== requester.id && requester.role !== "admin") {
    throw new AppError(
      "You do not own this liquidity request",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  if (req.liquidityType !== "sell_match") {
    throw new AppError(
      "Listings can only be created for sell_match requests",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const [created] = await db
    .insert(listings)
    .values({
      liquidityRequestId: data.liquidityRequestId,
      propertyId: data.propertyId,
      askingPrice: String(data.askingPrice),
      status: "active",
    })
    .returning();

  return created;
}

export async function listListings({
  status,
  minPrice,
  maxPrice,
  page,
  limit,
}) {
  const conditions = [];
  if (status) conditions.push(eq(listings.status, status));
  if (minPrice != null)
    conditions.push(sql`${listings.askingPrice} >= ${minPrice}`);
  if (maxPrice != null)
    conditions.push(sql`${listings.askingPrice} <= ${maxPrice}`);

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select()
    .from(listings)
    .where(where)
    .orderBy(desc(listings.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(listings)
    .where(where);

  const total = Number(totalRow?.total || 0);

  return {
    data: rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function getListingById(id) {
  return getListingOrFail(id);
}

/* ================================================================== */
/* OFFERS                                                              */
/* ================================================================== */

export async function createOffer(requester, listingId, { amount }) {
  const listing = await getListingOrFail(listingId);

  if (listing.status !== "active") {
    throw new AppError(
      "Listing is not active",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  // Seller cannot bid on own listing
  const req = await getRequestOrFail(listing.liquidityRequestId);
  if (req.requestedBy === requester.id) {
    throw new AppError(
      "You cannot make an offer on your own listing",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const [created] = await db
    .insert(offers)
    .values({
      listingId,
      buyerId: requester.id,
      amount: String(amount),
      status: "pending",
    })
    .returning();

  return created;
}

export async function updateOfferStatus(offerId, requester, { status }) {
  const [offer] = await db.select().from(offers).where(eq(offers.id, offerId));
  if (!offer) throw new AppError("Offer not found", 404, ERROR_CODES.NOT_FOUND);

  const listing = await getListingOrFail(offer.listingId);
  const req = await getRequestOrFail(listing.liquidityRequestId);

  if (requester.role !== "admin" && req.requestedBy !== requester.id) {
    throw new AppError(
      "Only the seller can accept or reject offers",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  if (status === "accepted") {
    // Reject all other offers on this listing
    await db
      .update(offers)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(
        and(
          eq(offers.listingId, offer.listingId),
          sql`${offers.id} <> ${offer.id}`,
        ),
      );

    // Accept this one
    await db
      .update(offers)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(offers.id, offer.id));

    // Mark listing matched
    await db
      .update(listings)
      .set({ status: "matched", updatedAt: new Date() })
      .where(eq(listings.id, offer.listingId));

    // Mark parent request completed
    await db
      .update(liquidityRequests)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(liquidityRequests.id, listing.liquidityRequestId));
  } else {
    await db
      .update(offers)
      .set({ status, updatedAt: new Date() })
      .where(eq(offers.id, offer.id));
  }

  const [updated] = await db
    .select()
    .from(offers)
    .where(eq(offers.id, offer.id));
  return updated;
}

/* ================================================================== */
/* CREDIT APPLICATIONS                                                 */
/* ================================================================== */

export async function createCreditApplication(requester, data) {
  const req = await getRequestOrFail(data.liquidityRequestId);

  if (req.requestedBy !== requester.id && requester.role !== "admin") {
    throw new AppError("Not allowed", 403, ERROR_CODES.FORBIDDEN);
  }

  if (req.liquidityType !== "get_credit") {
    throw new AppError(
      "Credit applications can only be created for get_credit requests",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  // Prevent duplicate credit application for the same request
  const [existing] = await db
    .select({ id: creditApplications.id })
    .from(creditApplications)
    .where(eq(creditApplications.liquidityRequestId, data.liquidityRequestId));
  if (existing) {
    throw new AppError(
      "A credit application already exists for this liquidity request",
      409,
      ERROR_CODES.CONFLICT,
    );
  }

  const [created] = await db
    .insert(creditApplications)
    .values({
      liquidityRequestId: data.liquidityRequestId,
      propertyId: data.propertyId,
      investorId: requester.id,
      requestedAmount: String(data.requestedAmount),
      status: "requested",
    })
    .returning();

  return created;
}

export async function listCreditApplications(query, requester) {
  const { status, mine, page, limit } = query;

  const conditions = [];
  if (status) conditions.push(eq(creditApplications.status, status));
  if (requester.role !== "admin" || mine) {
    conditions.push(eq(creditApplications.investorId, requester.id));
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select()
    .from(creditApplications)
    .where(where)
    .orderBy(desc(creditApplications.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(creditApplications)
    .where(where);

  const total = Number(totalRow?.total || 0);

  return {
    data: rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function routeCreditApplication(id, { lenderId }) {
  await assertLender(lenderId);

  const [updated] = await db
    .update(creditApplications)
    .set({ lenderId, status: "routed", updatedAt: new Date() })
    .where(eq(creditApplications.id, id))
    .returning();

  if (!updated) {
    throw new AppError(
      "Credit application not found",
      404,
      ERROR_CODES.NOT_FOUND,
    );
  }
  return updated;
}

export async function updateCreditStatus(id, { status }) {
  const [updated] = await db
    .update(creditApplications)
    .set({ status, updatedAt: new Date() })
    .where(eq(creditApplications.id, id))
    .returning();

  if (!updated) {
    throw new AppError(
      "Credit application not found",
      404,
      ERROR_CODES.NOT_FOUND,
    );
  }
  return updated;
}

export async function listOffersByListing(listingId) {
  const rows = await db.select().from(offers).where(eq(offers.listingId, listingId));
  return rows;
}