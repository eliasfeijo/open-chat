import type { RoomMembership } from "@/modules/rooms/validation";

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
