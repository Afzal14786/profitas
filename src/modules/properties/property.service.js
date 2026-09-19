import { eq, and, or, ilike, gte, lte, desc, sql, count } from "drizzle-orm";
import { db } from "../../db/index.js";
import { properties } from "../../db/schema/properties.schema.js";
import { organizations } from "../../db/schema/organizations.schema.js";
import { AppError } from "../../shared/utils/app-error.js";
import { ERROR_CODES } from "../../shared/constants/error-codes.js";
import { hasRoleInOrg, isMemberOfOrg } from "../../shared/utils/org-access.js";

/* ----------------------------- helpers ----------------------------- */

const OWNER_ORG_TYPES = ["property_owner", "property_developer"];
const ORG_MANAGER_ROLES = ["owner", "admin"];

function normalise(row) {
  if (!row) return row;
  return {
    ...row,
    value: row.value != null ? Number(row.value) : null,
    rentalYield: row.rentalYield != null ? Number(row.rentalYield) : null,
  };
}

async function getPropertyOrFail(propertyId) {
  const [row] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId));
  if (!row)
    throw new AppError("Property not found", 404, ERROR_CODES.NOT_FOUND);
  return row;
}

/**
 * Can the requester edit/archive this property?
 *  - admin: yes
 *  - owner via org: must have owner/admin role in the owning org
 *  - owner via user: must match ownerUserId
 */
async function canManage(property, requester) {
  if (requester.role === "admin") return true;

  if (property.organizationId) {
    return hasRoleInOrg(
      property.organizationId,
      requester.id,
      ORG_MANAGER_ROLES,
    );
  }

  if (property.ownerUserId && property.ownerUserId === requester.id)
    return true;

  return false;
}

/**
 * Allowed status transitions for a non-admin owner.
 * Admin bypasses this and can set any status.
 */
const OWNER_ALLOWED_TRANSITIONS = {
  draft: ["pending_verification", "archived"],
  pending_verification: ["archived"],
  verified: ["archived"],
  rejected: ["draft", "pending_verification", "archived"],
  archived: ["draft"],
};

function assertTransitionAllowed(from, to, requester) {
  if (requester.role === "admin") return;
  const allowed = OWNER_ALLOWED_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new AppError(
      `Cannot change status from "${from}" to "${to}"`,
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }
}

/* ----------------------------- create ----------------------------- */

export async function createProperty(requester, data) {
  let organizationId = null;
  let ownerUserId = null;

  if (data.organizationId) {
    // Verify organization exists
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, data.organizationId));
    if (!org) {
      throw new AppError("Organization not found", 404, ERROR_CODES.NOT_FOUND);
    }

    // Org must be an owner/developer type
    if (!OWNER_ORG_TYPES.includes(org.type)) {
      throw new AppError(
        `Organization of type "${org.type}" cannot own properties`,
        400,
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    // Requester must be owner/admin of the org (admins bypass)
    if (requester.role !== "admin") {
      const ok = await hasRoleInOrg(org.id, requester.id, ORG_MANAGER_ROLES);
      if (!ok) {
        throw new AppError(
          "Only organization owners/admins can add properties",
          403,
          ERROR_CODES.FORBIDDEN,
        );
      }
    }

    organizationId = org.id;
  } else {
    // No org provided → property belongs directly to a user.
    // Only admin can set someone else as owner.
    if (
      data.ownerUserId &&
      data.ownerUserId !== requester.id &&
      requester.role !== "admin"
    ) {
      throw new AppError(
        "You can only create properties for yourself",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }
    ownerUserId = data.ownerUserId || requester.id;
  }

  const [created] = await db
    .insert(properties)
    .values({
      organizationId,
      ownerUserId,
      name: data.name,
      location: data.location,
      address: data.address ?? null,
      propertyType: data.propertyType,
      value: String(data.value), // drizzle numeric accepts string
      rentalYield: data.rentalYield != null ? String(data.rentalYield) : null,
      ownershipDetails: data.ownershipDetails ?? null,
      status: "draft",
      createdBy: requester.id,
    })
    .returning();

  return normalise(created);
}

/* ----------------------------- read ----------------------------- */

export async function listProperties(filters) {
  const {
    status,
    propertyType,
    organizationId,
    ownerUserId,
    minValue,
    maxValue,
    q,
    page,
    limit,
  } = filters;

  const conditions = [];
  if (status) conditions.push(eq(properties.status, status));
  if (propertyType) conditions.push(eq(properties.propertyType, propertyType));
  if (organizationId)
    conditions.push(eq(properties.organizationId, organizationId));
  if (ownerUserId) conditions.push(eq(properties.ownerUserId, ownerUserId));
  if (minValue != null)
    conditions.push(gte(properties.value, String(minValue)));
  if (maxValue != null)
    conditions.push(lte(properties.value, String(maxValue)));
  if (q) {
    conditions.push(
      or(
        ilike(properties.name, `%${q}%`),
        ilike(properties.location, `%${q}%`),
      ),
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select()
    .from(properties)
    .where(where)
    .orderBy(desc(properties.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(properties)
    .where(where);

  const total = Number(totalRow?.total || 0);

  return {
    data: rows.map(normalise),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getPropertyById(propertyId) {
  const row = await getPropertyOrFail(propertyId);
  return normalise(row);
}

/* ----------------------------- update ----------------------------- */

export async function updateProperty(propertyId, requester, data) {
  const property = await getPropertyOrFail(propertyId);

  const allowed = await canManage(property, requester);
  if (!allowed) {
    throw new AppError(
      "You do not have permission to update this property",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  // If status is changing, validate the transition
  if (data.status && data.status !== property.status) {
    assertTransitionAllowed(property.status, data.status, requester);
  }

  const patch = { ...data, updatedAt: new Date() };
  if (patch.value != null) patch.value = String(patch.value);
  if (patch.rentalYield != null) patch.rentalYield = String(patch.rentalYield);

  const [updated] = await db
    .update(properties)
    .set(patch)
    .where(eq(properties.id, propertyId))
    .returning();

  return normalise(updated);
}

export async function updatePropertyStatus(propertyId, requester, { status }) {
  const property = await getPropertyOrFail(propertyId);

  // Admin-only endpoint (enforced by middleware, defensive here too)
  if (requester.role !== "admin") {
    throw new AppError(
      "Only admins can flip property status via this endpoint",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  const [updated] = await db
    .update(properties)
    .set({ status, updatedAt: new Date() })
    .where(eq(properties.id, propertyId))
    .returning();

  return normalise(updated);
}

/* ----------------------------- archive ----------------------------- */

export async function archiveProperty(propertyId, requester) {
  const property = await getPropertyOrFail(propertyId);

  const allowed = await canManage(property, requester);
  if (!allowed) {
    throw new AppError(
      "You do not have permission to archive this property",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  if (property.status === "archived") {
    throw new AppError(
      "Property is already archived",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const [updated] = await db
    .update(properties)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(properties.id, propertyId))
    .returning();

  return normalise(updated);
}
