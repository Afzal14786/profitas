import { z } from "zod";

const propertyTypeEnumZ = z.enum([
  "commercial",
  "office",
  "retail",
  "industrial",
  "residential",
  "mixed_use",
]);

const propertyStatusEnumZ = z.enum([
  "draft",
  "pending_verification",
  "verified",
  "rejected",
  "archived",
]);

export const createPropertySchema = z.object({
  organizationId: z.string().uuid("Invalid organization id").optional(),
  ownerUserId: z.string().uuid("Invalid owner user id").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  location: z.string().min(2, "Location is required").max(255),
  address: z.string().max(1000).optional(),
  propertyType: propertyTypeEnumZ.default("commercial"),
  value: z.coerce.number().positive("Value must be greater than 0"),
  rentalYield: z.coerce.number().min(0).max(100).optional(),
  ownershipDetails: z.string().max(2000).optional(),
});

export const updatePropertySchema = z
  .object({
    name: z.string().min(2).max(200).optional(),
    location: z.string().min(2).max(255).optional(),
    address: z.string().max(1000).optional(),
    propertyType: propertyTypeEnumZ.optional(),
    value: z.coerce.number().positive().optional(),
    rentalYield: z.coerce.number().min(0).max(100).optional(),
    ownershipDetails: z.string().max(2000).optional(),
    status: propertyStatusEnumZ.optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field must be provided",
  });

export const updatePropertyStatusSchema = z.object({
  status: z.enum(["pending_verification", "verified", "rejected", "archived"]),
  reason: z.string().max(500).optional(),
});

export const listPropertiesQuerySchema = z.object({
  status: propertyStatusEnumZ.optional(),
  propertyType: propertyTypeEnumZ.optional(),
  organizationId: z.string().uuid().optional(),
  ownerUserId: z.string().uuid().optional(),
  minValue: z.coerce.number().nonnegative().optional(),
  maxValue: z.coerce.number().positive().optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid property id"),
});
