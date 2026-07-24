import { roomMembers } from "@/db/schema";
import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";
import type { DrizzleRoomDatabase } from "@/modules/rooms/infrastructure/drizzle-room-database";
import { roomMembershipSchema } from "@/modules/rooms/validation";

function mapRoomMembership(row: typeof roomMembers.$inferSelect) {
  return roomMembershipSchema.parse(row);
}

export function createDrizzleRoomMembershipRepository(
  database: DrizzleRoomDatabase,
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
  };
}
