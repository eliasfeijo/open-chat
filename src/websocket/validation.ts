import { z } from "zod";

const roomIdSchema = z.uuid();
const messageAuthorUserIdSchema = z.string().trim().min(1);
const messageBodySchema = z.string().trim().min(1).max(2000);
const isoDateTimeSchema = z.iso.datetime();

export const websocketClientSubscribeRoomSchema = z.object({
  roomId: roomIdSchema,
  type: z.literal("subscribe-room"),
});

export const websocketClientSetRoomTypingSchema = z.object({
  isTyping: z.boolean(),
  roomId: roomIdSchema,
  type: z.literal("set-room-typing"),
});

export const websocketClientMessageSchema = z.discriminatedUnion("type", [
  websocketClientSubscribeRoomSchema,
  websocketClientSetRoomTypingSchema,
]);

export const websocketRoomMessageAuthorSchema = z.object({
  bio: z.string().nullable(),
  displayName: z.string().min(1).nullable(),
  id: z.string().trim().min(1),
  username: z.string().trim().min(1).nullable(),
});

export const websocketRoomMessageSchema = z.object({
  authorUserId: messageAuthorUserIdSchema,
  body: messageBodySchema,
  createdAt: isoDateTimeSchema,
  id: z.uuid(),
  roomId: roomIdSchema,
});

export const websocketServerErrorSchema = z.object({
  message: z.string().min(1),
  type: z.literal("error"),
});

export const websocketServerSubscribedRoomSchema = z.object({
  roomId: roomIdSchema,
  type: z.literal("subscribed-room"),
});

export const websocketServerRoomPresenceUpdatedSchema = z.object({
  activeUserCount: z.number().int().min(0),
  activeUserIds: z.array(messageAuthorUserIdSchema).optional(),
  roomId: roomIdSchema,
  type: z.literal("room-presence-updated"),
});

export const websocketServerRoomTypingParticipantSchema = z.object({
  author: websocketRoomMessageAuthorSchema.nullable(),
  expiresAt: isoDateTimeSchema,
  userId: messageAuthorUserIdSchema,
});

export const websocketServerRoomTypingUpdatedSchema = z.object({
  roomId: roomIdSchema,
  type: z.literal("room-typing-updated"),
  typingParticipants: z.array(websocketServerRoomTypingParticipantSchema),
});

export const websocketServerRoomMessagePostedSchema = z.object({
  author: websocketRoomMessageAuthorSchema.nullable(),
  message: websocketRoomMessageSchema,
  type: z.literal("room-message-posted"),
});

export const websocketServerMessageSchema = z.discriminatedUnion("type", [
  websocketServerErrorSchema,
  websocketServerSubscribedRoomSchema,
  websocketServerRoomPresenceUpdatedSchema,
  websocketServerRoomTypingUpdatedSchema,
  websocketServerRoomMessagePostedSchema,
]);

export type WebSocketClientMessage = z.infer<
  typeof websocketClientMessageSchema
>;
export type WebSocketServerMessage = z.infer<
  typeof websocketServerMessageSchema
>;
