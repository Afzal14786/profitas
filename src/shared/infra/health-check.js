import { sql } from "drizzle-orm";

import { db } from "../../db/index.js";

export async function checkDatabaseConnection() {
  await db.execute(sql`SELECT 1`);

  return true;
}