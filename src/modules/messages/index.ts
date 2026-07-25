import { getDatabase } from "@/db";
import { getRedis } from "@/lib/redis";
import { createAuthorizeRoomMessageSubscription } from "@/modules/messages/application/authorize-room-message-subscription";
import { createListRoomMessages } from "@/modules/messages/application/list-room-messages";
import { createListRoomTypingParticipants } from "@/modules/messages/application/list-room-typing-participants";
import { createPostRoomMessage } from "@/modules/messages/application/post-room-message";
import { createSetRoomTypingState } from "@/modules/messages/application/set-room-typing-state";
import { createDrizzleMessageRepository } from "@/modules/messages/infrastructure/drizzle-message-repository";
import { createRedisRoomTypingIndicatorStore } from "@/modules/messages/infrastructure/redis-room-typing-indicator-store";
import { getRoomMembership } from "@/modules/rooms";
import { createDrizzleUserProfileRepository } from "@/modules/users/infrastructure/drizzle-user-profile-repository";
import {
  getRoomMessageRealtimePublisher,
  getRoomTypingRealtimePublisher,
} from "@/websocket";

function createMessagesServices() {
  const database = getDatabase();
  const redis = getRedis();
  const messageRepository = createDrizzleMessageRepository(database);
  const roomTypingIndicatorStore = createRedisRoomTypingIndicatorStore(redis);
  const userProfileRepository = createDrizzleUserProfileRepository(database);
  const messageAuthorProfileReader = {
    async getMessageAuthorProfileByUserId(userId: string) {
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
  };
  const roomMembershipReader = {
    async getRoomMembership(input: { roomId: string; userId: string }) {
      const membership = await getRoomMembership(input);

      if (!membership) {
        return null;
      }

      return {
        role: membership.role,
      };
    },
  };
  const listRoomTypingParticipants = createListRoomTypingParticipants({
    messageAuthorProfileReader,
    roomTypingIndicatorStore,
  });

  return {
    authorizeRoomMessageSubscription: createAuthorizeRoomMessageSubscription({
      roomMembershipReader,
    }),
    listRoomMessages: createListRoomMessages({
      messageRepository,
    }),
    listRoomTypingParticipants,
    postRoomMessage: createPostRoomMessage({
      messageAuthorProfileReader,
      messageRepository,
      roomMessageRealtimePublisher: getRoomMessageRealtimePublisher(),
      roomMembershipReader,
    }),
    setRoomTypingState: createSetRoomTypingState({
      listRoomTypingParticipants,
      roomMembershipReader,
      roomTypingIndicatorStore,
      roomTypingRealtimePublisher: getRoomTypingRealtimePublisher(),
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

export async function listRoomTypingParticipants(input: { roomId: string }) {
  return createMessagesServices().listRoomTypingParticipants(input);
}

export async function postRoomMessage(input: {
  actorUserId: string | null;
  body: string;
  roomId: string;
}) {
  return createMessagesServices().postRoomMessage(input);
}

export async function setRoomTypingState(input: {
  actorUserId: string | null;
  isTyping: boolean;
  roomId: string;
}) {
  return createMessagesServices().setRoomTypingState(input);
}

export type { Message } from "@/modules/messages/validation";
