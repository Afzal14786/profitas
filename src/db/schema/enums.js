import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "user",
]);

export const organizationTypeEnum = pgEnum("organization_type", [
  "property_owner",
  "property_developer",
  "partner",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "draft",
  "pending_verification",
  "verified",
  "rejected",
  "archived",
]);

export const partnerTypeEnum = pgEnum("partner_type", [
  "bank",
  "nbfc",
  "institution",
  "property_platform",
]);

export const liquidityTypeEnum = pgEnum("liquidity_type", [
  "sell_match",
  "get_credit",
]);

export const liquidityStatusEnum = pgEnum("liquidity_status", [
  "requested",
  "processing",
  "completed",
  "rejected",
  "cancelled",
]);