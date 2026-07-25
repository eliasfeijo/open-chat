import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";
import {
  RoomRealtimeSubscriptionForbiddenError,
  UnauthenticatedRoomRealtimeSubscriberError,
} from "@/modules/rooms/domain/room-errors";
import { authorizeRoomRealtimeSubscriptionSchema } from "@/modules/rooms/validation";

export function createAuthorizeRoomRealtimeSubscription(dependencies: {
  roomMembershipRepository: Pick<
    RoomMembershipRepository,
    "findByRoomIdAndUserId"
  >;
}) {
  return async function authorizeRoomRealtimeSubscription(input: {
    actorUserId: string | null;
    roomId: string;
  }) {
    if (!input.actorUserId) {
      throw new UnauthenticatedRoomRealtimeSubscriberError();
    }

    const command = authorizeRoomRealtimeSubscriptionSchema.parse(input);
    const membership =
      await dependencies.roomMembershipRepository.findByRoomIdAndUserId({
        roomId: command.roomId,
        userId: command.actorUserId,
      });

    if (!membership) {
      throw new RoomRealtimeSubscriptionForbiddenError(
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
