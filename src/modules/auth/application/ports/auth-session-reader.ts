import type { AuthenticatedSessionContext } from "@/modules/auth/validation";

export interface AuthSessionReader {
  getSession(headers: Headers): Promise<AuthenticatedSessionContext | null>;
}
