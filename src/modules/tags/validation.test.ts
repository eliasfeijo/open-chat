import { describe, expect, it } from "vitest";

import {
  tagSlugListFromTextSchema,
  tagSlugSchema,
} from "@/modules/tags/validation";

describe("tagSlugSchema", () => {
  it("normalizes lowercase slug input", () => {
    expect(tagSlugSchema.parse("  TypeScript  ")).toBe("typescript");
  });

  it("rejects invalid slugs", () => {
    expect(() => tagSlugSchema.parse("bad tag")).toThrow();
  });
});

describe("tagSlugListFromTextSchema", () => {
  it("parses a comma-separated list into unique normalized slugs", () => {
    expect(
      tagSlugListFromTextSchema.parse(
        "  TypeScript, nextjs , search, TypeScript  ",
      ),
    ).toEqual(["typescript", "nextjs", "search"]);
  });

  it("allows an empty field", () => {
    expect(tagSlugListFromTextSchema.parse("   ")).toEqual([]);
  });

  it("reports invalid tag input at the offending item path", () => {
    const result = tagSlugListFromTextSchema.safeParse("test, let's chat");

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.issues[0]).toMatchObject({
      message:
        "Tags can only contain lowercase letters, numbers, and single hyphens.",
      path: [1],
    });
  });
});
