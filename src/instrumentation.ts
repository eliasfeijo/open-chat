export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { registerRealtimeGateway } =
    await import("@/websocket/register-realtime-gateway");

  await registerRealtimeGateway();
}
