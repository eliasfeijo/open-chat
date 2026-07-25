import { createLocalRoomSubscriptionHub } from "@/websocket/local-room-subscription-hub";

const roomSubscriptionHubKey = Symbol.for("openchat.room-subscription-hub");

type GlobalWithRoomSubscriptionHub = typeof globalThis & {
  [roomSubscriptionHubKey]?: ReturnType<typeof createLocalRoomSubscriptionHub>;
};

export function getLocalRoomSubscriptionHub() {
  const globalScope = globalThis as GlobalWithRoomSubscriptionHub;

  if (!globalScope[roomSubscriptionHubKey]) {
    globalScope[roomSubscriptionHubKey] = createLocalRoomSubscriptionHub();
  }

  return globalScope[roomSubscriptionHubKey];
}

export function getRoomMessageRealtimePublisher() {
  return getLocalRoomSubscriptionHub();
}

export function getRoomTypingRealtimePublisher() {
  return getLocalRoomSubscriptionHub();
}
