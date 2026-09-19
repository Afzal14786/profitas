import { eq, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { organizationMembers } from "../../db/schema/organizationMembers.schema.js";

/**
 * Returns the membership row if the user belongs to the org, otherwise null.
 */
export async function getMembership(organizationId, userId) {
  const [row] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId)
      )
    );
  return row || null;
}

/**
 * Boolean check — is the user a member (any role) of the organization?
 */
export async function isMemberOfOrg(organizationId, userId) {
  const row = await getMembership(organizationId, userId);
  return Boolean(row);
}

/**
 * Boolean check — does the user have one of the specified roles in the org?
 * Example: hasRoleInOrg(orgId, userId, ["owner", "admin"])
 */
export async function hasRoleInOrg(organizationId, userId, roles) {
  const row = await getMembership(organizationId, userId);
  if (!row) return false;
  return roles.includes(row.roleInOrg);
}