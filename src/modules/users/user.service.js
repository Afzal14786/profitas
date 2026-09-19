import { eq, desc, count, and, or, ilike } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.schema.js";
import { AppError } from "../../shared/utils/app-error.js";
import { ERROR_CODES } from "../../shared/constants/error-codes.js";

const safeUserColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  isActive: users.isActive,
  lastLoginAt: users.lastLoginAt,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export async function getProfile(userId) {
  const [user] = await db.select(safeUserColumns).from(users).where(eq(users.id, userId));
  if (!user) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  return user;
}

export async function updateProfile(userId, data) {
  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning(safeUserColumns);
  if (!updated) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  return updated;
}

export async function listUsers({ q, role, isActive, page, limit }) {
  const conditions = [];

  if (role) conditions.push(eq(users.role, role));
  if (typeof isActive === "boolean") {
    conditions.push(eq(users.isActive, isActive));
  }
  if (q) {
    conditions.push(
      or(
        ilike(users.name, `%${q}%`),
        ilike(users.email, `%${q}%`)
      )
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select(safeUserColumns)
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(users)
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

export async function updateUserById(userId, data) {
  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning(safeUserColumns);
  if (!updated) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  return updated;
}

export async function deactivateUser(userId) {
  const [updated] = await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning(safeUserColumns);
  if (!updated) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  return updated;
}

export async function getUserById(userId) {
  const [user] = await db
    .select(safeUserColumns)
    .from(users)
    .where(eq(users.id, userId));
  if (!user) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  return user;
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError("Current password is incorrect", 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  const newHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return { message: "Password updated successfully" };
}

export async function activateUser(userId) {
  const [updated] = await db
    .update(users)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning(safeUserColumns);
  if (!updated) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  return updated;
}

export async function getUserStats() {
  const [row] = await db
    .select({
      total: sql`COUNT(*)`.as("total"),
      active: sql`COUNT(*) FILTER (WHERE ${users.isActive} = true)`.as("active"),
      inactive: sql`COUNT(*) FILTER (WHERE ${users.isActive} = false)`.as("inactive"),
      admins: sql`COUNT(*) FILTER (WHERE ${users.role} = 'admin')`.as("admins"),
      investors: sql`COUNT(*) FILTER (WHERE ${users.role} = 'user')`.as("investors"),
    })
    .from(users);

  return {
    total: Number(row.total) || 0,
    active: Number(row.active) || 0,
    inactive: Number(row.inactive) || 0,
    admins: Number(row.admins) || 0,
    investors: Number(row.investors) || 0,
  };
}