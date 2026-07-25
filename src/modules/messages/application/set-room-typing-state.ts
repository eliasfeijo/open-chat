import type { RoomMembershipReader } from "@/modules/messages/application/ports/room-membership-reader";
import type { RoomTypingIndicatorStore } from "@/modules/messages/application/ports/room-typing-indicator-store";
import type {
  RoomTypingParticipant,
  RoomTypingRealtimePublisher,
} from "@/modules/messages/application/ports/room-typing-realtime-publisher";
import {
  RoomTypingActorNotMemberError,
  UnauthenticatedRoomTypingActorError,
} from "@/modules/messages/domain/message";
import { setRoomTypingStateSchema } from "@/modules/messages/validation";

const roomTypingIndicatorTtlInMilliseconds = 5_000;

export function createSetRoomTypingState(dependencies: {
  getCurrentDate?: () => Date;
  listRoomTypingParticipants: (input: {
    roomId: string;
  }) => Promise<RoomTypingParticipant[]>;
  roomMembershipReader: RoomMembershipReader;
  roomTypingIndicatorStore: RoomTypingIndicatorStore;
  roomTypingRealtimePublisher?: RoomTypingRealtimePublisher;
}) {
  return async function setRoomTypingState(input: {
    actorUserId: string | null;
    isTyping: boolean;
    roomId: string;
  }) {
    if (!input.actorUserId) {
      throw new UnauthenticatedRoomTypingActorError();
    }

    const command = setRoomTypingStateSchema.parse(input);
    const membership =
      await dependencies.roomMembershipReader.getRoomMembership({
        roomId: command.roomId,
        userId: command.actorUserId,
      });

    if (!membership) {
      throw new RoomTypingActorNotMemberError(
        command.roomId,
        command.actorUserId,
      );
    }

    if (command.isTyping) {
      const currentDate = dependencies.getCurrentDate?.() ?? new Date();
      const expiresAt = new Date(
        currentDate.getTime() + roomTypingIndicatorTtlInMilliseconds,
      );

      await dependencies.roomTypingIndicatorStore.setTypingIndicator({
        expiresAt,
        roomId: command.roomId,
        userId: command.actorUserId,
      });
    } else {
      await dependencies.roomTypingIndicatorStore.clearTypingIndicator({
        roomId: command.roomId,
        userId: command.actorUserId,
      });
    }

    const typingParticipants = await dependencies.listRoomTypingParticipants({
      roomId: command.roomId,
    });

    if (dependencies.roomTypingRealtimePublisher) {
      await dependencies.roomTypingRealtimePublisher.publishRoomTypingUpdated({
        roomId: command.roomId,
        typingParticipants,
      });
    }

    return typingParticipants;
  };
}
