import { describe, expect, it, vi } from "vitest";

import type { UserProfileRepository } from "@/modules/users/application/ports/user-profile-repository";
import { createUpdateOwnUserProfile } from "@/modules/users/application/update-own-user-profile";
import {
  UserProfileNotFoundError,
  UsernameAlreadyTakenError,
} from "@/modules/users/domain/user-profile";

describe("createUpdateOwnUserProfile", () => {
  it("normalizes blank fields and updates the current user profile", async () => {
    const updatedUserProfile = {
      bio: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      id: "user-1",
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      username: null,
    };

    const userProfileRepository: UserProfileRepository = {
      createForAuthUser: vi.fn(),
      deleteById: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        bio: "Current bio",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: "user-1",
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        username: "current_user",
      }),
      findByIds: vi.fn().mockResolvedValue([]),
      findByUsername: vi.fn().mockResolvedValue(null),
      updateById: vi.fn().mockResolvedValue(updatedUserProfile),
    };

    const updateOwnUserProfile = createUpdateOwnUserProfile({
      userProfileRepository,
    });

    await expect(
      updateOwnUserProfile({
        bio: "",
        userId: "user-1",
        username: "",
      }),
    ).resolves.toEqual(updatedUserProfile);

    expect(userProfileRepository.updateById).toHaveBeenCalledWith({
      bio: null,
      userId: "user-1",
      username: null,
    });
  });

  it("rejects a username already owned by another profile", async () => {
    const userProfileRepository: UserProfileRepository = {
      createForAuthUser: vi.fn(),
      deleteById: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        bio: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: "user-1",
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        username: null,
      }),
      findByIds: vi.fn().mockResolvedValue([]),
      findByUsername: vi.fn().mockResolvedValue({
        bio: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: "user-2",
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        username: "taken_name",
      }),
      updateById: vi.fn(),
    };

    const updateOwnUserProfile = createUpdateOwnUserProfile({
      userProfileRepository,
    });

    await expect(
      updateOwnUserProfile({
        bio: "OpenChat user",
        userId: "user-1",
        username: "taken_name",
      }),
    ).rejects.toBeInstanceOf(UsernameAlreadyTakenError);

    expect(userProfileRepository.updateById).not.toHaveBeenCalled();
  });

  it("fails when the profile does not exist", async () => {
    const userProfileRepository: UserProfileRepository = {
      createForAuthUser: vi.fn(),
      deleteById: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByIds: vi.fn().mockResolvedValue([]),
      findByUsername: vi.fn(),
      updateById: vi.fn(),
    };

    const updateOwnUserProfile = createUpdateOwnUserProfile({
      userProfileRepository,
    });

    await expect(
      updateOwnUserProfile({
        bio: "OpenChat user",
        userId: "user-1",
        username: "valid_name",
      }),
    ).rejects.toBeInstanceOf(UserProfileNotFoundError);
  });
});
