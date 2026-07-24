import { describe, expect, it } from "vitest";

import {
  updateOwnUserProfileFormSchema,
  updateOwnUserProfileSchema,
} from "@/modules/users/validation";

describe("updateOwnUserProfileSchema", () => {
  it("normalizes nullable profile fields in the application command", () => {
    const command = updateOwnUserProfileSchema.parse({
      bio: "  Building a public chat platform.  ",
      userId: "user-1",
      username: "  openchat_builder  ",
    });

    expect(command).toEqual({
      bio: "Building a public chat platform.",
      userId: "user-1",
      username: "openchat_builder",
    });
  });

  it("allows empty optional profile fields to normalize to null", () => {
    const command = updateOwnUserProfileSchema.parse({
      bio: "   ",
      userId: "user-1",
      username: "   ",
    });

    expect(command).toEqual({
      bio: null,
      userId: "user-1",
      username: null,
    });
  });
});

describe("updateOwnUserProfileFormSchema", () => {
  it("reuses the same field rules for profile form input", () => {
    const formInput = updateOwnUserProfileFormSchema.parse({
      bio: "  Building a public chat platform.  ",
      username: "  openchat_builder  ",
    });

    expect(formInput).toEqual({
      bio: "Building a public chat platform.",
      username: "openchat_builder",
    });
  });
});
