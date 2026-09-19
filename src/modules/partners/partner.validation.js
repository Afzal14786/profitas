import { z } from "zod";

const partnerTypeEnumZ = z.enum([
  "bank",
  "nbfc",
  "institution",
  "property_platform",
  "legal_advocate",
  "property_manager",
]);

export const createPartnerSchema = z.object({
  organizationId: z.string().uuid("Invalid organization id"),
  partnerType: partnerTypeEnumZ,
  contactPerson: z.string().max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().min(6).max(20).optional(),
  services: z.string().max(1000).optional(),
});

export const updatePartnerSchema = z
  .object({
    partnerType: partnerTypeEnumZ.optional(),
    contactPerson: z.string().max(100).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().min(6).max(20).optional(),
    services: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field must be provided",
  });

export const listPartnersQuerySchema = z.object({
  partnerType: partnerTypeEnumZ.optional(),
  isActive: z.coerce.boolean().optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid partner id"),
});
