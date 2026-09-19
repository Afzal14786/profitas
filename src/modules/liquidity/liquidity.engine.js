import { eq, and, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { properties } from "../../db/schema/properties.schema.js";
import { liquidityRequests } from "../../db/schema/liquidity.schema.js";
import { AppError } from "../../shared/utils/app-error.js";
import { ERROR_CODES } from "../../shared/constants/error-codes.js";
import { hasRoleInOrg } from "../../shared/utils/org-access.js";

const BLOCKING_STATUSES = ["requested", "processing"];

/**
 * Throws if the property is not eligible for a new liquidity request.
 * Rules:
 *   1. Property exists
 *   2. Property.status === 'verified'
 *   3. No active (requested|processing) liquidity request on the same property
 */
export async function assertLiquidityEligibility(propertyId) {
  const [prop] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId));

  if (!prop) {
    throw new AppError("Property not found", 404, ERROR_CODES.NOT_FOUND);
  }

  if (prop.status !== "verified") {
    throw new AppError(
      `Property must be verified before liquidity can be requested (current: ${prop.status})`,
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const active = await db
    .select({ id: liquidityRequests.id })
    .from(liquidityRequests)
    .where(
      and(
        eq(liquidityRequests.propertyId, propertyId),
        inArray(liquidityRequests.status, BLOCKING_STATUSES),
      ),
    );

  if (active.length) {
    throw new AppError(
      "An active liquidity request already exists for this property",
      409,
      ERROR_CODES.CONFLICT,
    );
  }

  return prop;
}

/**
 * Ownership check — the requester must be the owner user or a member of the
 * owning organization with owner/admin role. Admins bypass.
 */
export async function assertPropertyOwnership(property, requester) {
  if (requester.role === "admin") return;

  if (property.ownerUserId && property.ownerUserId === requester.id) return;

  if (property.organizationId) {
    const allowed = await hasRoleInOrg(property.organizationId, requester.id, [
      "owner",
      "admin",
    ]);
    if (allowed) return;
  }

  throw new AppError(
    "You do not have permission to request liquidity for this property",
    403,
    ERROR_CODES.FORBIDDEN,
  );
}
