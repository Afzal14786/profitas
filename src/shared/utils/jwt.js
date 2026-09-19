import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

if (!env.JWT_EXPIRATION || !env.JWT_REFRESH_EXPIRATION) {
  throw new Error(
    "JWT_EXPIRATION / JWT_REFRESH_EXPIRATION missing from parsed env. " +
    "Check src/config/env.js schema."
  );
}

export function generateAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION,
  });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRATION,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}