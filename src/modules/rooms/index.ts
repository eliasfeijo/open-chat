import { getDatabase } from "@/db";
import { createAuthorizeRoomRealtimeSubscription } from "@/modules/rooms/application/authorize-room-realtime-subscription";
import { createCreateRoom } from "@/modules/rooms/application/create-room";
import { createGetRoomBySlug } from "@/modules/rooms/application/get-room-by-slug";
import { createGetRoomMembership } from "@/modules/rooms/application/get-room-membership";
import { createJoinRoom } from "@/modules/rooms/application/join-room";
import { createLeaveRoom } from "@/modules/rooms/application/leave-room";
import { createListRooms } from "@/modules/rooms/application/list-rooms";
import { createUpdateRoomDetails } from "@/modules/rooms/application/update-room-details";
import { createDrizzleRoomMembershipRepository } from "@/modules/rooms/infrastructure/drizzle-room-membership-repository";
import { createDrizzleRoomRepository } from "@/modules/rooms/infrastructure/drizzle-room-repository";
import { createTagsServices } from "@/modules/tags";

function createRoomsServices() {
  const database = getDatabase();
  const roomMembershipRepository =
    createDrizzleRoomMembershipRepository(database);
  const roomRepository = createDrizzleRoomRepository(database);

  return {
    authorizeRoomRealtimeSubscription: createAuthorizeRoomRealtimeSubscription({
      roomMembershipRepository,
    }),
    createRoom: createCreateRoom({
      roomRepository,
      runInTransaction: async (operation) =>
        database.transaction(async (transaction) =>
          operation({
            assignTagsToRoom: createTagsServices(transaction).assignTagsToRoom,
            roomMembershipRepository:
              createDrizzleRoomMembershipRepository(transaction),
            roomRepository: createDrizzleRoomRepository(transaction),
          }),
        ),
    }),
    getRoomBySlug: createGetRoomBySlug({
      roomRepository,
    }),
    getRoomMembership: createGetRoomMembership({
      roomMembershipRepository,
    }),
    joinRoom: createJoinRoom({
      roomMembershipRepository,
      roomRepository,
    }),
    leaveRoom: createLeaveRoom({
      roomMembershipRepository,
    }),
    listRooms: createListRooms({
      roomRepository,
    }),
    updateRoomDetails: createUpdateRoomDetails({
      roomRepository,
      runInTransaction: async (operation) =>
        database.transaction(async (transaction) =>
          operation({
            replaceRoomTags: createTagsServices(transaction).replaceRoomTags,
            roomRepository: createDrizzleRoomRepository(transaction),
          }),
        ),
    }),
  };
}

export async function createRoom(input: {
  actorUserId: string | null;
  description: string | null;
  name: string;
  slug: string;
  tagSlugs: string[];
  topic: string | null;
}) {
  return createRoomsServices().createRoom(input);
}

export async function authorizeRoomRealtimeSubscription(input: {
  actorUserId: string | null;
  roomId: string;
}) {
  return createRoomsServices().authorizeRoomRealtimeSubscription(input);
}

export async function listRooms(input?: { limit?: number }) {
  return createRoomsServices().listRooms(input);
}

export async function getRoomBySlug(slug: string) {
  return createRoomsServices().getRoomBySlug(slug);
}

export async function getRoomMembership(input: {
  roomId: string;
  userId: string;
}) {
  return createRoomsServices().getRoomMembership(input);
}

export async function joinRoom(input: {
  actorUserId: string | null;
  roomId: string;
}) {
  return createRoomsServices().joinRoom(input);
}

export async function leaveRoom(input: {
  actorUserId: string | null;
  roomId: string;
}) {
  return createRoomsServices().leaveRoom(input);
}

export async function updateRoomDetails(input: {
  actorUserId: string | null;
  description: string | null;
  name: string;
  roomId: string;
  tagSlugs: string[];
  topic: string | null;
}) {
  return createRoomsServices().updateRoomDetails(input);
}

export type { Room, RoomMembership } from "@/modules/rooms/validation";
