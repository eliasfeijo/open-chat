import { z } from "zod";

export const userIdSchema = z.string().min(1);

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9_]+$/);

export const userBioSchema = z.string().trim().max(160);

export const userProfileSchema = z.object({
  id: userIdSchema,
  username: usernameSchema.nullable(),
  bio: userBioSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const syncUserProfileFromAuthIdentitySchema = z.object({
  authUserId: userIdSchema,
});

const editableUsernameSchema = z
  .string()
  .trim()
  .max(32)
  .regex(/^[a-z0-9_]*$/)
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || value.length >= 3, {
    message: "Username must be at least 3 characters long.",
  });

const editableBioSchema = z
  .string()
  .trim()
  .max(160)
  .transform((value) => (value === "" ? null : value));

export const updateOwnUserProfileSchema = z.object({
  bio: editableBioSchema,
  userId: userIdSchema,
  username: editableUsernameSchema,
});

export const updateOwnUserProfileFormSchema = updateOwnUserProfileSchema.omit({
  userId: true,
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type SyncUserProfileFromAuthIdentityInput = z.infer<
  typeof syncUserProfileFromAuthIdentitySchema
>;
export type UpdateOwnUserProfileInput = z.infer<
  typeof updateOwnUserProfileSchema
>;
