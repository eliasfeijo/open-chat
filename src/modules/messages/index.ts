import { getDatabase } from "@/db";
import { createAuthorizeRoomMessageSubscription } from "@/modules/messages/application/authorize-room-message-subscription";
import { createListRoomMessages } from "@/modules/messages/application/list-room-messages";
import { createPostRoomMessage } from "@/modules/messages/application/post-room-message";
import { createDrizzleMessageRepository } from "@/modules/messages/infrastructure/drizzle-message-repository";
import { getRoomMembership } from "@/modules/rooms";
import { createDrizzleUserProfileRepository } from "@/modules/users/infrastructure/drizzle-user-profile-repository";
import { getRoomMessageRealtimePublisher } from "@/websocket";

function createMessagesServices() {
  const database = getDatabase();
  const messageRepository = createDrizzleMessageRepository(database);
  const userProfileRepository = createDrizzleUserProfileRepository(database);

  return {
    authorizeRoomMessageSubscription: createAuthorizeRoomMessageSubscription({
      roomMembershipReader: {
        async getRoomMembership(input) {
          const membership = await getRoomMembership(input);

          if (!membership) {
            return null;
          }

          return {
            role: membership.role,
          };
        },
      },
    }),
    listRoomMessages: createListRoomMessages({
      messageRepository,
    }),
    postRoomMessage: createPostRoomMessage({
      messageAuthorProfileReader: {
        async getMessageAuthorProfileByUserId(userId) {
          const userProfile = await userProfileRepository.findById(userId);

          if (!userProfile) {
            return null;
          }

          return {
            bio: userProfile.bio,
            displayName: userProfile.displayName,
            id: userProfile.id,
            username: userProfile.username,
          };
        },
      },
      messageRepository,
      roomMessageRealtimePublisher: getRoomMessageRealtimePublisher(),
      roomMembershipReader: {
        async getRoomMembership(input) {
          const membership = await getRoomMembership(input);

          if (!membership) {
            return null;
          }

          return {
            role: membership.role,
          };
        },
      },
    }),
  };
}

export async function listRoomMessages(input: {
  limit?: number;
  roomId: string;
}) {
  return createMessagesServices().listRoomMessages(input);
}

export async function authorizeRoomMessageSubscription(input: {
  actorUserId: string | null;
  roomId: string;
}) {
  return createMessagesServices().authorizeRoomMessageSubscription(input);
}

export async function postRoomMessage(input: {
  actorUserId: string | null;
  body: string;
  roomId: string;
}) {
  return createMessagesServices().postRoomMessage(input);
}

export type { Message } from "@/modules/messages/validation";
