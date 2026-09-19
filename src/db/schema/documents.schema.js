import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

import { properties } from "./properties.schema.js";
import { users } from "./users.schema.js";
import { documentTypeEnum, documentStatusEnum } from "./enums.js";

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  documentType: documentTypeEnum("document_type").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  // Cloudinary fields
  cloudinaryPublicId: varchar("cloudinary_public_id", {
    length: 255,
  }).notNull(),
  cloudinaryUrl: text("cloudinary_url").notNull(),
  cloudinaryFormat: varchar("cloudinary_format", { length: 20 }),
  cloudinaryBytes: integer("cloudinary_bytes"),
  status: documentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
