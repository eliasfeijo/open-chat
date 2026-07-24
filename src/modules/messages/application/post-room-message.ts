import type { MessageRepository } from "@/modules/messages/application/ports/message-repository";
import type { RoomMembershipReader } from "@/modules/messages/application/ports/room-membership-reader";
import {
  RoomMessageAuthorNotMemberError,
  UnauthenticatedMessageAuthorError,
} from "@/modules/messages/domain/message";
import { postRoomMessageSchema } from "@/modules/messages/validation";

export function createPostRoomMessage(dependencies: {
  messageRepository: Pick<MessageRepository, "create">;
  roomMembershipReader: RoomMembershipReader;
}) {
  return async function postRoomMessage(input: {
    actorUserId: string | null;
    body: string;
    roomId: string;
  }) {
    if (!input.actorUserId) {
      throw new UnauthenticatedMessageAuthorError();
    }

    const command = postRoomMessageSchema.parse(input);
    const membership =
      await dependencies.roomMembershipReader.getRoomMembership({
        roomId: command.roomId,
        userId: command.actorUserId,
      });

    if (!membership) {
      throw new RoomMessageAuthorNotMemberError(
        command.roomId,
        command.actorUserId,
      );
    }

    return dependencies.messageRepository.create({
      authorUserId: command.actorUserId,
      body: command.body,
      roomId: command.roomId,
    });
  };
}
