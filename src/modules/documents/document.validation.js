import { z } from "zod";

const documentTypeEnumZ = z.enum([
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

const documentStatusEnumZ = z.enum(["pending", "verified", "rejected"]);

export const createDocumentSchema = z.object({
  propertyId: z.string().uuid("Invalid property id"),
  documentType: documentTypeEnumZ,
  fileName: z.string().min(1).max(255).optional(),
});

export const listDocumentsQuerySchema = z.object({
  propertyId: z.string().uuid().optional(),
  documentType: documentTypeEnumZ.optional(),
  status: documentStatusEnumZ.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid document id"),
});
