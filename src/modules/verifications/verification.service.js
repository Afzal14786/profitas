import { eq, and, desc, count } from "drizzle-orm";
import { db } from "../../db/index.js";
import { verifications } from "../../db/schema/verifications.schema.js";
import { properties } from "../../db/schema/properties.schema.js";
import { documents } from "../../db/schema/documents.schema.js";
import { AppError } from "../../shared/utils/app-error.js";
import { ERROR_CODES } from "../../shared/constants/error-codes.js";

const REQUIRED_TYPES = ["title", "ownership", "encumbrance", "dispute"];

/* ----------------------------- helpers ----------------------------- */

async function getPropertyOrFail(propertyId) {
  const [row] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId));
  if (!row)
    throw new AppError("Property not found", 404, ERROR_CODES.NOT_FOUND);
  return row;
}

/* ----------------------------- create ----------------------------- */

export async function createVerification(requester, data) {
  await getPropertyOrFail(data.propertyId);

  if (data.documentId) {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, data.documentId));
    if (!doc)
      throw new AppError("Document not found", 404, ERROR_CODES.NOT_FOUND);
    if (doc.propertyId !== data.propertyId) {
      throw new AppError(
        "Document does not belong to the specified property",
        400,
        ERROR_CODES.VALIDATION_ERROR,
      );
    }
  }

  // Prevent duplicates of the same verificationType for the same property
  const [existing] = await db
    .select({ id: verifications.id })
    .from(verifications)
    .where(
      and(
        eq(verifications.propertyId, data.propertyId),
        eq(verifications.verificationType, data.verificationType),
      ),
    );
  if (existing) {
    throw new AppError(
      `A "${data.verificationType}" verification already exists for this property`,
      409,
      ERROR_CODES.CONFLICT,
    );
  }

  const [created] = await db
    .insert(verifications)
    .values({
      propertyId: data.propertyId,
      documentId: data.documentId ?? null,
      verificationType: data.verificationType,
      status: "pending",
      remarks: data.remarks ?? null,
    })
    .returning();

  return created;
}

/* ----------------------------- read ----------------------------- */

export async function listVerifications({
  propertyId,
  verificationType,
  status,
  page,
  limit,
}) {
  const conditions = [];
  if (propertyId) conditions.push(eq(verifications.propertyId, propertyId));
  if (verificationType)
    conditions.push(eq(verifications.verificationType, verificationType));
  if (status) conditions.push(eq(verifications.status, status));

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select()
    .from(verifications)
    .where(where)
    .orderBy(desc(verifications.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(verifications)
    .where(where);

  const total = Number(totalRow?.total || 0);

  return {
    data: rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function getVerificationById(id) {
  const [row] = await db
    .select()
    .from(verifications)
    .where(eq(verifications.id, id));
  if (!row)
    throw new AppError("Verification not found", 404, ERROR_CODES.NOT_FOUND);
  return row;
}

/* ----------------------------- update ----------------------------- */

export async function updateVerification(id, requester, data) {
  const [existing] = await db
    .select()
    .from(verifications)
    .where(eq(verifications.id, id));
  if (!existing) {
    throw new AppError("Verification not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const patch = { ...data, updatedAt: new Date() };

  // When the status is changing to verified/rejected, record who did it
  if (data.status && data.status !== existing.status) {
    patch.verifiedBy = requester.id;
  }

  const [updated] = await db
    .update(verifications)
    .set(patch)
    .where(eq(verifications.id, id))
    .returning();

  return updated;
}

/* ----------------------------- helper ----------------------------- */

/**
 * Returns true if all REQUIRED_TYPES have status='verified' for the property.
 * Used by the admin flow before flipping a property to `verified`.
 */
export async function isFullyVerified(propertyId) {
  const rows = await db
    .select({
      type: verifications.verificationType,
      status: verifications.status,
    })
    .from(verifications)
    .where(eq(verifications.propertyId, propertyId));

  const map = new Map(rows.map((r) => [r.type, r.status]));
  return REQUIRED_TYPES.every((t) => map.get(t) === "verified");
}
