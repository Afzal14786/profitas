import dotenv from "dotenv";
dotenv.config({quiet: true});

import {env} from "./src/config/env.js";

import {defineConfig} from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url : env.DATABASE_URL,
  },
});