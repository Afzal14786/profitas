// this file is responsible for connecting database

import env from "./env.js";

import {Pool} from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import {sql} from "drizzle-orm";

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: env.DB_POOL_MAX,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

export const database = drizzle(pool);

export const connectDatabase = async () => {
    try {
        await database.execute(sql`SELECT 1`);

        console.info("PostgreSQL database connected");
    } catch (error) {
        console.error("PostgreSQL database connection failed");
        throw error;
    }
};