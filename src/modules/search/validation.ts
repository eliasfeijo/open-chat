import { z } from "zod";

import { tagSchema, tagSlugSchema } from "@/modules/tags/validation";

const roomSearchTextSchema = z
  .string()
  .trim()
  .max(80, {
    message: "Search text must be at most 80 characters long.",
  })
  .transform((value) => (value === "" ? null : value));

const optionalTagSlugSchema = z
  .union([tagSlugSchema, z.literal(""), z.null(), z.undefined()])
  .transform((value) => {
    if (!value) {
      return null;
    }

    return value;
  });

export const roomSearchResultSchema = z.object({
  createdAt: z.date(),
  description: z.string().nullable(),
  id: z.uuid(),
  latestMessageAt: z.date().nullable(),
  memberCount: z.number().int().nonnegative(),
  messageCount: z.number().int().nonnegative(),
  name: z.string(),
  ownerUserId: z.string().trim().min(1),
  slug: z.string(),
  tags: z.array(tagSchema),
  topic: z.string().nullable(),
  updatedAt: z.date(),
});

export const searchRoomsSchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(20),
  page: z.coerce.number().int().positive().max(1000).default(1),
  query: roomSearchTextSchema.optional().default(null),
  tagSlug: optionalTagSlugSchema.default(null),
});

export const paginatedRoomSearchResultSchema = z.object({
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  items: z.array(roomSearchResultSchema),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
});

export type RoomSearchResult = z.infer<typeof roomSearchResultSchema>;
export type PaginatedRoomSearchResult = z.infer<
  typeof paginatedRoomSearchResultSchema
>;
export type SearchRoomsInput = z.infer<typeof searchRoomsSchema>;
