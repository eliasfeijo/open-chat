import { getDatabase } from "@/db";
import { createCreateRoom } from "@/modules/rooms/application/create-room";
import { createListRooms } from "@/modules/rooms/application/list-rooms";
import { createDrizzleRoomMembershipRepository } from "@/modules/rooms/infrastructure/drizzle-room-membership-repository";
import { createDrizzleRoomRepository } from "@/modules/rooms/infrastructure/drizzle-room-repository";

function createRoomsServices() {
  const database = getDatabase();
  const roomRepository = createDrizzleRoomRepository(database);

  return {
    createRoom: createCreateRoom({
      roomRepository,
      runInTransaction: async (operation) =>
        database.transaction(async (transaction) =>
          operation({
            roomMembershipRepository:
              createDrizzleRoomMembershipRepository(transaction),
            roomRepository: createDrizzleRoomRepository(transaction),
          }),
        ),
    }),
    listRooms: createListRooms({
      roomRepository,
    }),
  };
}

export async function createRoom(input: {
  actorUserId: string;
  description: string;
  name: string;
  slug: string;
  topic: string;
}) {
  return createRoomsServices().createRoom(input);
}

export async function listRooms(input?: { limit?: number }) {
  return createRoomsServices().listRooms(input);
}

export type { Room, RoomMembership } from "@/modules/rooms/validation";
