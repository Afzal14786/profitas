import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { properties } from "./properties.schema.js";
import { documents } from "./documents.schema.js";
import { users } from "./users.schema.js";
import { verificationTypeEnum, verificationStatusEnum } from "./enums.js";

export const verifications = pgTable("verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").references(() => documents.id, {
    onDelete: "set null",
  }),
  verificationType: verificationTypeEnum("verification_type").notNull(),
  status: verificationStatusEnum("status").notNull().default("pending"),
  verifiedBy: uuid("verified_by").references(() => users.id, {
    onDelete: "set null",
  }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
