import { getDatabase } from "@/db";
import { createListRoomMessages } from "@/modules/messages/application/list-room-messages";
import { createPostRoomMessage } from "@/modules/messages/application/post-room-message";
import { createDrizzleMessageRepository } from "@/modules/messages/infrastructure/drizzle-message-repository";
import { getRoomMembership } from "@/modules/rooms";

function createMessagesServices() {
  const messageRepository = createDrizzleMessageRepository(getDatabase());

  return {
    listRoomMessages: createListRoomMessages({
      messageRepository,
    }),
    postRoomMessage: createPostRoomMessage({
      messageRepository,
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

export async function postRoomMessage(input: {
  actorUserId: string | null;
  body: string;
  roomId: string;
}) {
  return createMessagesServices().postRoomMessage(input);
}

export type { Message } from "@/modules/messages/validation";
