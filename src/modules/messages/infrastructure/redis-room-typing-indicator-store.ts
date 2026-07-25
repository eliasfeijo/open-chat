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

      const indicators = await redis.zrange<[string, number][]>(
        key,
        minimumActiveScore,
        Number.POSITIVE_INFINITY,
        {
          byScore: true,
          withScores: true,
        },
      );

      return indicators.map(([userId, expiresAt]) => ({
        expiresAt: new Date(expiresAt),
        userId,
      })) as ActiveRoomTypingIndicator[];
    },

    async setTypingIndicator({ expiresAt, roomId, userId }) {
      await redis.zadd(createRoomTypingIndicatorKey(roomId), {
        member: userId,
        score: expiresAt.getTime(),
      });
    },
  };
}
