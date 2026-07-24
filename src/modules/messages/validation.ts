import { z } from "zod";

export const messageIdSchema = z.uuid();

export const messageRoomIdSchema = z.uuid();

export const messageAuthorUserIdSchema = z.string().trim().min(1);

export const messageBodySchema = z
  .string()
  .trim()
  .min(1, {
    message: "Message body must not be empty.",
  })
  .max(2000, {
    message: "Message body must be at most 2000 characters long.",
  });

export const messageSchema = z.object({
  authorUserId: messageAuthorUserIdSchema,
  body: messageBodySchema,
  createdAt: z.date(),
  id: messageIdSchema,
  roomId: messageRoomIdSchema,
});

export const postRoomMessageSchema = z.object({
  actorUserId: messageAuthorUserIdSchema,
  body: messageBodySchema,
  roomId: messageRoomIdSchema,
});

export const listRoomMessagesSchema = z.object({
  limit: z.number().int().positive().max(100).default(50),
  roomId: messageRoomIdSchema,
});

export type ListRoomMessagesInput = z.infer<typeof listRoomMessagesSchema>;
export type Message = z.infer<typeof messageSchema>;
export type PostRoomMessageInput = z.infer<typeof postRoomMessageSchema>;
