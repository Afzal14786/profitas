import { pgTable, uuid, numeric, timestamp } from "drizzle-orm/pg-core";
import { properties } from "./properties.schema.js";
import { users } from "./users.schema.js";
import { partners } from "./partners.schema.js";
import {
  liquidityTypeEnum,
  liquidityStatusEnum,
  listingStatusEnum,
  offerStatusEnum,
  creditApplicationStatusEnum,
} from "./enums.js";

// --- liquidity requests (parent) ---
export const liquidityRequests = pgTable("liquidity_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  requestedBy: uuid("requested_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  liquidityType: liquidityTypeEnum("liquidity_type").notNull(),
  status: liquidityStatusEnum("status").notNull().default("requested"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- sell / match: listings ---
export const listings = pgTable("listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  liquidityRequestId: uuid("liquidity_request_id")
    .notNull()
    .references(() => liquidityRequests.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  askingPrice: numeric("asking_price", { precision: 14, scale: 2 }).notNull(),
  status: listingStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- sell / match: offers ---
export const offers = pgTable("offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  status: offerStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- get credit: applications ---
export const creditApplications = pgTable("credit_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  liquidityRequestId: uuid("liquidity_request_id")
    .notNull()
    .references(() => liquidityRequests.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  investorId: uuid("investor_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  lenderId: uuid("lender_id").references(() => partners.id, {
    onDelete: "set null",
  }),
  requestedAmount: numeric("requested_amount", {
    precision: 14,
    scale: 2,
  }).notNull(),
  status: creditApplicationStatusEnum("status").notNull().default("requested"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
