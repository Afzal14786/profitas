import { z } from "zod";

const verificationTypeEnumZ = z.enum([
  "title",
  "ownership",
  "encumbrance",
  "dispute",
]);

const verificationStatusEnumZ = z.enum([
  "pending",
  "in_review",
  "verified",
  "rejected",
]);

export const createVerificationSchema = z.object({
  propertyId: z.string().uuid("Invalid property id"),
  documentId: z.string().uuid("Invalid document id").optional(),
  verificationType: verificationTypeEnumZ,
  remarks: z.string().max(2000).optional(),
});

export const updateVerificationSchema = z
  .object({
    status: verificationStatusEnumZ.optional(),
    remarks: z.string().max(2000).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "At least one field must be provided",
  });

export const listVerificationsQuerySchema = z.object({
  propertyId: z.string().uuid().optional(),
  verificationType: verificationTypeEnumZ.optional(),
  status: verificationStatusEnumZ.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid verification id"),
});
