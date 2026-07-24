import type {
  ListRoomMessagesInput,
  Message,
} from "@/modules/messages/validation";

export type CreateMessageRecordInput = {
  authorUserId: string;
  body: string;
  roomId: string;
};

export interface MessageRepository {
  create(input: CreateMessageRecordInput): Promise<Message>;
  listByRoomId(input: ListRoomMessagesInput): Promise<Message[]>;
}
