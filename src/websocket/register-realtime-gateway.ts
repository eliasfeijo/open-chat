import { getServerEnv } from "@/lib/env";
import { getAuthenticatedSessionContextFromHeaders } from "@/modules/auth";
import { authorizeRoomRealtimeSubscription } from "@/modules/rooms";
import { getLocalRoomSubscriptionHub } from "@/websocket";
import {
  createRealtimeGateway,
  type RealtimeGateway,
} from "@/websocket/realtime-gateway";

const realtimeGatewayKey = Symbol.for("openchat.realtime-gateway");
const realtimeGatewayStartPromiseKey = Symbol.for(
  "openchat.realtime-gateway-start-promise",
);

type GlobalWithRealtimeGateway = typeof globalThis & {
  [realtimeGatewayKey]?: RealtimeGateway;
  [realtimeGatewayStartPromiseKey]?: Promise<void>;
};

export async function registerRealtimeGateway() {
  const globalScope = globalThis as GlobalWithRealtimeGateway;

  if (globalScope[realtimeGatewayKey]) {
    return;
  }

  if (globalScope[realtimeGatewayStartPromiseKey]) {
    await globalScope[realtimeGatewayStartPromiseKey];

    return;
  }

  globalScope[realtimeGatewayStartPromiseKey] = Promise.resolve().then(() => {
    const serverEnv = getServerEnv();

    return createRealtimeGateway({
      authenticateConnection: async (headers) => {
        const sessionContext =
          await getAuthenticatedSessionContextFromHeaders(headers);

        if (!sessionContext) {
          return null;
        }

        return {
          userId: sessionContext.user.id,
        };
      },
      authorizeRoomSubscription: authorizeRoomRealtimeSubscription,
      port: serverEnv.REALTIME_GATEWAY_PORT ?? 3001,
      roomSubscriptionHub: getLocalRoomSubscriptionHub(),
    }).then((gateway) => {
      globalScope[realtimeGatewayKey] = gateway;
    });
  });

  await globalScope[realtimeGatewayStartPromiseKey];
}
