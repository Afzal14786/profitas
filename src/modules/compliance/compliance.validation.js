import { z } from "zod";

const complianceTypeEnumZ = z.enum([
  "regulatory",
  "documentation",
  "disclosure",
]);

const complianceStatusEnumZ = z.enum([
  "pending",
  "in_review",
  "compliant",
  "non_compliant",
]);

export const createComplianceSchema = z.object({
  propertyId: z.string().uuid("Invalid property id"),
  complianceType: complianceTypeEnumZ,
  remarks: z.string().max(2000).optional(),
});

export const updateComplianceSchema = z
  .object({
    status: complianceStatusEnumZ.optional(),
    remarks: z.string().max(2000).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "At least one field must be provided",
  });

export const listComplianceQuerySchema = z.object({
  propertyId: z.string().uuid().optional(),
  complianceType: complianceTypeEnumZ.optional(),
  status: complianceStatusEnumZ.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid compliance record id"),
});
