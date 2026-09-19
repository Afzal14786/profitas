import { pgTable, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.schema.js";
import { users } from "./users.schema.js";
import { organizationMemberRoleEnum } from "./enums.js";

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleInOrg: organizationMemberRoleEnum("role_in_org")
    .notNull()
    .default("member"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
