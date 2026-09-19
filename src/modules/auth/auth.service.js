import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.schema.js";
import { hashPassword, comparePassword } from "../../shared/utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../shared/utils/jwt.js";
import { AppError } from "../../shared/utils/app-error.js";
import { ERROR_CODES } from "../../shared/constants/error-codes.js";
import { ROLES } from "../../shared/constants/roles.js";

export async function registerUser({ name, email, password, role = ROLES.USER }) {
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    throw new AppError("Email already registered", 409, ERROR_CODES.CONFLICT);
  }

  const passwordHash = await hashPassword(password);

  const [newUser] = await db
    .insert(users)
    .values({ name, email, passwordHash, role })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });

  const accessToken = generateAccessToken({ sub: newUser.id, role: newUser.role });
  const refreshToken = generateRefreshToken({ sub: newUser.id });

  return { user: newUser, accessToken, refreshToken };
}

export async function loginUser({ email, password }) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new AppError("Invalid credentials", 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  if (!user.isActive) {
    throw new AppError("Account is disabled", 403, ERROR_CODES.FORBIDDEN);
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid credentials", 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const accessToken = generateAccessToken({ sub: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ sub: user.id });

  const { passwordHash, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid refresh token", 401, ERROR_CODES.UNAUTHORIZED);
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub));
  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive", 401, ERROR_CODES.UNAUTHORIZED);
  }

  const accessToken = generateAccessToken({ sub: user.id, role: user.role });
  return { accessToken };
}