export type ActiveRoomTypingIndicator = {
  expiresAt: Date;
  userId: string;
};

export interface RoomTypingIndicatorStore {
  clearTypingIndicator(input: {
    roomId: string;
    userId: string;
  }): Promise<void>;
  listActiveTypingIndicators(input: {
    now: Date;
    roomId: string;
  }): Promise<ActiveRoomTypingIndicator[]>;
  setTypingIndicator(input: {
    expiresAt: Date;
    roomId: string;
    userId: string;
  }): Promise<void>;
}
