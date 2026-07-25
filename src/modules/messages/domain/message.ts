export class UnauthenticatedMessageAuthorError extends Error {
  constructor() {
    super("You need to sign in to post a message.");
    this.name = "UnauthenticatedMessageAuthorError";
  }
}

export class UnauthenticatedRoomMessageSubscriberError extends Error {
  constructor() {
    super("You need to sign in to subscribe to room messages.");
    this.name = "UnauthenticatedRoomMessageSubscriberError";
  }
}

export class RoomMessageAuthorNotMemberError extends Error {
  constructor(roomId: string, userId: string) {
    super(`User ${userId} must join room ${roomId} before posting messages.`);
    this.name = "RoomMessageAuthorNotMemberError";
  }
}

export class RoomMessageSubscriberNotMemberError extends Error {
  constructor(roomId: string, userId: string) {
    super(
      `User ${userId} must join room ${roomId} before subscribing to realtime messages.`,
    );
    this.name = "RoomMessageSubscriberNotMemberError";
  }
}

export class UnauthenticatedRoomTypingActorError extends Error {
  constructor() {
    super("You need to sign in to send room typing activity.");
    this.name = "UnauthenticatedRoomTypingActorError";
  }
}

export class RoomTypingActorNotMemberError extends Error {
  constructor(roomId: string, userId: string) {
    super(
      `User ${userId} must join room ${roomId} before sending typing activity.`,
    );
    this.name = "RoomTypingActorNotMemberError";
  }
}
