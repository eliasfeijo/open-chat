import { describe, expect, it, vi } from "vitest";

import { createGetUserProfilesByIds } from "@/modules/users/application/get-user-profiles-by-ids";
import type { UserProfileRepository } from "@/modules/users/application/ports/user-profile-repository";

describe("createGetUserProfilesByIds", () => {
  it("normalizes and de-duplicates user ids before reading profiles", async () => {
    const userProfiles = [
      {
        bio: "Building public chat UX.",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: "user-1",
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        username: "openchat_builder",
      },
    ];
    const userProfileRepository = {
      createForAuthUser: vi.fn(),
      deleteById: vi.fn(),
      findById: vi.fn(),
      findByIds: vi.fn().mockResolvedValue(userProfiles),
      findByUsername: vi.fn(),
      updateById: vi.fn(),
    } satisfies UserProfileRepository;

    const getUserProfilesByIds = createGetUserProfilesByIds({
      userProfileRepository,
    });

    await expect(getUserProfilesByIds([" user-1 ", "user-1"])).resolves.toEqual(
      userProfiles,
    );

    expect(userProfileRepository.findByIds).toHaveBeenCalledWith(["user-1"]);
  });

  it("returns an empty list when there are no ids to resolve", async () => {
    const userProfileRepository = {
      createForAuthUser: vi.fn(),
      deleteById: vi.fn(),
      findById: vi.fn(),
      findByIds: vi.fn().mockResolvedValue([]),
      findByUsername: vi.fn(),
      updateById: vi.fn(),
    } satisfies UserProfileRepository;

    const getUserProfilesByIds = createGetUserProfilesByIds({
      userProfileRepository,
    });

    await expect(getUserProfilesByIds([])).resolves.toEqual([]);
    expect(userProfileRepository.findByIds).toHaveBeenCalledWith([]);
  });
});
