import { relations } from "drizzle-orm";
import { users } from "./users.schema.js";
import { organizations } from "./organizations.schema.js";
import { organizationMembers } from "./organizationMembers.schema.js";
import { properties } from "./properties.schema.js";
import { partners } from "./partners.schema.js";
import { documents } from "./documents.schema.js";
import { verifications } from "./verifications.schema.js";
import { complianceRecords } from "./compliance.schema.js";
import {
  liquidityRequests,
  listings,
  offers,
  creditApplications,
} from "./liquidity.schema.js";

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(organizationMembers),
  createdProperties: many(properties),
  uploadedDocuments: many(documents),
  liquidityRequests: many(liquidityRequests),
  offers: many(offers),
  creditApplications: many(creditApplications),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  properties: many(properties),
  partners: many(partners),
}));

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [organizationMembers.userId],
      references: [users.id],
    }),
  }),
);

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [properties.organizationId],
    references: [organizations.id],
  }),
  owner: one(users, {
    fields: [properties.ownerUserId],
    references: [users.id],
  }),
  documents: many(documents),
  verifications: many(verifications),
  complianceRecords: many(complianceRecords),
  liquidityRequests: many(liquidityRequests),
}));

export const partnersRelations = relations(partners, ({ one }) => ({
  organization: one(organizations, {
    fields: [partners.organizationId],
    references: [organizations.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  property: one(properties, {
    fields: [documents.propertyId],
    references: [properties.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  property: one(properties, {
    fields: [verifications.propertyId],
    references: [properties.id],
  }),
  document: one(documents, {
    fields: [verifications.documentId],
    references: [documents.id],
  }),
  verifier: one(users, {
    fields: [verifications.verifiedBy],
    references: [users.id],
  }),
}));

export const complianceRecordsRelations = relations(
  complianceRecords,
  ({ one }) => ({
    property: one(properties, {
      fields: [complianceRecords.propertyId],
      references: [properties.id],
    }),
    reviewer: one(users, {
      fields: [complianceRecords.reviewedBy],
      references: [users.id],
    }),
  }),
);

export const liquidityRequestsRelations = relations(
  liquidityRequests,
  ({ one, many }) => ({
    property: one(properties, {
      fields: [liquidityRequests.propertyId],
      references: [properties.id],
    }),
    requestedByUser: one(users, {
      fields: [liquidityRequests.requestedBy],
      references: [users.id],
    }),
    listings: many(listings),
    creditApplications: many(creditApplications),
  }),
);

export const listingsRelations = relations(listings, ({ one, many }) => ({
  liquidityRequest: one(liquidityRequests, {
    fields: [listings.liquidityRequestId],
    references: [liquidityRequests.id],
  }),
  property: one(properties, {
    fields: [listings.propertyId],
    references: [properties.id],
  }),
  offers: many(offers),
}));

export const offersRelations = relations(offers, ({ one }) => ({
  listing: one(listings, {
    fields: [offers.listingId],
    references: [listings.id],
  }),
  buyer: one(users, {
    fields: [offers.buyerId],
    references: [users.id],
  }),
}));

export const creditApplicationsRelations = relations(
  creditApplications,
  ({ one }) => ({
    liquidityRequest: one(liquidityRequests, {
      fields: [creditApplications.liquidityRequestId],
      references: [liquidityRequests.id],
    }),
    property: one(properties, {
      fields: [creditApplications.propertyId],
      references: [properties.id],
    }),
    investor: one(users, {
      fields: [creditApplications.investorId],
      references: [users.id],
    }),
    lender: one(partners, {
      fields: [creditApplications.lenderId],
      references: [partners.id],
    }),
  }),
);
