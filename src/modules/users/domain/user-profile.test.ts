import { describe, expect, it } from "vitest";

import {
  canManageUserProfile,
  createEmptyUserProfile,
} from "@/modules/users/domain/user-profile";

describe("user profile domain", () => {
  it("allows users to manage their own profile", () => {
    expect(canManageUserProfile("user-1", "user-1")).toBe(true);
    expect(canManageUserProfile("user-1", "user-2")).toBe(false);
  });

  it("creates an empty app-owned profile for a new auth user", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const updatedAt = new Date("2026-01-01T00:00:00.000Z");

    expect(
      createEmptyUserProfile({
        authUserId: "auth-user-1",
        createdAt,
        displayName: "OpenChat User",
        updatedAt,
      }),
    ).toEqual({
      bio: null,
      createdAt,
      displayName: "OpenChat User",
      id: "auth-user-1",
      updatedAt,
      username: null,
    });
  });
});
