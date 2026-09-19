import { pgEnum } from "drizzle-orm/pg-core";

// --- existing ---
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

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
  "legal_advocate",
  "property_manager",
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

// --- new for this phase ---
export const organizationMemberRoleEnum = pgEnum("organization_member_role", [
  "owner",
  "admin",
  "member",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "commercial",
  "office",
  "retail",
  "industrial",
  "residential",
  "mixed_use",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "title",
  "ownership",
  "encumbrance",
  "sale_agreement",
  "lease",
  "investment_agreement",
  "collateral",
  "compliance",
  "other",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "pending",
  "verified",
  "rejected",
]);

export const verificationTypeEnum = pgEnum("verification_type", [
  "title",
  "ownership",
  "encumbrance",
  "dispute",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "in_review",
  "verified",
  "rejected",
]);

export const complianceTypeEnum = pgEnum("compliance_type", [
  "regulatory",
  "documentation",
  "disclosure",
]);

export const complianceStatusEnum = pgEnum("compliance_status", [
  "pending",
  "in_review",
  "compliant",
  "non_compliant",
]);

export const listingStatusEnum = pgEnum("listing_status", [
  "active",
  "matched",
  "closed",
  "cancelled",
]);

export const offerStatusEnum = pgEnum("offer_status", [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
]);

export const creditApplicationStatusEnum = pgEnum("credit_application_status", [
  "requested",
  "routed",
  "approved",
  "rejected",
  "disbursed",
]);