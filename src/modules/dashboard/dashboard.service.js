import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.schema.js";
import { properties } from "../../db/schema/properties.schema.js";
import { partners } from "../../db/schema/partners.schema.js";
import { complianceRecords } from "../../db/schema/compliance.schema.js";
import { verifications } from "../../db/schema/verifications.schema.js";
import { liquidityRequests } from "../../db/schema/liquidity.schema.js";

/* ------------------------------------------------------------------ */
/* Summary — feeds the four dashboard cards                            */
/* ------------------------------------------------------------------ */

export async function getSummary() {
  const [u] = await db.select({ c: sql`COUNT(*)`.as("c") }).from(users);
  const [p] = await db.select({ c: sql`COUNT(*)`.as("c") }).from(properties);
  const [pa] = await db.select({ c: sql`COUNT(*)`.as("c") }).from(partners);
  const [l] = await db
    .select({ c: sql`COUNT(*)`.as("c") })
    .from(complianceRecords);

  const [pendingVerif] = await db
    .select({ c: sql`COUNT(*)`.as("c") })
    .from(verifications)
    .where(sql`${verifications.status} = 'pending'`);

  const [activeLiq] = await db
    .select({ c: sql`COUNT(*)`.as("c") })
    .from(liquidityRequests)
    .where(sql`${liquidityRequests.status} IN ('requested','processing')`);

  const [verifiedProps] = await db
    .select({ c: sql`COUNT(*)`.as("c") })
    .from(properties)
    .where(sql`${properties.status} = 'verified'`);

  return {
    users: Number(u.c) || 0,
    assets: Number(p.c) || 0,
    partners: Number(pa.c) || 0,
    legal: Number(l.c) || 0,
    verifiedProperties: Number(verifiedProps.c) || 0,
    pendingVerifications: Number(pendingVerif.c) || 0,
    activeLiquidityRequests: Number(activeLiq.c) || 0,
  };
}

/* ------------------------------------------------------------------ */
/* Property cards — matches the PROPERTIES section in the spec         */
/* ------------------------------------------------------------------ */

export async function getDashboardProperties() {
  const rows = await db
    .select({
      id: properties.id,
      name: properties.name,
      location: properties.location,
      value: properties.value,
      rentalYield: properties.rentalYield,
      status: properties.status,
      propertyType: properties.propertyType,
    })
    .from(properties)
    .orderBy(sql`${properties.createdAt} DESC`)
    .limit(50);

  return rows.map((r) => ({
    ...r,
    value: r.value != null ? Number(r.value) : null,
    rentalYield: r.rentalYield != null ? Number(r.rentalYield) : null,
  }));
}
