import { describe, expect, it, vi } from "vitest";

import type { UserProfileRepository } from "@/modules/users/application/ports/user-profile-repository";
import { createSyncUserProfileFromAuthIdentity } from "@/modules/users/application/sync-user-profile-from-auth-identity";

describe("createSyncUserProfileFromAuthIdentity", () => {
  it("creates a user profile when the auth user does not have one yet", async () => {
    const createdUserProfile = {
      bio: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      displayName: "OpenChat User",
      id: "auth-user-1",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      username: null,
    };

    const userProfileRepository: UserProfileRepository = {
      createForAuthUser: vi.fn().mockResolvedValue(createdUserProfile),
      deleteById: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByIds: vi.fn().mockResolvedValue([]),
      findByUsername: vi.fn(),
      updateById: vi.fn(),
    };

    const syncUserProfileFromAuthIdentity =
      createSyncUserProfileFromAuthIdentity({
        userProfileRepository,
      });

    await expect(
      syncUserProfileFromAuthIdentity({
        authUserId: "auth-user-1",
      }),
    ).resolves.toEqual(createdUserProfile);

    expect(userProfileRepository.findById).toHaveBeenCalledWith("auth-user-1");
    expect(userProfileRepository.createForAuthUser).toHaveBeenCalledWith(
      "auth-user-1",
    );
  });

  it("returns the existing profile when one is already provisioned", async () => {
    const existingUserProfile = {
      bio: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      displayName: "OpenChat User",
      id: "auth-user-1",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      username: "openchat_user",
    };

    const userProfileRepository: UserProfileRepository = {
      createForAuthUser: vi.fn(),
      deleteById: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingUserProfile),
      findByIds: vi.fn().mockResolvedValue([]),
      findByUsername: vi.fn(),
      updateById: vi.fn(),
    };

    const syncUserProfileFromAuthIdentity =
      createSyncUserProfileFromAuthIdentity({
        userProfileRepository,
      });

    await expect(
      syncUserProfileFromAuthIdentity({
        authUserId: "auth-user-1",
      }),
    ).resolves.toEqual(existingUserProfile);

    expect(userProfileRepository.createForAuthUser).not.toHaveBeenCalled();
  });
});
