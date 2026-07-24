import type { RoomMembership } from "@/modules/rooms/validation";

export class RoomSlugAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`Room slug ${slug} is already in use.`);
    this.name = "RoomSlugAlreadyExistsError";
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
