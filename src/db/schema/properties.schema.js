import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

import { organizations } from "./organizations.schema.js";
import { users } from "./users.schema.js";
import { propertyStatusEnum, propertyTypeEnum } from "./enums.js";

export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "set null",
  }),
  ownerUserId: uuid("owner_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 200 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  address: text("address"),
  propertyType: propertyTypeEnum("property_type")
    .notNull()
    .default("commercial"),
  value: numeric("value", { precision: 14, scale: 2 }).notNull(),
  rentalYield: numeric("rental_yield", { precision: 5, scale: 2 }),
  ownershipDetails: text("ownership_details"),
  status: propertyStatusEnum("status").notNull().default("draft"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
