import { describe, expect, it } from "vitest";

import { parseAuthenticatedSessionContext } from "@/modules/auth/validation";

describe("parseAuthenticatedSessionContext", () => {
  it("parses the normalized Better Auth session shape", () => {
    const authenticatedSessionContext = parseAuthenticatedSessionContext({
      session: {
        expiresAt: new Date("2026-01-01T00:00:00.000Z"),
        id: "session-1",
        userId: "user-1",
      },
      user: {
        email: "user@example.com",
        emailVerified: true,
        id: "user-1",
        image: null,
        name: "OpenChat User",
      },
    });

    expect(authenticatedSessionContext.user.email).toBe("user@example.com");
    expect(authenticatedSessionContext.session.userId).toBe("user-1");
  });

  it("rejects malformed auth context input", () => {
    expect(() =>
      parseAuthenticatedSessionContext({
        session: {
          expiresAt: new Date("2026-01-01T00:00:00.000Z"),
          id: "session-1",
        },
        user: {
          email: "not-an-email",
          emailVerified: true,
          id: "user-1",
          image: null,
          name: "OpenChat User",
        },
      }),
    ).toThrow();
  });
});
