import {
  and,
  asc,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import type { Database } from "@/db";
import { messages, roomMembers, roomTags, rooms, tags } from "@/db/schema";
import type { RoomSearchRepository } from "@/modules/search/application/ports/room-search-repository";
import { roomSearchResultSchema } from "@/modules/search/validation";
import { tagSchema } from "@/modules/tags/validation";

function combineConditions(conditions: Array<SQL | undefined>) {
  const definedConditions = conditions.filter(
    (condition): condition is SQL => condition !== undefined,
  );

  if (definedConditions.length === 0) {
    return undefined;
  }

  if (definedConditions.length === 1) {
    return definedConditions[0];
  }

  return and(...definedConditions);
}

function toDateOrNull(value: Date | string | null): Date | null {
  if (value === null) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

function toNonNegativeInteger(
  value: number | string | null | undefined,
): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number.parseInt(value, 10);

    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  }

  return 0;
}

export function createDrizzleRoomSearchRepository(
  database: Database,
): RoomSearchRepository {
  const roomMemberCounts = database
    .select({
      memberCount: sql<number>`count(*)::int`.as("member_count"),
      roomId: roomMembers.roomId,
    })
    .from(roomMembers)
    .groupBy(roomMembers.roomId)
    .as("room_member_counts");

  const roomMessageStats = database
    .select({
      latestMessageAt: sql<Date | null>`max(${messages.createdAt})`.as(
        "latest_message_at",
      ),
      messageCount: sql<number>`count(*)::int`.as("message_count"),
      roomId: messages.roomId,
    })
    .from(messages)
    .groupBy(messages.roomId)
    .as("room_message_stats");

  return {
    async search(input) {
      const textCondition = input.query
        ? or(
            ilike(rooms.name, `%${input.query}%`),
            ilike(rooms.description, `%${input.query}%`),
            ilike(rooms.topic, `%${input.query}%`),
          )
        : undefined;
      const tagCondition = input.tagSlug
        ? exists(
            database
              .select({ matched: sql<number>`1` })
              .from(roomTags)
              .innerJoin(tags, eq(tags.id, roomTags.tagId))
              .where(
                and(
                  eq(roomTags.roomId, rooms.id),
                  eq(tags.slug, input.tagSlug),
                ),
              ),
          )
        : undefined;
      const whereClause = combineConditions([textCondition, tagCondition]);

      const roomIdRows = await database
        .select({ id: rooms.id })
        .from(rooms)
        .where(whereClause)
        .orderBy(desc(rooms.createdAt))
        .limit(input.limit);
      const roomIds = roomIdRows.map((room) => room.id);

      if (roomIds.length === 0) {
        return [];
      }

      const rows = await database
        .select({
          createdAt: rooms.createdAt,
          description: rooms.description,
          id: rooms.id,
          latestMessageAt: roomMessageStats.latestMessageAt,
          memberCount: roomMemberCounts.memberCount,
          messageCount: roomMessageStats.messageCount,
          name: rooms.name,
          ownerUserId: rooms.ownerUserId,
          slug: rooms.slug,
          tagId: tags.id,
          tagName: tags.name,
          tagSlug: tags.slug,
          topic: rooms.topic,
          updatedAt: rooms.updatedAt,
        })
        .from(rooms)
        .leftJoin(roomMemberCounts, eq(roomMemberCounts.roomId, rooms.id))
        .leftJoin(roomMessageStats, eq(roomMessageStats.roomId, rooms.id))
        .leftJoin(roomTags, eq(roomTags.roomId, rooms.id))
        .leftJoin(tags, eq(tags.id, roomTags.tagId))
        .where(inArray(rooms.id, roomIds))
        .orderBy(desc(rooms.createdAt), asc(tags.name));

      const resultsByRoomId = new Map<
        string,
        ReturnType<typeof roomSearchResultSchema.parse>
      >();

      for (const row of rows) {
        const existingResult = resultsByRoomId.get(row.id);

        if (!existingResult) {
          resultsByRoomId.set(
            row.id,
            roomSearchResultSchema.parse({
              createdAt: row.createdAt,
              description: row.description,
              id: row.id,
              latestMessageAt: toDateOrNull(row.latestMessageAt),
              memberCount: toNonNegativeInteger(row.memberCount),
              messageCount: toNonNegativeInteger(row.messageCount),
              name: row.name,
              ownerUserId: row.ownerUserId,
              slug: row.slug,
              tags: [],
              topic: row.topic,
              updatedAt: row.updatedAt,
            }),
          );
        }

        if (row.tagId && row.tagName && row.tagSlug) {
          resultsByRoomId.get(row.id)?.tags.push(
            tagSchema.parse({
              id: row.tagId,
              name: row.tagName,
              slug: row.tagSlug,
            }),
          );
        }
      }

      return roomIds
        .map((roomId) => resultsByRoomId.get(roomId))
        .filter((room): room is NonNullable<typeof room> => room !== undefined);
    },
  };
}
