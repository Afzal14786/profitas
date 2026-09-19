import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool);

export async function connectDatabase() {
  try {
    await db.execute(sql`SELECT 1`);

    logger.info("PostgreSQL database connected");
  } catch (error) {
    logger.error(error, "PostgreSQL database connection failed");

    throw error;
  }
}