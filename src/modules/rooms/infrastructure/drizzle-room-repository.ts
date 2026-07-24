import { desc, eq } from "drizzle-orm";

import { rooms } from "@/db/schema";
import type {
  CreateRoomRecordInput,
  RoomRepository,
  UpdateRoomDetailsRecordInput,
} from "@/modules/rooms/application/ports/room-repository";
import {
  RoomNotFoundError,
  RoomSlugAlreadyExistsError,
} from "@/modules/rooms/domain/room";
import type { DrizzleRoomDatabase } from "@/modules/rooms/infrastructure/drizzle-room-database";
import { roomSchema } from "@/modules/rooms/validation";

function mapRoom(row: typeof rooms.$inferSelect) {
  return roomSchema.parse(row);
}

function isUniqueConstraintViolation(
  error: unknown,
  constraintName: string,
): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const code = "code" in error ? error.code : undefined;
  const constraint =
    "constraint_name" in error ? error.constraint_name : undefined;

  return code === "23505" && constraint === constraintName;
}

export function createDrizzleRoomRepository(
  database: DrizzleRoomDatabase,
): RoomRepository {
  return {
    async create(input: CreateRoomRecordInput) {
      try {
        const [createdRoom] = await database
          .insert(rooms)
          .values({
            description: input.description,
            name: input.name,
            ownerUserId: input.ownerUserId,
            slug: input.slug,
            topic: input.topic,
          })
          .returning();

        return mapRoom(createdRoom);
      } catch (error) {
        if (isUniqueConstraintViolation(error, "rooms_slug_key")) {
          throw new RoomSlugAlreadyExistsError(input.slug);
        }

        throw error;
      }
    },

    async findById(roomId) {
      const room = await database.query.rooms.findFirst({
        where: eq(rooms.id, roomId),
      });

      return room ? mapRoom(room) : null;
    },

    async findBySlug(slug) {
      const room = await database.query.rooms.findFirst({
        where: eq(rooms.slug, slug),
      });

      return room ? mapRoom(room) : null;
    },

    async list(input) {
      const roomList = await database.query.rooms.findMany({
        limit: input.limit,
        orderBy: [desc(rooms.createdAt)],
      });

      return roomList.map(mapRoom);
    },

    async updateDetailsById(input: UpdateRoomDetailsRecordInput) {
      const [updatedRoom] = await database
        .update(rooms)
        .set({
          description: input.description,
          name: input.name,
          topic: input.topic,
        })
        .where(eq(rooms.id, input.roomId))
        .returning();

      if (!updatedRoom) {
        throw new RoomNotFoundError(input.roomId);
      }

      return mapRoom(updatedRoom);
    },
  };
}
