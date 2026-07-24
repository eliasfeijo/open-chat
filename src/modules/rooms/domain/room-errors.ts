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

export class UnauthenticatedRoomEditorError extends Error {
  constructor() {
    super("You need to sign in to update this room.");
    this.name = "UnauthenticatedRoomEditorError";
  }
}

export class RoomUpdateForbiddenError extends Error {
  constructor(roomId: string, userId: string) {
    super(`User ${userId} cannot update room ${roomId}.`);
    this.name = "RoomUpdateForbiddenError";
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
