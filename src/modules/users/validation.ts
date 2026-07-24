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

export type UserProfile = z.infer<typeof userProfileSchema>;
export type SyncUserProfileFromAuthIdentityInput = z.infer<
  typeof syncUserProfileFromAuthIdentitySchema
>;
