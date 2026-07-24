import type { AuthSessionReader } from "@/modules/auth/application/ports/auth-session-reader";
import { getAuth } from "@/modules/auth/infrastructure/auth";
import { parseAuthenticatedSessionContext } from "@/modules/auth/validation";

export const betterAuthSessionReader: AuthSessionReader = {
  async getSession(headers) {
    const session = await getAuth().api.getSession({
      headers,
    });

    if (!session) {
      return null;
    }

    return parseAuthenticatedSessionContext({
      session: {
        expiresAt: session.session.expiresAt,
        id: session.session.id,
        userId: session.session.userId,
      },
      user: {
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        id: session.user.id,
        image: session.user.image ?? null,
        name: session.user.name,
      },
    });
  },
};
