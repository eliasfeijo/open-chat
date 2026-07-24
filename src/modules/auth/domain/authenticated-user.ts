import type { AuthenticatedSessionContext } from "@/modules/auth/validation";

export type AuthenticatedUser = AuthenticatedSessionContext["user"];

export function isAuthenticatedUser(
  user: AuthenticatedSessionContext | null,
): boolean {
  return user !== null;
}
