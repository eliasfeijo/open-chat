export class UnauthenticatedMessageAuthorError extends Error {
  constructor() {
    super("You need to sign in to post a message.");
    this.name = "UnauthenticatedMessageAuthorError";
  }
}

export class RoomMessageAuthorNotMemberError extends Error {
  constructor(roomId: string, userId: string) {
    super(`User ${userId} must join room ${roomId} before posting messages.`);
    this.name = "RoomMessageAuthorNotMemberError";
  }
}
