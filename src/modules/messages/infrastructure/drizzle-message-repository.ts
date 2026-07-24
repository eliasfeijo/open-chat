import { asc, eq } from "drizzle-orm";

import type { Database } from "@/db";
import { messages } from "@/db/schema";
import type { MessageRepository } from "@/modules/messages/application/ports/message-repository";
import { messageSchema } from "@/modules/messages/validation";

function mapMessage(row: typeof messages.$inferSelect) {
  return messageSchema.parse(row);
}

export function createDrizzleMessageRepository(
  database: Database,
): MessageRepository {
  return {
    async create(input) {
      const [createdMessage] = await database
        .insert(messages)
        .values({
          authorUserId: input.authorUserId,
          body: input.body,
          roomId: input.roomId,
        })
        .returning();

      return mapMessage(createdMessage);
    },

    async listByRoomId(input) {
      const roomMessages = await database.query.messages.findMany({
        limit: input.limit,
        orderBy: [asc(messages.createdAt)],
        where: eq(messages.roomId, input.roomId),
      });

      return roomMessages.map(mapMessage);
    },
  };
}
