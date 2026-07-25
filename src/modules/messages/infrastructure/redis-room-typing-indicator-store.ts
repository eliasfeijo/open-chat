import type { Redis } from "@upstash/redis";

import type {
  ActiveRoomTypingIndicator,
  RoomTypingIndicatorStore,
} from "@/modules/messages/application/ports/room-typing-indicator-store";

function createRoomTypingIndicatorKey(roomId: string) {
  return `room:${roomId}:typing`;
}

export function createRedisRoomTypingIndicatorStore(
  redis: Redis,
): RoomTypingIndicatorStore {
  return {
    async clearTypingIndicator({ roomId, userId }) {
      await redis.zrem(createRoomTypingIndicatorKey(roomId), userId);
    },

    async listActiveTypingIndicators({ now, roomId }) {
      const key = createRoomTypingIndicatorKey(roomId);
      const minimumActiveScore = now.getTime();

      await redis.zremrangebyscore(key, 0, minimumActiveScore - 1);

      const indicators = await redis.zrange<Array<string | number>>(
        key,
        minimumActiveScore,
        "+inf",
        {
          byScore: true,
          withScores: true,
        },
      );

      const activeIndicators: ActiveRoomTypingIndicator[] = [];

      for (let index = 0; index < indicators.length; index += 2) {
        const userId = indicators[index];
        const expiresAt = indicators[index + 1];

        if (typeof userId !== "string" || typeof expiresAt !== "number") {
          continue;
        }

        activeIndicators.push({
          expiresAt: new Date(expiresAt),
          userId,
        });
      }

      return activeIndicators;
    },

    async setTypingIndicator({ expiresAt, roomId, userId }) {
      await redis.zadd(createRoomTypingIndicatorKey(roomId), {
        member: userId,
        score: expiresAt.getTime(),
      });
    },
  };
}
