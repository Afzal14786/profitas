import env from "./src/configs/env.js";

import {defineConfig} from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/index.js",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    url : env.DATABASE_URL,
  },
});