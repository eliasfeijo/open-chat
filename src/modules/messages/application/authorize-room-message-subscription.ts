import type { RoomMembershipReader } from "@/modules/messages/application/ports/room-membership-reader";
import {
  RoomMessageSubscriberNotMemberError,
  UnauthenticatedRoomMessageSubscriberError,
} from "@/modules/messages/domain/message";
import { authorizeRoomMessageSubscriptionSchema } from "@/modules/messages/validation";

export function createAuthorizeRoomMessageSubscription(dependencies: {
  roomMembershipReader: RoomMembershipReader;
}) {
  return async function authorizeRoomMessageSubscription(input: {
    actorUserId: string | null;
    roomId: string;
  }) {
    if (!input.actorUserId) {
      throw new UnauthenticatedRoomMessageSubscriberError();
    }

    const command = authorizeRoomMessageSubscriptionSchema.parse(input);
    const membership =
      await dependencies.roomMembershipReader.getRoomMembership({
        roomId: command.roomId,
        userId: command.actorUserId,
      });

    if (!membership) {
      throw new RoomMessageSubscriberNotMemberError(
        command.roomId,
        command.actorUserId,
      );
    }

    return {
      roomId: command.roomId,
      userId: command.actorUserId,
    };
  };
}
