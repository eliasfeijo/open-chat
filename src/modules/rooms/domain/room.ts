import type { RoomMembership } from "@/modules/rooms/validation";

export class RoomNotFoundError extends Error {
  constructor(roomId: string) {
    super(`Room ${roomId} was not found.`);
    this.name = "RoomNotFoundError";
  }
}

export class RoomSlugAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`Room slug ${slug} is already in use.`);
    this.name = "RoomSlugAlreadyExistsError";
  }
}

export class UnauthenticatedRoomCreatorError extends Error {
  constructor() {
    super("You need to sign in to create a room.");
    this.name = "UnauthenticatedRoomCreatorError";
  }
}

export class UnauthenticatedRoomMembershipActorError extends Error {
  constructor() {
    super("You need to sign in to manage room membership.");
    this.name = "UnauthenticatedRoomMembershipActorError";
  }
}

export class RoomMembershipAlreadyExistsError extends Error {
  constructor(roomId: string, userId: string) {
    super(`User ${userId} is already a member of room ${roomId}.`);
    this.name = "RoomMembershipAlreadyExistsError";
  }
}

export class RoomMembershipNotFoundError extends Error {
  constructor(roomId: string, userId: string) {
    super(`User ${userId} is not a member of room ${roomId}.`);
    this.name = "RoomMembershipNotFoundError";
  }
}

export class RoomOwnerCannotLeaveError extends Error {
  constructor(roomId: string, userId: string) {
    super(`Owner ${userId} cannot leave room ${roomId}.`);
    this.name = "RoomOwnerCannotLeaveError";
  }
}

export function createOwnerRoomMembership(input: {
  joinedAt: Date;
  roomId: string;
  userId: string;
}): RoomMembership {
  return {
    joinedAt: input.joinedAt,
    role: "owner",
    roomId: input.roomId,
    userId: input.userId,
  };
}

export function createMemberRoomMembership(input: {
  joinedAt: Date;
  roomId: string;
  userId: string;
}): RoomMembership {
  return {
    joinedAt: input.joinedAt,
    role: "member",
    roomId: input.roomId,
    userId: input.userId,
  };
}

export function canLeaveRoom(membership: RoomMembership): boolean {
  return membership.role !== "owner";
}
