import { z } from "zod";

export const roomIdSchema = z.uuid();

export const tagIdSchema = z.uuid();

export const tagSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, {
    message: "Tags must be at least 2 characters long.",
  })
  .max(24, {
    message: "Tags must be at most 24 characters long.",
  })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      "Tags can only contain lowercase letters, numbers, and single hyphens.",
  });

export const tagSchema = z.object({
  id: tagIdSchema,
  name: tagSlugSchema,
  slug: tagSlugSchema,
});

export const tagSlugListSchema = z
  .array(tagSlugSchema)
  .max(5, {
    message: "Rooms can have at most 5 tags.",
  })
  .transform((tagSlugs) => Array.from(new Set(tagSlugs)));

export const tagSlugListFromTextSchema = z
  .string()
  .trim()
  .max(120, {
    message: "Tags must be at most 120 characters long in total.",
  })
  .transform((value) => {
    if (value === "") {
      return [];
    }

    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  })
  .pipe(tagSlugListSchema);

export type Tag = z.infer<typeof tagSchema>;
