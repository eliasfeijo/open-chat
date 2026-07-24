export type RoomMembershipAccess = {
  role: "member" | "owner";
};

export interface RoomMembershipReader {
  getRoomMembership(input: {
    roomId: string;
    userId: string;
  }): Promise<RoomMembershipAccess | null>;
}
