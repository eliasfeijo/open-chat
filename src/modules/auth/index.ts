import { headers } from "next/headers";

import { createGetAuthenticatedSessionContext } from "@/modules/auth/application/get-authenticated-session-context";
import { createGetAuthenticatedUser } from "@/modules/auth/application/get-authenticated-user";
import { getAuth } from "@/modules/auth/infrastructure/auth";
import { betterAuthSessionReader } from "@/modules/auth/infrastructure/better-auth-session-reader";

const getAuthenticatedSessionContextUseCase =
  createGetAuthenticatedSessionContext({
    authSessionReader: betterAuthSessionReader,
  });

const getAuthenticatedUserUseCase = createGetAuthenticatedUser({
  authSessionReader: betterAuthSessionReader,
});

export async function getAuthenticatedSessionContext() {
  return getAuthenticatedSessionContextUseCase(await headers());
}

export async function getAuthenticatedUser() {
  return getAuthenticatedUserUseCase(await headers());
}

export type { AuthenticatedSessionContext } from "@/modules/auth/validation";
export { getAuth };
