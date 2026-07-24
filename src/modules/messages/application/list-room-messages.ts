import type { MessageRepository } from "@/modules/messages/application/ports/message-repository";
import { listRoomMessagesSchema } from "@/modules/messages/validation";

export function createListRoomMessages(dependencies: {
  messageRepository: Pick<MessageRepository, "listByRoomId">;
}) {
  return async function listRoomMessages(input: {
    limit?: number;
    roomId: string;
  }) {
    const query = listRoomMessagesSchema.parse(input);

    return dependencies.messageRepository.listByRoomId(query);
  };
}
