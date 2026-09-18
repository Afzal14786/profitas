import dotenv from "dotenv";
dotenv.config();

const env = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "postgres://postgres:iamafzal@localhost:5432/profitas",
  JWT_SECRET: process.env.JWT_SECRET || "TpN5Xn7z0guKetGE56rEptFFjlu0ySWiFgM7TyHlpFC",
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "1h",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "JE6AkQwvCIkZw9uum1ItLEXeAaEfKXHWMZE22nDNDp8",
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || "7d",
  DB_POOL_MAX: process.env.DB_POOL_MAX || "50"
};

export default env;