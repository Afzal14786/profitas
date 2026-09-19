import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["user", "admin"]).optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});