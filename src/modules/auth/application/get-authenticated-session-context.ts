import type { AuthSessionReader } from "@/modules/auth/application/ports/auth-session-reader";

export function createGetAuthenticatedSessionContext(dependencies: {
  authSessionReader: AuthSessionReader;
}) {
  return async function getAuthenticatedSessionContext(headers: Headers) {
    return dependencies.authSessionReader.getSession(headers);
  };
}
