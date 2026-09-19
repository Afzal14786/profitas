import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/app-error.js";
import { ERROR_CODES } from "../constants/error-codes.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401, ERROR_CODES.UNAUTHORIZED));
  }

  const token = header.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401, ERROR_CODES.UNAUTHORIZED));
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401, ERROR_CODES.UNAUTHORIZED));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403, ERROR_CODES.FORBIDDEN));
    }
    next();
  };
}