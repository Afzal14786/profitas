import { eq, and, desc, ilike, sql, count } from "drizzle-orm";
import { db } from "../../db/index.js";
import { organizations } from "../../db/schema/organizations.schema.js";
import { organizationMembers } from "../../db/schema/organizationMembers.schema.js";
import { users } from "../../db/schema/users.schema.js";
import { AppError } from "../../shared/utils/app-error.js";
import { ERROR_CODES } from "../../shared/constants/error-codes.js";

/* ----------------------------- helpers ----------------------------- */

async function isMember(organizationId, userId) {
  const [row] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId),
      ),
    );
  return row || null;
}

async function isOwnerOrAdmin(organizationId, userId) {
  const membership = await isMember(organizationId, userId);
  if (!membership) return false;
  return membership.roleInOrg === "owner" || membership.roleInOrg === "admin";
}

async function countOwners(organizationId) {
  const [row] = await db
    .select({ total: count() })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.roleInOrg, "owner"),
      ),
    );
  return Number(row?.total || 0);
}

/* ----------------------------- create ----------------------------- */

export async function createOrganization(userId, data) {
  const [existing] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.email, data.email));

  if (existing) {
    throw new AppError(
      "Organization email already registered",
      409,
      ERROR_CODES.CONFLICT,
    );
  }

  const [org] = await db
    .insert(organizations)
    .values({
      name: data.name,
      type: data.type,
      email: data.email,
      phone: data.phone ?? null,
      address: data.address ?? null,
    })
    .returning();

  // Creator becomes owner
  await db.insert(organizationMembers).values({
    organizationId: org.id,
    userId,
    roleInOrg: "owner",
  });

  return org;
}

/* ----------------------------- read ----------------------------- */

export async function listOrganizations({ type, isActive, q, page, limit }) {
  const filters = [];
  if (type) filters.push(eq(organizations.type, type));
  if (typeof isActive === "boolean")
    filters.push(eq(organizations.isActive, isActive));
  if (q) filters.push(ilike(organizations.name, `%${q}%`));

  const where = filters.length ? and(...filters) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select()
    .from(organizations)
    .where(where)
    .orderBy(desc(organizations.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(organizations)
    .where(where);

  const total = Number(totalRow?.total || 0);

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function listMyOrganizations(userId) {
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      type: organizations.type,
      email: organizations.email,
      phone: organizations.phone,
      address: organizations.address,
      isActive: organizations.isActive,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
      roleInOrg: organizationMembers.roleInOrg,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizationMembers.organizationId, organizations.id),
    )
    .where(eq(organizationMembers.userId, userId))
    .orderBy(desc(organizations.createdAt));

  return rows;
}

export async function getOrganizationById(organizationId, requester) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId));

  if (!org)
    throw new AppError("Organization not found", 404, ERROR_CODES.NOT_FOUND);

  if (requester.role === "admin") return org;

  const membership = await isMember(organizationId, requester.id);
  if (!membership) {
    throw new AppError(
      "You are not a member of this organization",
      403,
      ERROR_CODES.FORBIDDEN,
    );
  }

  return { ...org, roleInOrg: membership.roleInOrg };
}

/* ----------------------------- update ----------------------------- */

export async function updateOrganization(organizationId, requester, data) {
  if (requester.role !== "admin") {
    const allowed = await isOwnerOrAdmin(organizationId, requester.id);
    if (!allowed) {
      throw new AppError(
        "Only organization owners/admins can update",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }
  }

  if (data.email) {
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.email, data.email));
    if (existing && existing.id !== organizationId) {
      throw new AppError(
        "Email already in use by another organization",
        409,
        ERROR_CODES.CONFLICT,
      );
    }
  }

  const [updated] = await db
    .update(organizations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(organizations.id, organizationId))
    .returning();

  if (!updated)
    throw new AppError("Organization not found", 404, ERROR_CODES.NOT_FOUND);
  return updated;
}

/* ----------------------------- members ----------------------------- */

export async function addMember(
  organizationId,
  requester,
  { userId, roleInOrg },
) {
  if (requester.role !== "admin") {
    const allowed = await isOwnerOrAdmin(organizationId, requester.id);
    if (!allowed) {
      throw new AppError(
        "Only organization owners/admins can add members",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }
  }

  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.id, organizationId));
  if (!org)
    throw new AppError("Organization not found", 404, ERROR_CODES.NOT_FOUND);

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId));
  if (!user) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);

  const existing = await isMember(organizationId, userId);
  if (existing) {
    throw new AppError(
      "User is already a member of this organization",
      409,
      ERROR_CODES.CONFLICT,
    );
  }

  const [membership] = await db
    .insert(organizationMembers)
    .values({ organizationId, userId, roleInOrg })
    .returning();

  return { ...membership, user };
}

export async function removeMember(organizationId, requester, targetUserId) {
  if (requester.role !== "admin") {
    const allowed = await isOwnerOrAdmin(organizationId, requester.id);
    if (!allowed) {
      throw new AppError(
        "Only organization owners/admins can remove members",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }
  }

  const membership = await isMember(organizationId, targetUserId);
  if (!membership) {
    throw new AppError(
      "User is not a member of this organization",
      404,
      ERROR_CODES.NOT_FOUND,
    );
  }

  // Prevent removing last owner
  if (membership.roleInOrg === "owner") {
    const total = await countOwners(organizationId);
    if (total <= 1) {
      throw new AppError(
        "Cannot remove the last owner of the organization",
        400,
        ERROR_CODES.VALIDATION_ERROR,
      );
    }
  }

  await db
    .delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, targetUserId),
      ),
    );

  return { message: "Member removed successfully" };
}

export async function listMembers(organizationId, requester) {
  if (requester.role !== "admin") {
    const membership = await isMember(organizationId, requester.id);
    if (!membership) {
      throw new AppError(
        "You are not a member of this organization",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }
  }

  const rows = await db
    .select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
      roleInOrg: organizationMembers.roleInOrg,
      joinedAt: organizationMembers.createdAt,
      name: users.name,
      email: users.email,
    })
    .from(organizationMembers)
    .innerJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, organizationId))
    .orderBy(desc(organizationMembers.createdAt));

  return rows;
}
