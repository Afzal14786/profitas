import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  type: z.enum(["property_owner", "property_developer", "partner"]),
  email: z.string().email("Invalid email").max(255),
  phone: z.string().min(6).max(20).optional(),
  address: z.string().max(1000).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().min(6).max(20).optional(),
  address: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().uuid("Invalid user id"),
  roleInOrg: z.enum(["owner", "admin", "member"]).default("member"),
});

export const listOrganizationsQuerySchema = z.object({
  type: z.enum(["property_owner", "property_developer", "partner"]).optional(),
  isActive: z.coerce.boolean().optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid id"),
});

export const memberParamSchema = z.object({
  id: z.string().uuid("Invalid organization id"),
  userId: z.string().uuid("Invalid user id"),
});
