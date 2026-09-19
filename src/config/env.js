import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

/**
 * @file env.js
 */

const timespanRegex = /^\d+[smhd]$/; // matches "15m", "1h", "7d", "30s"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(8000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  JWT_EXPIRATION: z
    .string()
    .regex(timespanRegex, 'JWT_EXPIRATION must be like "15m", "1h", "7d"'),

  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),

  JWT_REFRESH_EXPIRATION: z
    .string()
    .regex(
      timespanRegex,
      'JWT_REFRESH_EXPIRATION must be like "15m", "1h", "7d"',
    ),

  DB_POOL_MAX: z.coerce.number().int().positive().default(50),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_FOLDER: z.string().default("profitas/documents"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables:");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
