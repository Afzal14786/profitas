import { eq, and, ilike, desc, count } from "drizzle-orm";
import { db } from "../../db/index.js";
import { partners } from "../../db/schema/partners.schema.js";
import { organizations } from "../../db/schema/organizations.schema.js";
import { AppError } from "../../shared/utils/app-error.js";
import { ERROR_CODES } from "../../shared/constants/error-codes.js";

export async function createPartner(data) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, data.organizationId));

  if (!org)
    throw new AppError("Organization not found", 404, ERROR_CODES.NOT_FOUND);
  if (org.type !== "partner") {
    throw new AppError(
      "Organization must be of type 'partner' to create a partner record",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const [existing] = await db
    .select({ id: partners.id })
    .from(partners)
    .where(eq(partners.organizationId, data.organizationId));

  if (existing) {
    throw new AppError(
      "This organization already has a partner record",
      409,
      ERROR_CODES.CONFLICT,
    );
  }

  const [created] = await db
    .insert(partners)
    .values({
      organizationId: data.organizationId,
      partnerType: data.partnerType,
      contactPerson: data.contactPerson ?? null,
      email: data.email ?? org.email,
      phone: data.phone ?? org.phone ?? null,
      services: data.services ?? null,
    })
    .returning();

  return { ...created, organization: org };
}

export async function listPartners({ partnerType, isActive, q, page, limit }) {
  const conditions = [];
  if (partnerType) conditions.push(eq(partners.partnerType, partnerType));
  if (typeof isActive === "boolean")
    conditions.push(eq(partners.isActive, isActive));
  if (q) {
    conditions.push(
      ilike(organizations.name, `%${q}%`), // joined filter
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      id: partners.id,
      organizationId: partners.organizationId,
      partnerType: partners.partnerType,
      contactPerson: partners.contactPerson,
      email: partners.email,
      phone: partners.phone,
      services: partners.services,
      isActive: partners.isActive,
      createdAt: partners.createdAt,
      updatedAt: partners.updatedAt,
      organizationName: organizations.name,
      organizationEmail: organizations.email,
    })
    .from(partners)
    .innerJoin(organizations, eq(partners.organizationId, organizations.id))
    .where(where)
    .orderBy(desc(partners.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(partners)
    .innerJoin(organizations, eq(partners.organizationId, organizations.id))
    .where(where);

  const total = Number(totalRow?.total || 0);

  return {
    data: rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function getPartnerById(id) {
  const [row] = await db
    .select({
      id: partners.id,
      organizationId: partners.organizationId,
      partnerType: partners.partnerType,
      contactPerson: partners.contactPerson,
      email: partners.email,
      phone: partners.phone,
      services: partners.services,
      isActive: partners.isActive,
      createdAt: partners.createdAt,
      updatedAt: partners.updatedAt,
      organization: {
        id: organizations.id,
        name: organizations.name,
        type: organizations.type,
        email: organizations.email,
      },
    })
    .from(partners)
    .innerJoin(organizations, eq(partners.organizationId, organizations.id))
    .where(eq(partners.id, id));

  if (!row) throw new AppError("Partner not found", 404, ERROR_CODES.NOT_FOUND);
  return row;
}

export async function updatePartner(id, data) {
  const [existing] = await db
    .select()
    .from(partners)
    .where(eq(partners.id, id));
  if (!existing)
    throw new AppError("Partner not found", 404, ERROR_CODES.NOT_FOUND);

  const [updated] = await db
    .update(partners)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(partners.id, id))
    .returning();

  return updated;
}

export async function deactivatePartner(id) {
  const [updated] = await db
    .update(partners)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(partners.id, id))
    .returning();
  if (!updated)
    throw new AppError("Partner not found", 404, ERROR_CODES.NOT_FOUND);
  return updated;
}
