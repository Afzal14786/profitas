import { eq, and, desc, count, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { complianceRecords } from "../../db/schema/compliance.schema.js";
import { properties } from "../../db/schema/properties.schema.js";
import { AppError } from "../../shared/utils/app-error.js";
import { ERROR_CODES } from "../../shared/constants/error-codes.js";

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

export async function createCompliance(requester, data) {
  await getPropertyOrFail(data.propertyId);

  // Prevent duplicate complianceType per property
  const [existing] = await db
    .select({ id: complianceRecords.id })
    .from(complianceRecords)
    .where(
      and(
        eq(complianceRecords.propertyId, data.propertyId),
        eq(complianceRecords.complianceType, data.complianceType),
      ),
    );

  if (existing) {
    throw new AppError(
      `A "${data.complianceType}" compliance record already exists for this property`,
      409,
      ERROR_CODES.CONFLICT,
    );
  }

  const [created] = await db
    .insert(complianceRecords)
    .values({
      propertyId: data.propertyId,
      complianceType: data.complianceType,
      status: "pending",
      remarks: data.remarks ?? null,
    })
    .returning();

  return created;
}

/* ----------------------------- read ----------------------------- */

export async function listCompliance({
  propertyId,
  complianceType,
  status,
  page,
  limit,
}) {
  const conditions = [];
  if (propertyId) conditions.push(eq(complianceRecords.propertyId, propertyId));
  if (complianceType)
    conditions.push(eq(complianceRecords.complianceType, complianceType));
  if (status) conditions.push(eq(complianceRecords.status, status));

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select()
    .from(complianceRecords)
    .where(where)
    .orderBy(desc(complianceRecords.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(complianceRecords)
    .where(where);

  const total = Number(totalRow?.total || 0);

  return {
    data: rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function getComplianceById(id) {
  const [row] = await db
    .select()
    .from(complianceRecords)
    .where(eq(complianceRecords.id, id));
  if (!row) {
    throw new AppError(
      "Compliance record not found",
      404,
      ERROR_CODES.NOT_FOUND,
    );
  }
  return row;
}

/* ----------------------------- update ----------------------------- */

export async function updateCompliance(id, requester, data) {
  const [existing] = await db
    .select()
    .from(complianceRecords)
    .where(eq(complianceRecords.id, id));
  if (!existing) {
    throw new AppError(
      "Compliance record not found",
      404,
      ERROR_CODES.NOT_FOUND,
    );
  }

  const patch = { ...data, updatedAt: new Date() };

  // Record reviewer when status changes
  if (data.status && data.status !== existing.status) {
    patch.reviewedBy = requester.id;
  }

  const [updated] = await db
    .update(complianceRecords)
    .set(patch)
    .where(eq(complianceRecords.id, id))
    .returning();

  return updated;
}

/* ----------------------------- stats ----------------------------- */

export async function getComplianceStats() {
  const [row] = await db
    .select({
      total: sql`COUNT(*)`.as("total"),
      pending:
        sql`COUNT(*) FILTER (WHERE ${complianceRecords.status} = 'pending')`.as(
          "pending",
        ),
      inReview:
        sql`COUNT(*) FILTER (WHERE ${complianceRecords.status} = 'in_review')`.as(
          "inReview",
        ),
      compliant:
        sql`COUNT(*) FILTER (WHERE ${complianceRecords.status} = 'compliant')`.as(
          "compliant",
        ),
      nonCompliant:
        sql`COUNT(*) FILTER (WHERE ${complianceRecords.status} = 'non_compliant')`.as(
          "nonCompliant",
        ),
    })
    .from(complianceRecords);

  return {
    total: Number(row.total) || 0,
    pending: Number(row.pending) || 0,
    inReview: Number(row.inReview) || 0,
    compliant: Number(row.compliant) || 0,
    nonCompliant: Number(row.nonCompliant) || 0,
  };
}
