import { z } from "zod";

const authUserSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  name: z.string().min(1),
});

const authSessionSchema = z.object({
  expiresAt: z.date(),
  id: z.string().min(1),
  userId: z.string().min(1),
});

export const authenticatedSessionContextSchema = z.object({
  session: authSessionSchema,
  user: authUserSchema,
});

export type AuthenticatedSessionContext = z.infer<
  typeof authenticatedSessionContextSchema
>;

export function parseAuthenticatedSessionContext(input: unknown) {
  return authenticatedSessionContextSchema.parse(input);
}
