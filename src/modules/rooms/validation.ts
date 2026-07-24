import { z } from "zod";

export const roomIdSchema = z.uuid();

export const roomOwnerUserIdSchema = z.string().trim().min(1);

export const roomNameSchema = z
  .string()
  .trim()
  .min(3, {
    message: "Room name must be at least 3 characters long.",
  })
  .max(80, {
    message: "Room name must be at most 80 characters long.",
  });

export const roomSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, {
    message: "Room slug must be at least 3 characters long.",
  })
  .max(48, {
    message: "Room slug must be at most 48 characters long.",
  })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      "Room slug can only contain lowercase letters, numbers, and single hyphens.",
  });

export const roomDescriptionSchema = z
  .string()
  .trim()
  .max(280, {
    message: "Room description must be at most 280 characters long.",
  })
  .transform((value) => (value === "" ? null : value));

export const roomTopicSchema = z
  .string()
  .trim()
  .max(120, {
    message: "Room topic must be at most 120 characters long.",
  })
  .transform((value) => (value === "" ? null : value));

export const roomMemberRoleSchema = z.enum(["owner", "member"]);

export const roomSchema = z.object({
  createdAt: z.date(),
  description: roomDescriptionSchema,
  id: roomIdSchema,
  name: roomNameSchema,
  ownerUserId: roomOwnerUserIdSchema,
  slug: roomSlugSchema,
  topic: roomTopicSchema,
  updatedAt: z.date(),
});

export const roomMembershipSchema = z.object({
  joinedAt: z.date(),
  role: roomMemberRoleSchema,
  roomId: roomIdSchema,
  userId: roomOwnerUserIdSchema,
});

export const createRoomSchema = z.object({
  actorUserId: roomOwnerUserIdSchema,
  description: roomDescriptionSchema,
  name: roomNameSchema,
  slug: roomSlugSchema,
  topic: roomTopicSchema,
});

export const getRoomBySlugSchema = z.object({
  slug: roomSlugSchema,
});

export const getRoomMembershipSchema = z.object({
  roomId: roomIdSchema,
  userId: roomOwnerUserIdSchema,
});

export const joinRoomSchema = z.object({
  actorUserId: roomOwnerUserIdSchema,
  roomId: roomIdSchema,
});

export const leaveRoomSchema = z.object({
  actorUserId: roomOwnerUserIdSchema,
  roomId: roomIdSchema,
});

export const listRoomsSchema = z.object({
  limit: z.number().int().positive().max(50).default(20),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type GetRoomBySlugInput = z.infer<typeof getRoomBySlugSchema>;
export type GetRoomMembershipInput = z.infer<typeof getRoomMembershipSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type LeaveRoomInput = z.infer<typeof leaveRoomSchema>;
export type ListRoomsInput = z.infer<typeof listRoomsSchema>;
export type Room = z.infer<typeof roomSchema>;
export type RoomMemberRole = z.infer<typeof roomMemberRoleSchema>;
export type RoomMembership = z.infer<typeof roomMembershipSchema>;
