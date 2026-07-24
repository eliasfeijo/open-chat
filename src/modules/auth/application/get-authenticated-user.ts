import type { AuthSessionReader } from "@/modules/auth/application/ports/auth-session-reader";

export function createGetAuthenticatedUser(dependencies: {
  authSessionReader: AuthSessionReader;
}) {
  return async function getAuthenticatedUser(headers: Headers) {
    const authenticatedSessionContext =
      await dependencies.authSessionReader.getSession(headers);

    return authenticatedSessionContext?.user ?? null;
  };
}
