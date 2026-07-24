import { and, eq } from "drizzle-orm";

import { roomMembers } from "@/db/schema";
import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";
import type { DrizzleRoomPersistence } from "@/modules/rooms/infrastructure/drizzle-room-persistence";
import { roomMembershipSchema } from "@/modules/rooms/validation";

function mapRoomMembership(row: typeof roomMembers.$inferSelect) {
  return roomMembershipSchema.parse(row);
}

export function createDrizzleRoomMembershipRepository(
  database: DrizzleRoomPersistence,
): RoomMembershipRepository {
  return {
    async create(input) {
      const [createdMembership] = await database
        .insert(roomMembers)
        .values({
          joinedAt: input.joinedAt,
          role: input.role,
          roomId: input.roomId,
          userId: input.userId,
        })
        .returning();

      return mapRoomMembership(createdMembership);
    },

    async deleteByRoomIdAndUserId(input) {
      await database
        .delete(roomMembers)
        .where(
          and(
            eq(roomMembers.roomId, input.roomId),
            eq(roomMembers.userId, input.userId),
          ),
        );
    },

    async findByRoomIdAndUserId(input) {
      const membership = await database.query.roomMembers.findFirst({
        where: and(
          eq(roomMembers.roomId, input.roomId),
          eq(roomMembers.userId, input.userId),
        ),
      });

      return membership ? mapRoomMembership(membership) : null;
    },
  };
}
